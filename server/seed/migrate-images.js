/**
 * Image & Attachment Migration Script
 *
 * Migrates external (is.hanyang.ac.kr) images and local seed attachments
 * to the unified server/uploads/ directory structure.
 *
 * 4 stages:
 *   A) Model images (Faculty, Lab, Staff, HeroSlide, StudentCouncil)
 *   B) Notice attachments (seed/attachments/ → uploads/files/notices/)
 *   C) Notice inline images (HTML content with is.hanyang.ac.kr URLs)
 *   D) Job attachments (seed/attachments-jobs/ → uploads/files/jobs/)
 *
 * Usage:
 *   node server/seed/migrate-images.js              # actual migration
 *   node server/seed/migrate-images.js --dry-run     # preview only
 *
 * Requirements:
 *   - MongoDB must be running with seeded data
 *   - Run from project root
 */

const mongoose = require('mongoose');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Models
const Faculty = require('../models/Faculty');
const Lab = require('../models/Lab');
const Staff = require('../models/Staff');
const HeroSlide = require('../models/HeroSlide');
const StudentCouncil = require('../models/StudentCouncil');
const Notice = require('../models/Notice');
const Job = require('../models/Job');

const DRY_RUN = process.argv.includes('--dry-run');

const UPLOADS_BASE = path.join(__dirname, '..', 'uploads');
const EXTERNAL_DOMAIN = 'is.hanyang.ac.kr';

const stats = {
  downloaded: 0,
  copied: 0,
  updated: 0,
  skipped: 0,
  errors: [],
};

// ─── Utilities ───────────────────────────────────────────────────────

/**
 * Download a file from a URL to a local path.
 * Returns true on success, false on failure.
 */
function downloadFile(url, destPath) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const encodedUrl = encodeURI(decodeURI(url));

    protocol.get(encodedUrl, { timeout: 15000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirect
        downloadFile(res.headers.location, destPath).then(resolve);
        return;
      }

      if (res.statusCode !== 200) {
        stats.errors.push(`HTTP ${res.statusCode} for ${url}`);
        resolve(false);
        return;
      }

      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(true);
      });
      fileStream.on('error', (err) => {
        stats.errors.push(`Write error for ${url}: ${err.message}`);
        resolve(false);
      });
    }).on('error', (err) => {
      stats.errors.push(`Download error for ${url}: ${err.message}`);
      resolve(false);
    }).on('timeout', function () {
      this.destroy();
      stats.errors.push(`Timeout for ${url}`);
      resolve(false);
    });
  });
}

/**
 * Extract a clean filename from a URL.
 * Decodes URI components and strips WordPress dimension suffixes like -1024x683.
 */
function extractFilename(url) {
  try {
    const urlPath = new URL(url).pathname;
    let filename = decodeURIComponent(path.basename(urlPath));

    // Strip WordPress elementor hash suffixes: name-hash.ext → name.ext
    // e.g. 박현석-교수-p92w4k8h9cho1mvcu08vd42jlby1x1bz2ofqixtz40.jpg → 박현석-교수.jpg
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    const cleanBase = base.replace(/-[a-z0-9]{20,}$/, '');

    // Strip WordPress dimension suffixes: name-1024x683.ext → name.ext
    const finalBase = cleanBase.replace(/-\d+x\d+$/, '');

    return finalBase + ext;
  } catch {
    return path.basename(url);
  }
}

/**
 * Ensure a unique filename in a directory by appending -2, -3, etc.
 */
function uniqueFilename(dir, filename) {
  let dest = path.join(dir, filename);
  if (!fs.existsSync(dest)) return filename;

  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  let counter = 2;
  while (fs.existsSync(path.join(dir, `${base}-${counter}${ext}`))) {
    counter++;
  }
  return `${base}-${counter}${ext}`;
}

/**
 * Check if a path is already a local uploads path.
 */
function isLocalPath(p) {
  return p && p.startsWith('/uploads/');
}

// ─── Stage A: Model Images ──────────────────────────────────────────

