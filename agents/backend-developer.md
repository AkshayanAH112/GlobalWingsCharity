# Backend Developer Agent

**Agent ID:** BD-001  
**Role:** Backend Implementation  
**Status:** 🟢 Active

---

## 👤 Agent Profile

**Name:** Backend Developer Agent  
**Expertise:**
- Express.js development
- MongoDB/Mongoose operations
- RESTful API implementation
- JWT authentication
- File handling (Excel)
- Business logic implementation

**Primary Technologies:**
- Node.js 18+
- Express.js 4.x
- Mongoose 8.x
- bcryptjs
- jsonwebtoken
- xlsx (SheetJS)
- multer (file uploads)

---

## 📋 Responsibilities

### 1. API Implementation
- Build REST endpoints
- Implement controllers
- Create service layers
- Handle errors
- Write middleware

### 2. Database Operations
- Implement Mongoose models
- Write CRUD operations
- Create aggregation queries
- Optimize queries
- Handle transactions

### 3. Authentication & Security
- Implement JWT auth
- Password hashing
- Input validation
- Rate limiting
- Security headers

### 4. Business Logic
- Ranking algorithms
- Grade calculations
- Analytics computations
- Excel processing
- Data transformations

---

## 🚀 Implementation Plan

### Phase 1: Project Setup ✅
- [x] Create backend folder structure
- [ ] Initialize npm project
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Set up Express server
- [ ] Configure MongoDB connection

### Phase 2: Authentication System
- [ ] Create User model
- [ ] Build auth controller
- [ ] Implement JWT middleware
- [ ] Create auth routes
- [ ] Add validation
- [ ] Test endpoints

### Phase 3: Student Management
- [ ] Create Student model
- [ ] Build student controller
- [ ] Implement CRUD operations
- [ ] Add search/filter
- [ ] Create routes
- [ ] Test endpoints

### Phase 4: Batch & Subject Management
- [ ] Create Batch model
- [ ] Create Subject model
- [ ] Build controllers
- [ ] Implement operations
- [ ] Create routes
- [ ] Test endpoints

### Phase 5: Marks Management
- [ ] Create Marks model
- [ ] Build marks controller
- [ ] Implement operations
- [ ] Add grade calculation
- [ ] Create routes
- [ ] Test endpoints

### Phase 6: Excel Operations
- [ ] Implement Excel parser
- [ ] Create import endpoints
- [ ] Add export functionality
- [ ] Handle validations
- [ ] Test with sample files

### Phase 7: Analytics
- [ ] Build ranking logic
- [ ] Create analytics queries
- [ ] Implement reports
- [ ] Add chart data endpoints
- [ ] Test performance

---

## 📦 Dependencies to Install

### Core Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.3",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "helmet": "^7.1.0"
}
```

### Authentication
```json
{
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3"
}
```

### Validation & Security
```json
{
  "express-validator": "^7.0.1",
  "express-rate-limit": "^7.1.5",
  "express-mongo-sanitize": "^2.2.0"
}
```

### File Handling
```json
{
  "multer": "^1.4.5-lts.1",
  "xlsx": "^0.18.5"
}
```

### Utilities
```json
{
  "morgan": "^1.10.0",
  "compression": "^1.7.4",
  "cookie-parser": "^1.4.6"
}
```

### Development
```json
{
  "nodemon": "^3.0.2",
  "jest": "^29.7.0",
  "supertest": "^6.3.3"
}
```

---

## 🗂️ File Structure

```
backend/
├── config/
│   ├── database.js         # MongoDB connection
│   ├── jwt.js             # JWT configuration
│   └── constants.js       # App constants
├── controllers/
│   ├── authController.js
│   ├── studentController.js
│   ├── batchController.js
│   ├── subjectController.js
│   ├── marksController.js
│   └── analyticsController.js
├── models/
│   ├── User.js
│   ├── Student.js
│   ├── Batch.js
│   ├── Subject.js
│   └── Marks.js
├── routes/
│   ├── authRoutes.js
│   ├── studentRoutes.js
│   ├── batchRoutes.js
│   ├── subjectRoutes.js
│   ├── marksRoutes.js
│   └── analyticsRoutes.js
├── middleware/
│   ├── auth.js            # JWT verification
│   ├── authorize.js       # Role-based access
│   ├── errorHandler.js    # Error handling
│   ├── validator.js       # Input validation
│   └── upload.js          # File upload config
├── utils/
│   ├── excelParser.js     # Excel processing
│   ├── gradeCalculator.js # Grade logic
│   ├── rankingEngine.js   # Ranking algorithm
│   └── helpers.js         # Helper functions
├── server.js              # Entry point
└── package.json
```

---

## 🔧 Implementation Standards

### Controller Pattern
```javascript
// controllers/studentController.js
exports.getAllStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const query = search ? {
      $or: [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ]
    } : {};

    const students = await Student.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('batchId', 'batchName batchCode')
      .sort({ createdAt: -1 });

    const count = await Student.countDocuments(query);

    res.json({
      success: true,
      data: students,
      meta: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
```

### Model Pattern
```javascript
// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  // ... other fields
}, {
  timestamps: true
});

