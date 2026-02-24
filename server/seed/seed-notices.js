/**
 * Seed notices from crawled data into MongoDB
 *
 * Usage: node server/seed/seed-notices.js
 *
 * Loads all available seed files:
 *   - notices-seed.json       → category: '학과'
 *   - grad-notices-seed.json  → category: '대학원'
 *   - archive-notices-seed.json → category: '자료실'
 *
 * Options:
 *   --drop    Drop existing notices before seeding
 *   --dry-run Print what would be inserted without actually inserting
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Notice = require('../models/Notice');

const SEED_FILES = [
  { file: 'notices-seed.json', category: '학과' },
  { file: 'grad-notices-seed.json', category: '대학원' },
  { file: 'archive-notices-seed.json', category: '자료실' },
];

const args = process.argv.slice(2);
const DROP = args.includes('--drop');
const DRY_RUN = args.includes('--dry-run');

function parseKboardDate(dateStr) {
  // Format: "2024.03.15"
  const parts = dateStr.trim().split('.');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 9, 0, 0);
  }
  return new Date(dateStr);
}

async function main() {
  console.log('=== Notice Seed Script ===');
  console.log(`Database: ${process.env.MONGO_URI || 'mongodb://localhost:27108/is-web'}`);

  if (DRY_RUN) {
    console.log('DRY RUN mode - no data will be written\n');
  }

  // Read all seed files
  const allNotices = [];
  for (const { file, category } of SEED_FILES) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${file} (not found)`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`Loaded ${data.length} notices from ${file} (category: ${category})`);
    for (const post of data) {
      post._category = category;
    }
    allNotices.push(...data);
  }

  if (allNotices.length === 0) {
    console.error('No seed files found. Run crawl-notices.js and/or crawl-all.js first.');
    process.exit(1);
  }
  console.log(`Total: ${allNotices.length} notices\n`);

  if (!DRY_RUN) {
    // Connect to MongoDB
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27108/is-web';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    if (DROP) {
      const count = await Notice.countDocuments();
      console.log(`Dropping ${count} existing notices...`);
      await Notice.deleteMany({});
    }
  }

  // Prepare notices
  const notices = allNotices.map((post) => {
    // Build attachments array
    const attachments = (post.attachments || []).map((att) => {
      let fileSize = 0;
      if (att.localPath) {
        const fullPath = path.join(__dirname, '..', att.localPath);
        try {
          const stat = fs.statSync(fullPath);
          fileSize = stat.size;
        } catch {
          // file may not exist
        }
      }

      return {
        filename: att.fileName,
        originalName: att.fileName,
        path: att.localPath || att.originalUrl,
        size: fileSize,
      };
    });

    return {
      title: post.title,
      content: post.content || post.contentText || '',
      category: post._category || post.category || '학과',
      author: post.author || '정보시스템학과',
      attachments,
      views: post.views || 0,
      isPinned: post.isPinned || false,
      isActive: true,
      createdAt: parseKboardDate(post.date),
      updatedAt: parseKboardDate(post.date),
    };
  });

  if (DRY_RUN) {
    console.log('\nSample notices (first 3):');
    for (const notice of notices.slice(0, 3)) {
      console.log(`  [${notice.createdAt.toISOString().slice(0, 10)}] ${notice.title}`);
      console.log(`    Pinned: ${notice.isPinned}, Attachments: ${notice.attachments.length}`);
      if (notice.attachments.length > 0) {
        notice.attachments.forEach((a) => console.log(`      - ${a.originalName}`));
      }
    }
    console.log(`\n... and ${notices.length - 3} more notices`);
    console.log('\nDry run complete. Run without --dry-run to insert.');
  } else {
    // Insert notices
    console.log(`\nInserting ${notices.length} notices...`);

    let inserted = 0;
    let skipped = 0;

    for (const noticeData of notices) {
      try {
        // Check for duplicate by title and date
        const existing = await Notice.findOne({
          title: noticeData.title,
          createdAt: noticeData.createdAt,
        });

        if (existing) {
          skipped++;
          continue;
        }

        const notice = new Notice(noticeData);
        // Override timestamps
        notice.createdAt = noticeData.createdAt;
        notice.updatedAt = noticeData.updatedAt;
        await notice.save();
        inserted++;
      } catch (err) {
        console.error(`  Error inserting "${noticeData.title}": ${err.message}`);
      }
    }

    console.log(`\nDone! Inserted: ${inserted}, Skipped (duplicates): ${skipped}`);
  }

  if (!DRY_RUN) {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
