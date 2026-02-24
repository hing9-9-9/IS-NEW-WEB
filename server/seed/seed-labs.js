/**
 * Seed labs from crawled data into MongoDB
 *
 * Usage: node server/seed/seed-labs.js
 *
 * Options:
 *   --drop    Drop existing labs before seeding
 *   --dry-run Print what would be inserted without actually inserting
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Lab = require('../models/Lab');

const SEED_FILE = path.join(__dirname, 'labs-seed.json');

const args = process.argv.slice(2);
const DROP = args.includes('--drop');
const DRY_RUN = args.includes('--dry-run');

// Professor mapping (from existing department data)
const PROFESSOR_MAP = {
  'Bio Informatics Lab.': 'Arne Holger Kutzner',
  'Data and Business Intelligence Lab.': '김은찬',
  'Future Intelligence Lab.': '박현석',
  'Information System Lab.': '이욱',
  'Security and Privacy Lab.': '오현옥',
};

async function main() {
  console.log('=== Lab Seed Script ===');
  console.log(`Database: ${process.env.MONGO_URI || 'mongodb://localhost:27108/is-web'}`);

  if (DRY_RUN) {
    console.log('DRY RUN mode - no data will be written\n');
  }

  if (!fs.existsSync(SEED_FILE)) {
    console.error(`Seed file not found: ${SEED_FILE}`);
    console.error('Run crawl-all.js first.');
    process.exit(1);
  }

  const seedData = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
  console.log(`Loaded ${seedData.length} labs from seed file\n`);

  if (!DRY_RUN) {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27108/is-web';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    if (DROP) {
      const count = await Lab.countDocuments();
      console.log(`Dropping ${count} existing labs...`);
      await Lab.deleteMany({});
    }
  }

  // Prepare labs (sorted alphabetically by English name)
  const labs = seedData
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
    .map((lab, index) => ({
      name: lab.nameKo || lab.name,
      nameEn: lab.name,
      professor: PROFESSOR_MAP[lab.name] || '미정',
      description: lab.descriptionKo || lab.descriptionEn || '',
      website: lab.website || '',
      image: lab.image || '',
      isActive: true,
      order: index + 1,
    }));

  if (DRY_RUN) {
    console.log('\nLabs to seed:');
    for (const lab of labs) {
      console.log(`  ${lab.order}. ${lab.nameEn} (${lab.name})`);
      console.log(`     Professor: ${lab.professor}`);
      console.log(`     Website: ${lab.website}`);
    }
    console.log('\nDry run complete. Run without --dry-run to insert.');
  } else {
    console.log(`\nInserting ${labs.length} labs...`);

    let inserted = 0;
    let skipped = 0;

    for (const labData of labs) {
      try {
        const existing = await Lab.findOne({ nameEn: labData.nameEn });
        if (existing) {
          skipped++;
          continue;
        }

        const lab = new Lab(labData);
        await lab.save();
        inserted++;
        console.log(`  + ${labData.nameEn}`);
      } catch (err) {
        console.error(`  Error inserting "${labData.nameEn}": ${err.message}`);
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
