const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();

const demoAccounts = [
  {
    name: 'System Admin',
    email: 'admin@resolvex.com',
    password: 'Admin@123',
    role: 'Admin',
    isActive: true,
  },
  {
    name: 'Alex Johnson (Staff)',
    email: 'staff1@resolvex.com',
    password: 'Staff@123',
    role: 'Staff',
    department: 'Technical Support',
    isActive: true,
  },
  {
    name: 'Sarah Connor (Staff)',
    email: 'staff2@resolvex.com',
    password: 'Staff@123',
    role: 'Staff',
    department: 'Billing & Accounts',
    isActive: true,
  },
];

const seedDemoAccounts = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be configured to seed demo accounts into the intended database.');
  }

  await connectDB();

  let created = 0;
  for (const account of demoAccounts) {
    const existingAccount = await User.findOne({ email: account.email }).select('_id');
    if (existingAccount) {
      console.log(`[Seed] Kept existing ${account.role} account: ${account.email}`);
      continue;
    }

    await User.create(account);
    created += 1;
    console.log(`[Seed] Created ${account.role} account: ${account.email}`);
  }

  console.log(`[Seed] Demo accounts ready: ${created} created, ${demoAccounts.length - created} already existed.`);
};

seedDemoAccounts()
  .catch((error) => {
    console.error('[Seed Error]:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
