/**
 * Image Re-download Script
 *
 * Use after migrate-images.js if downloads failed.
 * Re-crawls is.hanyang.ac.kr to find faculty image URLs,
 * then downloads them to paths already stored in MongoDB.
 *
 * Usage: node server/seed/redownload-images.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const cheerio = require('cheerio');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Faculty = require('../models/Faculty');

const BASE_URL = 'http://is.hanyang.ac.kr';
const UPLOADS_BASE = path.join(__dirname, '..', 'uploads');

// ── Utilities ─────────────────────────────────────────────────────────

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { rejectUnauthorized: false, timeout: 15000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redir = res.headers.location.startsWith('/')
          ? BASE_URL + res.headers.location
          : res.headers.location;
        return fetchUrl(redir).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject).on('timeout', function () {
      this.destroy();
      reject(new Error(`Timeout: ${url}`));
    });
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const encoded = encodeURI(decodeURI(url));
    mod.get(encoded, { rejectUnauthorized: false, timeout: 15000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redir = res.headers.location.startsWith('/')
          ? BASE_URL + res.headers.location
          : res.headers.location;
        return downloadFile(redir, destPath).then(resolve);
      }
      if (res.statusCode !== 200) {
        console.error(`  HTTP ${res.statusCode} for ${url}`);
        resolve(false);
        return;
      }
      const stream = fs.createWriteStream(destPath);
      res.pipe(stream);
      stream.on('finish', () => { stream.close(); resolve(true); });
      stream.on('error', (err) => { console.error(`  Write error: ${err.message}`); resolve(false); });
    }).on('error', (err) => {
      console.error(`  Download error: ${err.message}`);
      resolve(false);
    }).on('timeout', function () {
      this.destroy();
      console.error(`  Timeout: ${url}`);
      resolve(false);
    });
  });
}

// ── Crawl faculty page for name → imageUrl mapping ────────────────────

async function crawlFacultyImages() {
  const url = `${BASE_URL}/%ED%95%99%EA%B3%BC%EC%86%8C%EA%B0%9C/%EA%B5%90%EC%88%98%EC%A7%84-%EC%86%8C%EA%B0%9C`;
  console.log('Crawling:', url);

  const html = (await fetchUrl(url)).toString('utf-8');
  const $ = cheerio.load(html);
  const map = {}; // name → imageUrl

  // .professor-card based
  $('.professor-card').each(function () {
    const h3 = $(this).find('.card-header h3').text().trim();
    const match = h3.match(/^(.+?)\s*(교수|부교수|조교수)$/);
    const name = match ? match[1].trim() : h3;
    const src = $(this).find('.card-content img').attr('src') || '';
    if (name && src) map[name] = src;
  });

  // Elementor img[alt*=교수] based
  $('img').each(function () {
    const alt = $(this).attr('alt') || '';
    if (!alt.includes('교수') && !alt.includes('조교수')) return;
    const src = $(this).attr('src') || '';
    if (!src) return;
    let name = alt.replace(/[-_]/g, ' ').replace(/\s*(교수|부교수|조교수)\s*사진?/g, '').trim();
    if (name && src && !map[name]) map[name] = src;
  });

  console.log(`Found ${Object.keys(map).length} image URLs on site:`);
  Object.entries(map).forEach(([n, u]) => console.log(`  ${n}: ${u.substring(0, 80)}`));
  return map;
}

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════╗');
  console.log('║  Image Re-download Script        ║');
  console.log('╚══════════════════════════════════╝\n');

  const uri = process.env.MONGO_URI || 'mongodb://localhost:27108/is-web';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB\n');

  // 1. Get faculty from DB that have local image paths but missing files
  const faculty = await Faculty.find({ image: /^\/uploads\// });
  console.log(`Faculty with local image paths in DB: ${faculty.length}`);

  const missing = faculty.filter((f) => {
    const localPath = path.join(__dirname, '..', f.image);
    return !fs.existsSync(localPath);
  });
  console.log(`Missing files: ${missing.length}`);

  if (missing.length === 0) {
    console.log('All images already exist. Nothing to do.');
    await mongoose.disconnect();
    return;
  }

  missing.forEach((f) => console.log(`  Missing: ${f.name} → ${f.image}`));

  // 2. Crawl site for current image URLs
  console.log('\nCrawling site for image URLs...');
  const siteMap = await crawlFacultyImages();

  // 3. Download missing images
  console.log('\nDownloading missing images...');
  let downloaded = 0;
  let failed = 0;

  for (const doc of missing) {
    // Match by name (try exact, then partial)
    let srcUrl = siteMap[doc.name];
    if (!srcUrl) {
      // Try partial match (e.g. "박현석" in key)
      const key = Object.keys(siteMap).find((k) => k.includes(doc.name) || doc.name.includes(k));
      srcUrl = key ? siteMap[key] : null;
    }

    const destPath = path.join(__dirname, '..', doc.image);

    if (!srcUrl) {
      console.log(`  ✗ ${doc.name}: no matching URL found on site`);
      failed++;
      continue;
    }

    // Ensure URL is absolute
    const absUrl = srcUrl.startsWith('http') ? srcUrl : BASE_URL + srcUrl;
    console.log(`  Downloading ${doc.name}...`);
    const ok = await downloadFile(absUrl, destPath);
    if (ok) {
      console.log(`  ✓ ${doc.name} → ${path.basename(destPath)}`);
      downloaded++;
    } else {
      console.log(`  ✗ ${doc.name}: download failed`);
      failed++;
    }
  }

  console.log(`\n━━━ Summary ━━━`);
  console.log(`  Downloaded: ${downloaded}`);
  console.log(`  Failed:     ${failed}`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
