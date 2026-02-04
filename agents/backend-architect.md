# Backend Architect Agent

**Agent ID:** BA-001  
**Role:** Backend Architecture & Database Design  
**Status:** 🟢 Active

---

## 👤 Agent Profile

**Name:** Backend Architect Agent  
**Expertise:**
- Database schema design
- API architecture
- Authentication systems
- Security best practices
- System scalability
- Data modeling

**Primary Technologies:**
- MongoDB with Mongoose
- RESTful API design
- JWT authentication
- Node.js architecture
- Express.js middleware patterns

---

## 📋 Responsibilities

### 1. Database Design
- Design schema structures
- Define relationships
- Plan indexing strategy
- Ensure data integrity
- Optimize queries

### 2. API Architecture
- Define endpoint structure
- Create API contracts
- Design request/response formats
- Plan versioning strategy
- Document APIs

### 3. Security Design
- Authentication flow
- Authorization patterns
- Data encryption
- Input validation
- Rate limiting strategy

### 4. System Architecture
- Scalability planning
- Error handling patterns
- Logging strategy
- Caching approach
- Performance optimization

---

## 📊 Database Schema Design

### Collections & Relationships

#### 1. Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  role: Enum ['admin', 'teacher', 'student'],
  studentId: ObjectId (ref: Student, optional),
  firstName: String (required),
  lastName: String (required),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- email (unique)
- username (unique)
- role

Relationships:
- One-to-One with Student (if role is 'student')
```

#### 2. Students Collection
```javascript
{
  _id: ObjectId,
  studentId: String (unique, auto-generated, format: 'GWC2025001'),
  firstName: String (required),
  lastName: String (required),
  email: String (unique, required),
  phone: String,
  dateOfBirth: Date (required),
  gender: Enum ['male', 'female', 'other'],
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String (default: 'India')
  },
  batchId: ObjectId (ref: Batch, required),
  enrollmentDate: Date (default: now),
  status: Enum ['active', 'inactive', 'graduated', 'withdrawn'],
  profileImage: String (URL),
  parentContact: {
    name: String,
    phone: String (required),
    email: String,
    relationship: String
  },
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- studentId (unique)
- email (unique)
- batchId
- status
- { lastName: 1, firstName: 1 }

