/**
 * Seed jobs from crawled data into MongoDB
 *
 * Usage: node server/seed/seed-jobs.js
 *        node server/seed/seed-jobs.js --drop      # drop existing first
 *        node server/seed/seed-jobs.js --dry-run   # preview without inserting
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Job = require('../models/Job');

const args = process.argv.slice(2);
const DROP = args.includes('--drop');
const DRY_RUN = args.includes('--dry-run');

function parseKboardDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.trim().split('.');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 9, 0, 0);
  }
  return new Date(dateStr);
}

async function main() {
  console.log('=== Job Seed Script ===');
  console.log(`Database: ${process.env.MONGO_URI || 'mongodb://localhost:27108/is-web'}`);

  if (DRY_RUN) console.log('DRY RUN mode - no data will be written\n');

  // jobs-seed.json (crawl-jobs.js 출력) 우선, 없으면 jobs-2024-seed.json 폴백
  const filePath = fs.existsSync(path.join(__dirname, 'jobs-seed.json'))
    ? path.join(__dirname, 'jobs-seed.json')
    : path.join(__dirname, 'jobs-2024-seed.json');

  if (!fs.existsSync(filePath)) {
    console.error('jobs-seed.json (또는 jobs-2024-seed.json) not found');
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`Loaded ${rawData.length} jobs from ${path.basename(filePath)}\n`);

  const jobs = rawData.map((post, i) => ({
    title: post.title,
    company: post.company,
    content: post.content || '',
    category: post.category || '채용',
    deadline: post.deadline ? parseKboardDate(post.deadline) : undefined,
    link: post.link || '',
    views: post.views || 0,
    isActive: true,
    order: rawData.length - i,
    attachments: (post.attachments || [])
      .filter((a) => a.localPath)
      .map((a) => ({
        filename: a.fileName.replace(/[/\\?%*:|"<>]/g, '_'),
        originalName: a.fileName,
        path: a.localPath, // seed/attachments-jobs/... (migrate-images.js Stage D로 /uploads/files/jobs/로 이동)
        size: 0,
      })),
    createdAt: parseKboardDate(post.date),
    updatedAt: parseKboardDate(post.date),
  }));

  if (DRY_RUN) {
    console.log('Preview (all jobs):');
    for (const j of jobs) {
      console.log(`  [${j.createdAt.toISOString().slice(0, 10)}] [${j.category}] ${j.company} - ${j.title}`);
    }
    console.log(`\nTotal: ${jobs.length} jobs`);
    console.log('Dry run complete. Run without --dry-run to insert.');
    return;
  }

  const uri = process.env.MONGO_URI || 'mongodb://localhost:27108/is-web';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  if (DROP) {
    const count = await Job.countDocuments();
    console.log(`Dropping ${count} existing jobs...`);
    await Job.deleteMany({});
  }

  let inserted = 0;
  let skipped = 0;

  for (const jobData of jobs) {
    const existing = await Job.findOne({ title: jobData.title, createdAt: jobData.createdAt });
    if (existing) {
      skipped++;
      continue;
    }
    const job = new Job(jobData);
    job.createdAt = jobData.createdAt;
    job.updatedAt = jobData.updatedAt;
    await job.save();
    inserted++;
  }

  console.log(`\nDone! Inserted: ${inserted}, Skipped (duplicates): ${skipped}`);
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
