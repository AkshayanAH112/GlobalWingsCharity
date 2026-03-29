# Backend Architecture Enhancements
**Document Version:** 1.0  
**Date:** February 5, 2026  
**Architect:** Backend Architect Agent (BA-001)

---

## 🎯 Overview

This document outlines the architectural enhancements needed to support the complete batch-student-marks-rankings workflow.

### User Flow Requirements
1. Create Batch (Grade 10, Grade 11, etc.)
2. Assign Subjects to Batch
3. Assign Students to Batch
4. Enter Marks for Students in Batch Subjects
5. Calculate Rankings within Batch
6. Analytics & Performance Reports

---

## 📊 Database Schema Enhancements

### Current Schema Status
✅ **Batch Model** - Has subjects array (good!)
✅ **Student Model** - Has batchId reference (good!)
✅ **Mark Model** - Links student, subject, batch (good!)
✅ **Subject Model** - Basic structure

### Required Enhancements

#### 1. Student Model Enhancement
```javascript
// Add to Student schema
{
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true, // Make required
    index: true
  },
  
  // Add academic info
  academicInfo: {
    grade: {
      type: String,
      enum: ['Grade-6', 'Grade-7', 'Grade-8', 'Grade-9', 'Grade-10', 'Grade-11', 'Grade-12'],
      required: true
    },
    section: String, // A, B, C, etc.
    rollNumber: Number,
    admissionNumber: String
  }
}
```

#### 2. New Model: StudentRanking (for caching)
```javascript
// models/StudentRanking.js
{
  student: { type: ObjectId, ref: 'Student', required: true },
  batch: { type: ObjectId, ref: 'Batch', required: true },
  
  // Overall performance
  totalMarks: Number,
  totalPossible: Number,
  overallPercentage: Number,
  overallGrade: String,
  
  // Rankings
  rankInBatch: Number,
  totalStudentsInBatch: Number,
  
  // Subject-wise performance
  subjectPerformance: [{
    subject: { type: ObjectId, ref: 'Subject' },
    totalObtained: Number,
    totalPossible: Number,
    percentage: Number,
    grade: String
  }],
  
  // Exam type breakdown
  examTypePerformance: [{
    examType: String,
    totalObtained: Number,
    totalPossible: Number,
    percentage: Number
  }],
  
  // Metadata
  calculatedAt: { type: Date, default: Date.now },
  academicYear: String
}

// Indexes
studentRankingSchema.index({ batch: 1, rankInBatch: 1 });
studentRankingSchema.index({ student: 1, batch: 1 });
```

---

## 🔌 API Endpoints Design

### 1. Enhanced Batch Management

