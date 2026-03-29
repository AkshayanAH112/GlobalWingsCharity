const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/globalwingcharity';

const sampleTeachers = [
  {
    username: 'teacher1',
    email: 'sarah.johnson@globalwingcharity.org',
    password: 'Teacher@123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'teacher'
  },
  {
    username: 'teacher2',
    email: 'michael.chen@globalwingcharity.org',
    password: 'Teacher@123',
    firstName: 'Michael',
    lastName: 'Chen',
    role: 'teacher'
  },
  {
    username: 'teacher3',
    email: 'emily.davis@globalwingcharity.org',
    password: 'Teacher@123',
    firstName: 'Emily',
    lastName: 'Davis',
    role: 'teacher'
  }
];

async function seedTeachers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Creating teacher accounts...\n');

    for (const teacherData of sampleTeachers) {
      // Check if teacher already exists
      const exists = await User.findOne({ email: teacherData.email });
      
      if (exists) {
        console.log(`⚠️  Teacher ${teacherData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(teacherData.password, 10);

      // Create teacher
      const teacher = await User.create({
        ...teacherData,
        password: hashedPassword,
        isActive: true
      });

      console.log(`✅ Created: ${teacher.firstName} ${teacher.lastName}`);
      console.log(`   Email: ${teacher.email}`);
      console.log(`   Username: ${teacher.username}`);
      console.log(`   Password: ${teacherData.password}\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Teacher seeding completed!');
    console.log('⚠️  Please ask teachers to change their passwords after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating teachers:', error);
    process.exit(1);
  }
}

// Run the seed function
seedTeachers();