async function migrateModelImages() {
  console.log('\n━━━ Stage A: Model Images ━━━');

  const collections = [
    { model: Faculty, name: 'faculty', folder: 'faculty' },
    { model: Lab, name: 'labs', folder: 'labs' },
    { model: Staff, name: 'staff', folder: 'staff' },
    { model: HeroSlide, name: 'hero-slides', folder: 'hero-slides' },
  ];

  for (const { model, name, folder } of collections) {
    const destDir = path.join(UPLOADS_BASE, 'images', folder);

    // Find documents with external image URLs
    const docs = await model.find({
      image: { $regex: EXTERNAL_DOMAIN, $options: 'i' },
    });

    if (docs.length === 0) {
      console.log(`  ${name}: no external images found`);
      continue;
    }

    console.log(`  ${name}: ${docs.length} documents with external images`);

    for (const doc of docs) {
      const filename = uniqueFilename(destDir, extractFilename(doc.image));
      const destPath = path.join(destDir, filename);
      const newUrl = `/uploads/images/${folder}/${filename}`;

      if (DRY_RUN) {
        console.log(`    [DRY] ${doc.name || doc.title || doc._id}`);
        console.log(`      ${doc.image}`);
        console.log(`      → ${newUrl}`);
        stats.skipped++;
        continue;
      }

      const ok = await downloadFile(doc.image, destPath);
      if (ok) {
        doc.image = newUrl;
        await doc.save();
        stats.downloaded++;
        stats.updated++;
        console.log(`    ✓ ${doc.name || doc.title || doc._id} → ${filename}`);
      }
    }
  }

  // StudentCouncil: top-level image + members[].image
  const councils = await StudentCouncil.find({});
  for (const council of councils) {
    let changed = false;

    // Top-level image
    if (council.image && council.image.includes(EXTERNAL_DOMAIN)) {
      const destDir = path.join(UPLOADS_BASE, 'images', 'student-council');
      const filename = uniqueFilename(destDir, extractFilename(council.image));
      const destPath = path.join(destDir, filename);
      const newUrl = `/uploads/images/student-council/${filename}`;

      if (DRY_RUN) {
        console.log(`    [DRY] StudentCouncil image → ${newUrl}`);
        stats.skipped++;
      } else {
        const ok = await downloadFile(council.image, destPath);
        if (ok) {
          council.image = newUrl;
          changed = true;
          stats.downloaded++;
          console.log(`    ✓ StudentCouncil image → ${filename}`);
        }
      }
    }

    // Members images
    for (let i = 0; i < council.members.length; i++) {
      const member = council.members[i];
      if (member.image && member.image.includes(EXTERNAL_DOMAIN)) {
        const destDir = path.join(UPLOADS_BASE, 'images', 'student-council');
        const filename = uniqueFilename(destDir, extractFilename(member.image));
        const destPath = path.join(destDir, filename);
        const newUrl = `/uploads/images/student-council/${filename}`;

        if (DRY_RUN) {
          console.log(`    [DRY] Member "${member.name}" image → ${newUrl}`);
          stats.skipped++;
        } else {
          const ok = await downloadFile(member.image, destPath);
          if (ok) {
            council.members[i].image = newUrl;
            changed = true;
            stats.downloaded++;
            console.log(`    ✓ Member "${member.name}" → ${filename}`);
          }
        }
      }
    }

    if (changed) {
      council.markModified('members');
      await council.save();
      stats.updated++;
    }
  }
}

// ─── Stage B: Notice Attachments ─────────────────────────────────────