#### GET /api/batches/:id/details
**Purpose:** Get complete batch details with students and subjects
**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "batchName": "Grade 10 - Section A",
    "batchCode": "G10A",
    "subjects": [
      {
        "_id": "...",
        "subjectName": "Mathematics",
        "subjectCode": "MATH10",
        "teacher": { "firstName": "John", "lastName": "Doe" }
      }
    ],
    "students": [
      {
        "_id": "...",
        "studentId": "GWC20250001",
        "firstName": "Jane",
        "lastName": "Smith",
        "rollNumber": 1
      }
    ],
    "statistics": {
      "totalStudents": 25,
      "totalSubjects": 6,
      "averageAttendance": 85.5
    }
  }
}
```

#### POST /api/batches/:id/assign-subjects
**Purpose:** Assign multiple subjects to a batch
**Request:**
```json
{
  "subjectIds": ["subject1", "subject2", "subject3"]
}
```

#### POST /api/batches/:id/assign-students
**Purpose:** Assign multiple students to a batch
**Request:**
```json
{
  "studentIds": ["student1", "student2"],
  "assignRollNumbers": true
}
```

#### DELETE /api/batches/:id/remove-student/:studentId
**Purpose:** Remove a student from batch

---

### 2. Bulk Marks Entry

#### POST /api/marks/bulk-entry
**Purpose:** Enter marks for multiple students at once
**Request:**
```json
{
  "batchId": "...",
  "subjectId": "...",
  "examType": "Mid-Term",
  "examName": "Mid-Term Exam 2026",
  "examDate": "2026-02-15",
  "totalMarks": 100,
  "marks": [
    {
      "studentId": "student1",
      "obtainedMarks": 85,
      "remarks": "Excellent"
    },
    {
      "studentId": "student2",
      "obtainedMarks": 78
    }
  ]
}
```

#### GET /api/marks/batch/:batchId
**Purpose:** Get all marks for a batch (with filters)
**Query Parameters:**
- `subjectId` - Filter by subject
- `examType` - Filter by exam type
- `studentId` - Filter by student

#### GET /api/marks/batch/:batchId/subject/:subjectId
**Purpose:** Get marks grid for a batch-subject combination
**Response:**
```json
{
  "success": true,
  "data": {
    "batch": { "batchName": "Grade 10 - A" },
    "subject": { "subjectName": "Mathematics" },
    "exams": [
      {
        "examName": "Quiz 1",
        "examType": "Quiz",
        "examDate": "2026-01-15",
        "totalMarks": 20,
        "students": [
          {
            "studentId": "GWC20250001",
            "name": "Jane Smith",
            "obtainedMarks": 18,
            "percentage": 90
          }
        ]
      }
    ]
  }
}
```

---

### 3. Rankings System

#### GET /api/rankings/batch/:batchId
**Purpose:** Get batch rankings
**Query Parameters:**
- `sortBy` - overallPercentage (default), totalMarks
- `limit` - Number of top students (default: all)

**Response:**
```json
{
  "success": true,
  "data": {
    "batch": { "batchName": "Grade 10 - A" },
    "rankings": [
      {
        "rank": 1,
        "student": {
          "studentId": "GWC20250001",
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "totalMarks": 480,
        "totalPossible": 500,
        "overallPercentage": 96,
        "overallGrade": "A+",
        "subjectPerformance": [...]
      }
    ],
    "statistics": {
      "averagePercentage": 78.5,
      "highestPercentage": 96,
      "lowestPercentage": 45
    }
  }
}
```

#### GET /api/rankings/student/:studentId
**Purpose:** Get student's ranking details
**Response:**
```json
{
  "success": true,
  "data": {
    "student": { "studentId": "GWC20250001", "name": "Jane Smith" },
    "batch": { "batchName": "Grade 10 - A" },
    "rank": 1,
    "totalStudents": 25,
    "overallPercentage": 96,
    "overallGrade": "A+",
    "subjectWisePerformance": [...],
    "examTypePerformance": [...],
    "trend": "improving" // comparing recent vs older exams
  }
}
```

#### POST /api/rankings/batch/:batchId/calculate
**Purpose:** Recalculate rankings for entire batch
**Response:**
```json
{
  "success": true,
  "message": "Rankings calculated for 25 students",
  "data": {
    "studentsProcessed": 25,
    "calculatedAt": "2026-02-05T10:30:00Z"
  }
}
```

#### GET /api/rankings/batch/:batchId/subject/:subjectId
**Purpose:** Get subject-wise rankings
**Response:**
```json
{
  "success": true,
  "data": {
    "batch": { "batchName": "Grade 10 - A" },
    "subject": { "subjectName": "Mathematics" },
    "rankings": [
      {
        "rank": 1,
        "student": { "name": "Jane Smith" },
        "totalObtained": 95,
        "totalPossible": 100,
        "percentage": 95,
        "grade": "A+"
      }
    ]
  }
}
```

---

### 4. Enhanced Analytics

#### GET /api/analytics/batch/:batchId
**Purpose:** Comprehensive batch analytics
**Response:**
```json
{
  "success": true,
  "data": {
    "batch": { "batchName": "Grade 10 - A" },
    
    "overview": {
      "totalStudents": 25,
      "totalSubjects": 6,
      "totalExams": 18,
      "averagePercentage": 78.5
    },
    
    "gradeDistribution": {
      "A+": 5,
      "A": 8,
      "B+": 6,
      "B": 4,
      "C": 2
    },
    
    "subjectWisePerformance": [
      {
        "subject": "Mathematics",
        "average": 82.5,
        "highest": 98,
        "lowest": 45
      }
    ],
    
    "topPerformers": [...],
    "needsAttention": [...], // Students below 50%
    
    "attendanceCorrelation": {
      "highAttendance": { "avgMarks": 85 },
      "lowAttendance": { "avgMarks": 62 }
    }
  }
}
```

#### GET /api/analytics/student/:studentId
**Purpose:** Individual student analytics
**Response:**
```json
{
  "success": true,
  "data": {
    "student": {...},
    "overallPerformance": {...},
    "subjectWiseBreakdown": [...],
    "examTypeBreakdown": [...],
    "progressTrend": [...], // Month-wise improvement
    "strengths": ["Mathematics", "Physics"],
    "weaknesses": ["Chemistry"],
    "attendance": {
      "rate": 92,
      "trend": "improving"
    }
  }
}
```

#### GET /api/analytics/subject/:subjectId
**Purpose:** Subject performance across all batches
**Response:**
```json
{
  "success": true,
  "data": {
    "subject": { "subjectName": "Mathematics" },
    "batchWisePerformance": [
      {
        "batch": "Grade 10 - A",
        "average": 82.5,
        "students": 25
      }
    ],
    "overallAverage": 78.3,
    "gradeDistribution": {...}
  }
}
```

---

## 🔐 Authorization Rules

### Batch Management
- **Admin:** Full CRUD
- **Teacher:** Read own batches, update own batch details
- **Student:** Read own batch details only

### Marks Entry
- **Admin:** Full access
- **Teacher:** Enter marks for own subjects, read all
- **Student:** Read own marks only

### Rankings
- **Admin/Teacher:** Full access to all rankings
- **Student:** View own ranking and position

---

## 🎯 Business Logic Design

### 1. Auto-Assign Roll Numbers
When students are assigned to a batch:
```javascript
async function assignRollNumbers(batchId, studentIds) {
  const lastStudent = await Student
    .findOne({ batchId })
    .sort({ 'academicInfo.rollNumber': -1 });
  
  let nextRollNumber = lastStudent?.academicInfo?.rollNumber || 0;
  
  for (const studentId of studentIds) {
    nextRollNumber++;
    await Student.findByIdAndUpdate(studentId, {
      batchId,
      'academicInfo.rollNumber': nextRollNumber
    });
  }
}
```

### 2. Calculate Rankings
```javascript
async function calculateBatchRankings(batchId) {
  // 1. Get all students in batch
  const students = await Student.find({ batchId });
  
  // 2. For each student, aggregate marks
  const rankings = [];
  for (const student of students) {
    const marks = await Mark.find({ 
      student: student._id, 
      batch: batchId 
    });
    
    const totalObtained = marks.reduce((sum, m) => sum + m.obtainedMarks, 0);
    const totalPossible = marks.reduce((sum, m) => sum + m.totalMarks, 0);
    const percentage = (totalObtained / totalPossible) * 100;
    
    rankings.push({
      student: student._id,
      totalMarks: totalObtained,
      totalPossible,
      overallPercentage: percentage
    });
  }
  
  // 3. Sort by percentage
  rankings.sort((a, b) => b.overallPercentage - a.overallPercentage);
  
  // 4. Assign ranks
  rankings.forEach((ranking, index) => {
    ranking.rankInBatch = index + 1;
    ranking.totalStudentsInBatch = rankings.length;
  });
  
  // 5. Save to StudentRanking collection
  await StudentRanking.deleteMany({ batch: batchId });
  await StudentRanking.insertMany(
    rankings.map(r => ({
      ...r,
      batch: batchId,
      calculatedAt: new Date()
    }))
  );
  
  return rankings;
}
```

### 3. Grade Calculation Formula
```javascript
function calculateGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 33) return 'D';
  return 'F';
}
```

---

## 📈 Performance Optimization

### 1. Database Indexes
```javascript
// Student indexes
studentSchema.index({ batchId: 1, 'academicInfo.rollNumber': 1 });
studentSchema.index({ status: 1, batchId: 1 });

