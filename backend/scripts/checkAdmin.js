const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/globalwingscharity';

async function checkAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ username: 'admin' }).select('+password');
    
    if (!admin) {
      console.log('❌ No admin user found!');
      console.log('Run: npm run seed:admin');
      process.exit(1);
    }

    console.log('✅ Admin user found:');
    console.log('ID:', admin._id);
    console.log('Username:', admin.username);
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Active:', admin.isActive);
    console.log('Password hash length:', admin.password?.length);
    
    // Test password comparison
    const testPassword = 'Admin@123';
    console.log('\nTesting password: Admin@123');
    
    try {
      const isMatch = await admin.comparePassword(testPassword);
      console.log('Password match:', isMatch);
      
      if (!isMatch) {
        // Try direct bcrypt compare
        const directMatch = await bcrypt.compare(testPassword, admin.password);
        console.log('Direct bcrypt match:', directMatch);
      }
    } catch (error) {
      console.log('Error comparing password:', error.message);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdmin();