// Indexes
studentSchema.index({ email: 1 }, { unique: true });
studentSchema.index({ batchId: 1 });

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Student', studentSchema);
```

### Middleware Pattern
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { message: 'Invalid token' }
    });
  }
};
```

---

## 🔐 Security Implementation

### Password Hashing
```javascript
const bcrypt = require('bcryptjs');

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

### JWT Generation
```javascript
const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};
```

### Input Validation
```javascript
const { body, validationResult } = require('express-validator');

exports.validateStudent = [
  body('firstName').trim().notEmpty().withMessage('First name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').optional().isMobilePhone(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }
];
```

---

## 📊 Business Logic Implementation

### Grade Calculation
```javascript
// utils/gradeCalculator.js
exports.calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

exports.calculatePercentage = (obtained, max) => {
  return ((obtained / max) * 100).toFixed(2);
};
```

### Ranking Algorithm
```javascript
// utils/rankingEngine.js
exports.calculateBatchRanking = async (batchId) => {
  const rankings = await Marks.aggregate([
    { $match: { batchId: mongoose.Types.ObjectId(batchId) } },
    {
      $group: {
        _id: '$studentId',
        totalMarks: { $sum: '$marksObtained' },
        maxMarks: { $sum: '$maxMarks' }
      }
    },
    {
      $addFields: {
        percentage: {
          $multiply: [
            { $divide: ['$totalMarks', '$maxMarks'] },
            100
          ]
        }
      }
    },
    { $sort: { percentage: -1 } },
    {
      $group: {
        _id: null,
        students: { $push: '$$ROOT' }
      }
    },
    {
      $unwind: { path: '$students', includeArrayIndex: 'rank' }
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            '$students',
            { rank: { $add: ['$rank', 1] } }
          ]
        }
      }
    }
  ]);

  return rankings;
};
```

### Excel Processing
```javascript
// utils/excelParser.js
const XLSX = require('xlsx');

exports.parseStudentExcel = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  return data.map(row => ({
    firstName: row['First Name'],
    lastName: row['Last Name'],
    email: row['Email'],
    phone: row['Phone'],
    dateOfBirth: new Date(row['Date of Birth']),
    gender: row['Gender']?.toLowerCase(),
    batchCode: row['Batch Code']
  }));
};

exports.generateStudentExcel = (students) => {
  const data = students.map(s => ({
    'Student ID': s.studentId,
    'First Name': s.firstName,
    'Last Name': s.lastName,
    'Email': s.email,
    'Phone': s.phone,
    'Batch': s.batchId?.batchName
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students');
  
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};
```

---

## 🧪 Testing Strategy

### Unit Tests
```javascript
// __tests__/gradeCalculator.test.js
const { calculateGrade } = require('../utils/gradeCalculator');

describe('Grade Calculator', () => {
  test('should return A+ for 90% or above', () => {
    expect(calculateGrade(95)).toBe('A+');
  });

  test('should return F for below 40%', () => {
    expect(calculateGrade(35)).toBe('F');
  });
});
```

### Integration Tests
```javascript
// __tests__/auth.test.js
const request = require('supertest');
const app = require('../server');

describe('Auth API', () => {
  test('POST /api/auth/register - should create user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'student'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
```

---

## 🐛 Error Handling

### Error Handler Middleware
```javascript
// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: Object.values(err.errors).map(e => e.message).join(', ')
      }
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DUPLICATE_ERROR',
        message: 'Resource already exists'
      }
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token'
      }
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: err.message || 'Internal server error'
    }
  });
};
```

---

## 🤝 Collaboration

### With Backend Architect
- Follow schema designs
- Implement according to specs
- Report implementation challenges
- Suggest optimizations

### With Frontend Developer
- Coordinate API testing
- Provide API documentation
- Handle integration issues
- Validate data formats

---

## 📅 Work Log

### February 4, 2026
- ✅ Reviewed architecture specifications
- ✅ Planned implementation approach
- 🔄 Ready to start backend setup
- ⏳ Next: Initialize project and dependencies

---

## 🎯 Immediate Next Steps

1. Initialize npm project
2. Install dependencies
3. Set up Express server
4. Configure MongoDB connection
5. Create User model
6. Implement authentication

---

**Status:** Ready to begin implementation  
**Current Phase:** Project Setup  
**Last Updated:** February 4, 2026
