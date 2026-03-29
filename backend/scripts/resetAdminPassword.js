const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/globalwingscharity';

async function resetAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ username: 'admin' });
    
    if (!admin) {
      console.log('❌ No admin user found!');
      console.log('Run: npm run seed:admin');
      process.exit(1);
    }

    // Reset password to Admin@123
    const newPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update directly in database to bypass pre-save hook
    await User.updateOne(
      { username: 'admin' },
      { $set: { password: hashedPassword } }
    );
    
    console.log('✅ Admin password reset successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Username:', admin.username);
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: Admin@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Verify the password by fetching fresh from DB
    const updatedAdmin = await User.findOne({ username: 'admin' }).select('+password');
    const isMatch = await bcrypt.compare(newPassword, updatedAdmin.password);
    console.log('✅ Password verification:', isMatch ? 'SUCCESS' : 'FAILED');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAdminPassword();
