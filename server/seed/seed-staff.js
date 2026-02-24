/**
 * Staff Seed Script
 *
 * Usage: node server/seed/seed-staff.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Staff = require('../models/Staff');

const SEED_FILE = path.join(__dirname, 'staff-seed.json');

async function main() {
  console.log('=== Staff Seeder ===\n');

  // Connect to MongoDB
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27108/is-web';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB:', mongoUri);

  // Load seed data
  const seedData = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
  console.log(`Loaded ${seedData.length} staff from ${SEED_FILE}`);

  // Clear existing staff
  await Staff.deleteMany({});
  console.log('Cleared existing staff');

  // Insert seed data
  const inserted = await Staff.insertMany(seedData);
  console.log(`Inserted ${inserted.length} staff`);

  await mongoose.disconnect();
  console.log('\n✅ Staff seeding completed');
}

main().catch((err) => {
  console.error('Error seeding staff:', err);
  process.exit(1);
});
