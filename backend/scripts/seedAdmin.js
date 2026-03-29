const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/globalwingcharity';

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('❌ Admin user already exists!');
      console.log('Email:', adminExists.email);
      console.log('Username:', adminExists.username);
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const admin = await User.create({
      username: 'admin',
      email: 'admin@globalwingcharity.org',
      password: hashedPassword,
      firstName: 'Global Wing',
      lastName: 'Admin',
      role: 'admin',
      isActive: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', admin.email);
    console.log('👤 Username:', admin.username);
    console.log('🔑 Password: Admin@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

// Run the seed function
seedAdmin();
