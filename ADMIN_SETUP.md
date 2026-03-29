# Admin & User Management Setup

## System Overview

This system is designed for **administrators and teachers only**. Students do not have login access. All student data is managed by authorized staff through the dashboard.

## User Roles

### 1. **Admin**
- Full system access
- Can manage teachers, students, batches, subjects
- Can view analytics and reports
- Access to all CRUD operations

### 2. **Teacher**
- Can manage their assigned students
- Can mark attendance
- Can enter marks/grades
- Can view their batch/subject data

### 3. **Student** (No Login)
- Students are managed as records only
- Each student has a unique Student ID (auto-generated: GWC20250001)
- No login credentials needed
- Data managed by admins/teachers

## Initial Admin Setup

### Option 1: Manual Database Entry
```javascript
// Use MongoDB shell or Compass to create first admin
db.users.insertOne({
  username: "admin",
  email: "admin@globalwingcharity.org",
  password: "$2a$10$...", // Hash using bcrypt
  firstName: "Global Wing",
  lastName: "Admin",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Option 2: Backend Seed Script
Create a seed script in `backend/scripts/seedAdmin.js`:

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function seedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const adminExists = await User.findOne({ role: 'admin' });
  if (adminExists) {
    console.log('Admin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  await User.create({
    username: 'admin',
    email: 'admin@globalwingcharity.org',
    password: hashedPassword,
    firstName: 'Global Wing',
    lastName: 'Admin',
    role: 'admin',
    isActive: true
  });
  
  console.log('Admin created successfully');
  process.exit(0);
}

seedAdmin();
```

Run: `node backend/scripts/seedAdmin.js`

## Adding Students

### Method 1: Through Dashboard (Recommended)
1. Login as admin/teacher
2. Navigate to **Dashboard → Students**
3. Click **"Add Student"** button
4. Fill in student details:
   - First Name, Last Name
   - Email (optional, for communication)
   - Date of Birth
   - Gender
   - Phone Number (optional)
   - Address (optional)
5. Student ID is auto-generated (e.g., GWC20250001)
6. Click **"Add Student"**

### Method 2: Bulk Import via CSV (Future Feature)
```csv
firstName,lastName,email,dateOfBirth,gender,phone,address
John,Doe,john@example.com,2010-05-15,Male,1234567890,123 Main St
Jane,Smith,jane@example.com,2011-08-20,Female,0987654321,456 Oak Ave
```

## Adding Teachers

### Temporary Solution (Manual via Database)
```javascript
db.users.insertOne({
  username: "teacher1",
  email: "teacher1@globalwingcharity.org",
  password: "$2a$10$...", // Hash the password
  firstName: "Sarah",
  lastName: "Johnson",
  role: "teacher",
  isActive: true,
  subjects: [], // IDs of assigned subjects
  batches: []   // IDs of assigned batches
})
```

### Future Enhancement: Teacher Management Page
Create an admin-only page to add/manage teachers directly through the dashboard.

## Student ID Generation

Student IDs follow this format:
- **Prefix**: `GWC` (Global Wing Charity)
- **Year**: Current year (2025, 2026, etc.)
- **Sequential Number**: 4 digits (0001, 0002, etc.)
- **Example**: `GWC20250001`, `GWC20250002`

The backend automatically generates this when creating a student.

## Workflow

### For Admins:
1. **Setup** → Create admin account
2. **Add Teachers** → Create teacher accounts manually
3. **Create Batches** → Define class batches
4. **Add Subjects** → Create subjects/courses
5. **Add Students** → Register students through dashboard
6. **Assign** → Link students to batches

### For Teachers:
1. **Login** → Access teacher dashboard
2. **View Students** → See assigned students
3. **Mark Attendance** → Daily attendance tracking
4. **Enter Marks** → Record exam results
5. **View Reports** → Check student progress

## Security Notes

- ✅ No public registration endpoint
- ✅ Only admins can create users
- ✅ Students don't need passwords
- ✅ JWT authentication for admin/teacher access
- ✅ Role-based authorization
- ✅ Protected API routes

## Access Levels

| Feature | Admin | Teacher | Student |
|---------|-------|---------|---------|
| Dashboard | ✅ | ✅ | ❌ |
| Add Students | ✅ | ✅ | ❌ |
| Edit Students | ✅ | ✅ (own) | ❌ |
| Delete Students | ✅ | ❌ | ❌ |
| Mark Attendance | ✅ | ✅ | ❌ |
| Enter Marks | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ (limited) | ❌ |
| Manage Batches | ✅ | ❌ | ❌ |
| Manage Subjects | ✅ | ❌ | ❌ |

## Default Credentials (After Setup)

```
Admin Login:
Username: admin
Password: Admin@123

(Change this immediately after first login!)
```

## Next Steps

1. ✅ Remove registration page from frontend
2. ✅ Update login page messaging
3. ⏳ Create admin seed script
4. ⏳ Add bulk student import feature
5. ⏳ Create teacher management page
6. ⏳ Implement role-based UI restrictions

## Support

For initial setup assistance or issues:
- Contact: admin@globalwingcharity.org
- Documentation: /docs
