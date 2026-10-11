const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Category = require('../models/Category');

dotenv.config();

const defaultCategories = [
  { name: 'Technical Support', description: 'Software glitches, login errors, and bug reports' },
  { name: 'Billing & Accounts', description: 'Invoices, payments, refunds, and subscription issues' },
  { name: 'Infrastructure', description: 'Hardware, server downtime, and network connectivity' },
  { name: 'Customer Service', description: 'Service quality, staff interactions, and policy inquiries' },
  { name: 'Security & Access', description: 'Password resets, 2FA, permission requests, and security alerts' },
];

const seedCategories = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be configured to seed categories into the intended database.');
  }

  await connectDB();

  let inserted = 0;
  for (const category of defaultCategories) {
    const result = await Category.updateOne(
      { name: category.name },
      { $setOnInsert: category },
      { upsert: true }
    );
    inserted += result.upsertedCount;
  }

  console.log(`[Seed] Categories ready: ${inserted} inserted, ${defaultCategories.length - inserted} already existed.`);
};

seedCategories()
  .catch((error) => {
    console.error('[Seed Error]:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
