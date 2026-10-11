const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Complaint = require('../models/Complaint');

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Complaint.deleteMany({});

    console.log('[Seed] Creating Categories...');
    const categories = await Category.insertMany([
      { name: 'Technical Support', description: 'Software glitches, login errors, and bug reports' },
      { name: 'Billing & Accounts', description: 'Invoices, payments, refunds, and subscription issues' },
      { name: 'Infrastructure', description: 'Hardware, server downtime, and network connectivity' },
      { name: 'Customer Service', description: 'Service quality, staff interactions, and policy inquiries' },
      { name: 'Security & Access', description: 'Password resets, 2FA, permission requests, and security alerts' },
    ]);

    console.log('[Seed] Creating Users (Admin, Staff, Users)...');
    
    // Admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@resolvex.com',
      password: 'Admin@123',
      role: 'Admin',
      isActive: true,
    });

    // Staff
    const staff1 = await User.create({
      name: 'Alex Johnson (Staff)',
      email: 'staff1@resolvex.com',
      password: 'Staff@123',
      role: 'Staff',
      department: 'Technical Support',
      isActive: true,
    });

    const staff2 = await User.create({
      name: 'Sarah Connor (Staff)',
      email: 'staff2@resolvex.com',
      password: 'Staff@123',
      role: 'Staff',
      department: 'Billing & Accounts',
      isActive: true,
    });

    // End Users
    const user1 = await User.create({
      name: 'John Doe',
      email: 'user1@resolvex.com',
      password: 'User@123',
      role: 'User',
      isActive: true,
    });

    const user2 = await User.create({
      name: 'Jane Smith',
      email: 'user2@resolvex.com',
      password: 'User@123',
      role: 'User',
      isActive: true,
    });

    console.log('[Seed] Creating Sample Complaints...');
    
    // Complaint 1 - Submitted
    await Complaint.create({
      complaintId: 'RES-2026-1001',
      title: 'VPN Connection dropping constantly during work hours',
      description: 'The secure remote VPN client disconnects every 15 minutes whenever accessing internal dev servers.',
      category: 'Infrastructure',
      priority: 'High',
      status: 'Submitted',
      createdBy: user1._id,
      comments: [
        {
          author: user1._id,
          message: 'This is blocking my daily code deployments. Please assist ASAP.',
        },
      ],
    });

    // Complaint 2 - Assigned
    await Complaint.create({
      complaintId: 'RES-2026-1002',
      title: 'Incorrect billing charge on March invoice',
      description: 'I was charged twice for the Enterprise subscription tier on invoice #INV-8834.',
      category: 'Billing & Accounts',
      priority: 'Urgent',
      status: 'Assigned',
      createdBy: user2._id,
      assignedTo: staff2._id,
      comments: [
        {
          author: user2._id,
          message: 'Attached screenshot of duplicate bank transactions.',
        },
        {
          author: admin._id,
          message: `Assigned complaint to staff member: ${staff2.name} (Billing & Accounts)`,
          isInternal: true,
        },
      ],
    });

    // Complaint 3 - In Progress
    await Complaint.create({
      complaintId: 'RES-2026-1003',
      title: 'Dashboard loading extremely slow on Firefox browser',
      description: 'Analytics widgets take up to 20 seconds to render data on Firefox 124 Linux build.',
      category: 'Technical Support',
      priority: 'Medium',
      status: 'In Progress',
      createdBy: user1._id,
      assignedTo: staff1._id,
      comments: [
        {
          author: user1._id,
          message: 'Tested on Chrome and it works fine, only happening on Firefox.',
        },
        {
          author: staff1._id,
          message: 'Investigating web assembly bundle compatibility in Gecko engine.',
        },
      ],
    });

    // Complaint 4 - Resolved (with feedback)
    await Complaint.create({
      complaintId: 'RES-2026-1004',
      title: 'Unable to reset password via email link',
      description: 'The password reset token email was not arriving in inbox or spam folder.',
      category: 'Security & Access',
      priority: 'High',
      status: 'Resolved',
      createdBy: user2._id,
      assignedTo: staff1._id,
      resolutionNotes: 'Updated SMTP relay parameters and re-queued reset email token. Verified user successfully reset password.',
      resolvedAt: new Date(Date.now() - 3600000 * 24),
      feedback: {
        rating: 5,
        comment: 'Super fast response time! Alex resolved it in under 30 minutes.',
        submittedAt: new Date(),
      },
      comments: [
        {
          author: staff1._id,
          message: 'Status updated to [Resolved]. Note: SMTP relay configuration updated.',
        },
      ],
    });

    console.log('[Seed] Database seeded successfully!');
    console.log('\n--- Default Test Accounts ---');
    console.log('ADMIN: admin@resolvex.com / Admin@123');
    console.log('STAFF 1: staff1@resolvex.com / Staff@123');
    console.log('STAFF 2: staff2@resolvex.com / Staff@123');
    console.log('USER 1: user1@resolvex.com / User@123');
    console.log('USER 2: user2@resolvex.com / User@123');
    console.log('-----------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