// Mark indexes
markSchema.index({ student: 1, batch: 1 });
markSchema.index({ batch: 1, subject: 1 });
markSchema.index({ batch: 1, examType: 1, examDate: -1 });

// Ranking indexes
rankingSchema.index({ batch: 1, rankInBatch: 1 });
rankingSchema.index({ student: 1 });
```

### 2. Caching Strategy
- Cache batch rankings (TTL: 1 hour)
- Cache student performance summary (TTL: 30 minutes)
- Invalidate cache on marks entry/update

### 3. Aggregation Pipelines
Use MongoDB aggregation for complex queries:
```javascript
// Get batch statistics
db.marks.aggregate([
  { $match: { batch: batchId } },
  { $group: {
      _id: '$student',
      totalObtained: { $sum: '$obtainedMarks' },
      totalPossible: { $sum: '$totalMarks' }
  }},
  { $addFields: {
      percentage: { 
        $multiply: [
          { $divide: ['$totalObtained', '$totalPossible'] },
          100
        ]
      }
  }},
  { $sort: { percentage: -1 } }
]);
```

---

## 🚀 Implementation Priority

### Phase 1: Core Enhancements (High Priority)
1. ✅ Enhanced Student Model with academicInfo
2. ✅ Create StudentRanking Model
3. ✅ Batch Details API with students & subjects
4. ✅ Bulk Marks Entry API
5. ✅ Basic Rankings Calculation

### Phase 2: Advanced Features (Medium Priority)
6. ✅ Subject-wise Rankings
7. ✅ Enhanced Analytics APIs
8. ✅ Progress Trend Analysis
9. ✅ Auto-calculation Triggers

### Phase 3: Optimization (Low Priority)
10. ⚪ Caching Layer
11. ⚪ Background Jobs for Rankings
12. ⚪ Performance Monitoring

---

## 📝 API Routes Summary

```javascript
// Batch Management
GET    /api/batches/:id/details
POST   /api/batches/:id/assign-subjects
POST   /api/batches/:id/assign-students
DELETE /api/batches/:id/remove-student/:studentId

// Marks Management
POST   /api/marks/bulk-entry
GET    /api/marks/batch/:batchId
GET    /api/marks/batch/:batchId/subject/:subjectId

// Rankings
GET    /api/rankings/batch/:batchId
GET    /api/rankings/student/:studentId
POST   /api/rankings/batch/:batchId/calculate
GET    /api/rankings/batch/:batchId/subject/:subjectId

// Analytics
GET    /api/analytics/batch/:batchId
GET    /api/analytics/student/:studentId
GET    /api/analytics/subject/:subjectId
```

---

## ✅ Next Steps for Backend Developer

1. Create `StudentRanking` model
2. Enhance `Student` model with `academicInfo`
3. Create `batchController.js` with new endpoints
4. Create `rankingController.js`
5. Create `markController.js` enhancements
6. Create `analyticsController.js`
7. Add new routes to `server.js`
8. Write aggregation pipeline utilities
9. Add validation middleware
10. Write unit tests

---

**Architecture Review Status:** ✅ Ready for Implementation  
**Approved By:** Backend Architect Agent (BA-001)  
**Date:** February 5, 2026