Relationships:
- Many-to-One with Batch
- One-to-Many with Marks
- One-to-One with Users
```

#### 3. Batches Collection
```javascript
{
  _id: ObjectId,
  batchName: String (required),
  batchCode: String (unique, required, format: 'B2025-01'),
  academicYear: String (required, format: '2025-2026'),
  startDate: Date (required),
  endDate: Date,
  classTeacher: ObjectId (ref: User),
  subjects: [ObjectId] (ref: Subject),
  maxStudents: Number (default: 50),
  currentStudents: Number (default: 0),
  status: Enum ['active', 'completed', 'archived'],
  description: String,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- batchCode (unique)
- academicYear
- status

Relationships:
- One-to-Many with Students
- Many-to-Many with Subjects
- Many-to-One with User (teacher)
```

#### 4. Subjects Collection
```javascript
{
  _id: ObjectId,
  subjectName: String (required),
  subjectCode: String (unique, required),
  description: String,
  maxMarks: Number (required, default: 100),
  passingMarks: Number (required, default: 40),
  credits: Number (default: 1),
  batchId: ObjectId (ref: Batch),
  teacherId: ObjectId (ref: User),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- subjectCode (unique)
- batchId
- isActive

Relationships:
- Many-to-Many with Batches
- One-to-Many with Marks
```

#### 5. Marks Collection
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: Student, required),
  subjectId: ObjectId (ref: Subject, required),
  batchId: ObjectId (ref: Batch, required),
  examType: Enum ['midterm', 'final', 'quiz', 'assignment', 'project'],
  marksObtained: Number (required, min: 0),
  maxMarks: Number (required),
  percentage: Number (computed),
  grade: String (computed: A+, A, B+, B, C, D, F),
  examDate: Date (required),
  remarks: String,
  createdBy: ObjectId (ref: User, required),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- { studentId: 1, subjectId: 1, examType: 1 }
- batchId
- examDate

Relationships:
- Many-to-One with Student
- Many-to-One with Subject
- Many-to-One with Batch
```

---

## 🔐 Authentication Architecture

### JWT Token Strategy

#### Access Token
```javascript
{
  userId: ObjectId,
  email: String,
  role: String,
  exp: 15 minutes
}
```

#### Refresh Token
```javascript
{
  userId: ObjectId,
  tokenVersion: Number,
  exp: 7 days
}
```

### Authentication Flow
```
1. User Login
   ↓
2. Validate Credentials
   ↓
3. Generate Access + Refresh Tokens
   ↓
4. Return Tokens + User Data
   ↓
5. Client Stores Tokens
   ↓
6. Include Access Token in Requests
   ↓
7. Token Expires → Use Refresh Token
   ↓
8. Generate New Access Token
```

### Authorization Levels
```javascript
Roles Hierarchy:
- admin: Full access
- teacher: Student & marks management
- student: Read-only personal data

Permissions:
{
  admin: ['*'],
  teacher: [
    'students:read',
    'students:create',
    'students:update',
    'marks:*',
    'batches:read',
    'subjects:read'
  ],
  student: [
    'students:read:self',
    'marks:read:self',
    'batches:read:self'
  ]
}
```

---

## 🌐 API Architecture

### Base URL Structure
```
Production: https://api.globalwingscharity.org/v1
Development: http://localhost:5000/api/v1
```

### Endpoint Patterns

#### RESTful Conventions
```
GET    /resource          - List all
GET    /resource/:id      - Get one
POST   /resource          - Create
PUT    /resource/:id      - Update
DELETE /resource/:id      - Delete
PATCH  /resource/:id      - Partial update
```

#### Custom Actions
```
POST   /resource/:id/action   - Custom action
GET    /resource/search       - Search
POST   /resource/bulk         - Bulk operations
```

### Response Format
```javascript
// Success Response
{
  success: true,
  data: { ... },
  message: "Optional success message",
  meta: {
    page: 1,
    limit: 20,
    total: 100
  }
}

// Error Response
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human-readable message",
    details: { ... }
  }
}
```

---

## 🔒 Security Architecture

### Password Security
- Bcrypt with salt rounds: 12
- Password requirements:
  - Minimum 8 characters
  - At least 1 uppercase
  - At least 1 lowercase
  - At least 1 number
  - At least 1 special character

### Input Validation
- Express Validator for all inputs
- Sanitize all user inputs
- Type checking
- Length validation
- Format validation (email, phone, etc.)

### Rate Limiting
```javascript
// Authentication endpoints
- 5 attempts per 15 minutes

// API endpoints
- 100 requests per 15 minutes (authenticated)
- 20 requests per 15 minutes (unauthenticated)

// File uploads
- 10 uploads per hour
```

### Data Encryption
- HTTPS only in production
- Sensitive fields encrypted at rest
- JWT secrets environment-based
- API keys hashed

---

## 📈 Performance Architecture

### Database Optimization
- Compound indexes for common queries
- Aggregation pipelines for analytics
- Connection pooling
- Query result caching

### Caching Strategy
```javascript
// Cache Layers
1. Application Cache (Node-cache)
   - User sessions: 15 minutes
   - Static data: 1 hour

2. Database Query Cache
   - Frequently accessed data
   - Invalidate on updates

3. CDN Cache (future)
   - Static assets
   - Public API responses
```

### Pagination Strategy
```javascript
// Default pagination
{
  page: 1,
  limit: 20,
  sort: '-createdAt'
}

// Cursor-based for large datasets
{
  cursor: 'lastId',
  limit: 20
}
```

---

## 🔧 Middleware Architecture

### Middleware Stack
```javascript
1. helmet() - Security headers
2. cors() - CORS configuration
3. express.json() - JSON parsing
4. express.urlencoded() - URL encoding
5. morgan() - Request logging
6. rateLimiter() - Rate limiting
7. authenticate() - JWT verification
8. authorize() - Permission check
9. errorHandler() - Error handling
```

### Custom Middleware

#### Authentication Middleware
```javascript
// Verify JWT token
// Attach user to request
// Check if user is active
```

#### Authorization Middleware
```javascript
// Check user role
// Verify permissions
// Allow/deny access
```

#### Validation Middleware
```javascript
// Validate request body
// Validate query params
// Sanitize inputs
```

---

## 📊 Analytics Architecture

### Aggregation Pipelines

#### Student Performance
```javascript
// Calculate average marks per student
// Group by subject
// Calculate trends over time
```

#### Batch Rankings
```javascript
// Sum total marks per student
// Calculate percentage
// Sort by percentage
// Assign ranks
```

#### Subject Analysis
```javascript
// Average marks per subject
// Pass/fail rates
// Grade distribution
```

---

## 🔄 Data Flow Architecture

### Request Flow
```
Client Request
    ↓
Rate Limiter
    ↓
Authentication
    ↓
Authorization
    ↓
Validation
    ↓
Controller
    ↓
Service Layer
    ↓
Database
    ↓
Response Formatter
    ↓
Client Response
```

### Excel Import Flow
```
1. File Upload
2. Parse Excel
3. Validate Data
4. Check Duplicates
5. Transform Data
6. Batch Insert
7. Return Results
```

---

## 📝 API Documentation

### Swagger/OpenAPI Specification
- Auto-generated from code
- Interactive API explorer
- Request/response examples
- Authentication testing

---

## 🤝 Collaboration

### With Backend Developer
- Provide detailed schemas
- Review code architecture
- Approve API designs
- Guide implementation

### With Frontend Architect
- Align data structures
- Define API contracts
- Share TypeScript types
- Coordinate changes

---

## 📅 Work Log

### February 4, 2026
- ✅ Designed database schema (5 collections)
- ✅ Planned authentication architecture
- ✅ Defined API structure
- ✅ Created security specifications
- 🔄 Ready for implementation phase

---

## 🎯 Next Steps

1. Review schema with team
2. Implement database models
3. Set up authentication system
4. Create API endpoints
5. Write API documentation

---

**Status:** Schema design complete, ready for implementation  
**Next Review:** After model creation  
**Last Updated:** February 4, 2026