async function migrateNoticeAttachments() {
  console.log('\n━━━ Stage B: Notice Attachments ━━━');

  const destDir = path.join(UPLOADS_BASE, 'files', 'notices');

  // Find notices with seed/attachments/ paths
  const notices = await Notice.find({
    'attachments.path': { $regex: /^seed\/attachments\// },
  });

  if (notices.length === 0) {
    console.log('  No notices with seed attachment paths found');
    return;
  }

  console.log(`  ${notices.length} notices with seed attachment paths`);

  for (const notice of notices) {
    let changed = false;

    for (let i = 0; i < notice.attachments.length; i++) {
      const att = notice.attachments[i];
      if (!att.path || !att.path.startsWith('seed/attachments/')) continue;
      if (isLocalPath(att.path)) continue; // already migrated

      const srcPath = path.join(__dirname, '..', att.path);
      const filename = uniqueFilename(destDir, att.originalName || att.filename || path.basename(att.path));
      const destPath = path.join(destDir, filename);
      const newPath = `/uploads/files/notices/${filename}`;

      if (DRY_RUN) {
        const exists = fs.existsSync(srcPath);
        console.log(`    [DRY] ${att.originalName || att.filename}${exists ? '' : ' (source missing!)'}`);
        console.log(`      ${att.path} → ${newPath}`);
        stats.skipped++;
        continue;
      }

      if (!fs.existsSync(srcPath)) {
        stats.errors.push(`Source not found: ${srcPath}`);
        continue;
      }

      try {
        await fsp.copyFile(srcPath, destPath);
        notice.attachments[i].path = newPath;
        changed = true;
        stats.copied++;
        console.log(`    ✓ ${filename}`);
      } catch (err) {
        stats.errors.push(`Copy error for ${att.path}: ${err.message}`);
      }
    }

    if (changed) {
      notice.markModified('attachments');
      await notice.save();
      stats.updated++;
    }
  }
}

// ─── Stage C: Notice Inline Images ──────────────────────────────────

async function migrateNoticeInlineImages() {
  console.log('\n━━━ Stage C: Notice Inline Images ━━━');

  const destDir = path.join(UPLOADS_BASE, 'images', 'notices');

  // Find notices with WordPress image URLs in content
  const notices = await Notice.find({
    content: { $regex: `${EXTERNAL_DOMAIN}/wp-content/uploads`, $options: 'i' },
  });

  if (notices.length === 0) {
    console.log('  No notices with inline external images found');
    return;
  }

  console.log(`  ${notices.length} notices with inline external images`);

  // Regex to match image URLs in HTML content
  const imgUrlRegex = /https?:\/\/is\.hanyang\.ac\.kr\/wp-content\/uploads\/[^\s"'<>)]+/gi;

  for (const notice of notices) {
    const urls = [...new Set(notice.content.match(imgUrlRegex) || [])];

    if (urls.length === 0) continue;

    let content = notice.content;
    let changed = false;

    console.log(`  "${notice.title.substring(0, 40)}..." — ${urls.length} image(s)`);

    for (const url of urls) {
      const filename = uniqueFilename(destDir, extractFilename(url));
      const destPath = path.join(destDir, filename);
      const newUrl = `/uploads/images/notices/${filename}`;

      if (DRY_RUN) {
        console.log(`    [DRY] ${url}`);
        console.log(`      → ${newUrl}`);
        stats.skipped++;
        continue;
      }

      const ok = await downloadFile(url, destPath);
      if (ok) {
        // Replace all occurrences of this URL in the content
        content = content.split(url).join(newUrl);
        changed = true;
        stats.downloaded++;
        console.log(`    ✓ ${filename}`);
      }
    }

    if (changed) {
      notice.content = content;
      await notice.save();
      stats.updated++;
    }
  }
}

// ─── Stage D: Job Attachments ────────────────────────────────────────

async function migrateJobAttachments() {
  console.log('\n━━━ Stage D: Job Attachments ━━━');

  const destDir = path.join(UPLOADS_BASE, 'files', 'jobs');
  if (!DRY_RUN) fs.mkdirSync(destDir, { recursive: true });

  // Find jobs with seed/attachments-jobs/ paths
  const jobs = await Job.find({
    'attachments.path': { $regex: /^seed\/attachments-jobs\// },
  });

  if (jobs.length === 0) {
    console.log('  No jobs with seed attachment paths found');
    return;
  }

  console.log(`  ${jobs.length} jobs with seed attachment paths`);

  for (const job of jobs) {
    let changed = false;

    for (let i = 0; i < job.attachments.length; i++) {
      const att = job.attachments[i];
      if (!att.path || !att.path.startsWith('seed/attachments-jobs/')) continue;
      if (isLocalPath(att.path)) continue;

      const srcPath = path.join(__dirname, '..', att.path);
      const filename = uniqueFilename(destDir, att.originalName || att.filename || path.basename(att.path));
      const destPath = path.join(destDir, filename);
      const newPath = `/uploads/files/jobs/${filename}`;

      if (DRY_RUN) {
        const exists = fs.existsSync(srcPath);
        console.log(`    [DRY] ${att.originalName || att.filename}${exists ? '' : ' (source missing!)'}`);
        console.log(`      ${att.path} → ${newPath}`);
        stats.skipped++;
        continue;
      }

      if (!fs.existsSync(srcPath)) {
        stats.errors.push(`Source not found: ${srcPath}`);
        continue;
      }

      try {
        await fsp.copyFile(srcPath, destPath);
        job.attachments[i].path = newPath;
        changed = true;
        stats.copied++;
        console.log(`    ✓ ${filename}`);
      } catch (err) {
        stats.errors.push(`Copy error for ${att.path}: ${err.message}`);
      }
    }

    if (changed) {
      job.markModified('attachments');
      await job.save();
      stats.updated++;
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Image & Attachment Migration Script  ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`Database: ${process.env.MONGO_URI || 'mongodb://localhost:27108/is-web'}`);
  if (DRY_RUN) {
    console.log('🔍 DRY RUN mode — no files will be written or DB updated');
  }

  const uri = process.env.MONGO_URI || 'mongodb://localhost:27108/is-web';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await migrateModelImages();
  await migrateNoticeAttachments();
  await migrateNoticeInlineImages();
  await migrateJobAttachments();

  // Summary
  console.log('\n━━━ Summary ━━━');
  if (DRY_RUN) {
    console.log(`  Would process: ${stats.skipped} items`);
  } else {
    console.log(`  Downloaded: ${stats.downloaded} files`);
    console.log(`  Copied: ${stats.copied} files`);
    console.log(`  DB records updated: ${stats.updated}`);
  }

  if (stats.errors.length > 0) {
    console.log(`\n  Errors (${stats.errors.length}):`);
    stats.errors.forEach((e) => console.log(`    ✗ ${e}`));
  } else {
    console.log('  Errors: none');
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
