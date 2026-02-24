/**
 * Seed faculty from crawled data into MongoDB
 *
 * Usage: node server/seed/seed-faculty.js
 *
 * Options:
 *   --drop    Drop existing faculty before seeding
 *   --dry-run Print what would be inserted without actually inserting
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Faculty = require('../models/Faculty');

const SEED_FILE = path.join(__dirname, 'faculty-seed.json');

const args = process.argv.slice(2);
const DROP = args.includes('--drop');
const DRY_RUN = args.includes('--dry-run');

async function main() {
  console.log('=== Faculty Seed Script ===');
  console.log(`Database: ${process.env.MONGO_URI || 'mongodb://localhost:27108/is-web'}`);

  if (DRY_RUN) {
    console.log('DRY RUN mode - no data will be written\n');
  }

  if (!fs.existsSync(SEED_FILE)) {
    console.error(`Seed file not found: ${SEED_FILE}`);
    console.error('Run crawl-faculty.js first.');
    process.exit(1);
  }

  const seedData = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
  console.log(`Loaded ${seedData.length} faculty from seed file\n`);

  if (!DRY_RUN) {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27108/is-web';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    if (DROP) {
      const count = await Faculty.countDocuments();
      console.log(`Dropping ${count} existing faculty...`);
      await Faculty.deleteMany({});
    }
  }

  // Prepare faculty entries
  const facultyList = seedData.map((prof, index) => ({
    name: prof.name,
    position: prof.position,
    category: prof.category,
    title: prof.title || '',
    email: prof.email || '',
    phone: prof.phone || '',
    office: prof.location || '',
    image: prof.image || '',
    homepage: prof.homepage || '',
    researchAreas: Array.isArray(prof.researchAreas) ? prof.researchAreas : [],
    isActive: true,
    order: index + 1,
  }));

  if (DRY_RUN) {
    console.log('\nFaculty to seed:');
    let currentCategory = '';
    for (const f of facultyList) {
      if (f.category !== currentCategory) {
        currentCategory = f.category;
        console.log(`\n--- ${currentCategory} ---`);
      }
      console.log(`  ${f.order}. ${f.name} (${f.position}) - ${f.email}`);
      if (f.researchAreas.length > 0) {
        console.log(`     Research: ${f.researchAreas.join(', ').substring(0, 80)}`);
      }
    }
    console.log('\nDry run complete. Run without --dry-run to insert.');
  } else {
    console.log(`\nInserting ${facultyList.length} faculty...`);

    let inserted = 0;
    let skipped = 0;

    for (const data of facultyList) {
      try {
        const existing = await Faculty.findOne({
          name: data.name,
          category: data.category,
        });
        if (existing) {
          skipped++;
          continue;
        }

        const faculty = new Faculty(data);
        await faculty.save();
        inserted++;
        console.log(`  + ${data.name} (${data.position})`);
      } catch (err) {
        console.error(`  Error inserting "${data.name}": ${err.message}`);
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
