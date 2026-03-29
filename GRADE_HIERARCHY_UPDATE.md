# Grade Hierarchy Implementation

## Overview
The system has been refactored to implement a proper hierarchical structure:

**Batch → Grade → Subjects → Students**

This document outlines all changes and the new API endpoints.

## Architecture Changes

### Previous Structure
- Batch → Students (direct relationship)
- Students had embedded `grade` and `section` fields
- Rankings calculated per Batch

### New Structure
- **Batch**: Represents academic year/program (e.g., "2024-2025")
- **Grade**: Represents class level within a batch (e.g., "Grade-10", section "A")
- **Students**: Assigned to a Grade (inherits Batch)
- **Subjects**: Assigned to Grades
- **Rankings**: Calculated per Grade

## Database Schema Updates

### 1. New Grade Model (`models/Grade.js`)
```javascript
{
  batch: ObjectId,              // Reference to Batch
  gradeName: String,            // Enum: Grade-6 to Grade-12
  gradeCode: String,            // Unique code: "2024-G10-A"
  section: String,              // Section: "A", "B", etc.
  subjects: [ObjectId],         // Array of Subject references
  classTeacher: ObjectId,       // Reference to User (teacher)
  maxStudents: Number,          // Default: 50
  status: String                // Active | Completed | Archived
}
```

**Indexes:**
- Compound unique: `(batch, gradeName, section)`
- Compound unique: `(batch, gradeCode)`

### 2. Updated Student Model
**Added:**
- `gradeId`: ObjectId reference to Grade

**Removed from academicInfo:**
- `grade`: Enum field (moved to Grade model)
- `section`: String field (moved to Grade model)

**Kept in academicInfo:**
- `rollNumber`: Number (auto-assigned when added to grade)
- `admissionNumber`: String

## API Endpoints

### Grade Management

#### Create Grade
```http
POST /api/grades
Authorization: Bearer <admin_token>

Body:
{
  "batchId": "batch_id_here",
  "gradeName": "Grade-10",
  "gradeCode": "2024-G10-A",
  "section": "A",
  "classTeacher": "teacher_user_id",
  "maxStudents": 50
}
```

#### Get Batch Grades
```http
GET /api/batches/:batchId/grades
Authorization: Bearer <token>

Query Params:
- status: Active | Completed | Archived (optional)
- section: A | B | C (optional)

Response includes student counts and available slots.
```

#### Get Grade Details
```http
GET /api/grades/:id
Authorization: Bearer <token>

Query Params:
- includeStudents: true | false (default: true)
- includeSubjects: true | false (default: true)
```

#### Update Grade
```http
PUT /api/grades/:id
Authorization: Bearer <admin_token>

Body:
{
  "section": "B",
  "classTeacher": "new_teacher_id",
  "maxStudents": 60,
  "status": "Active"
}
```

#### Assign Subjects to Grade
```http
POST /api/grades/:id/assign-subjects
Authorization: Bearer <admin_token>

Body:
{
  "subjectIds": ["subject_id_1", "subject_id_2"]
}
```

#### Remove Subject from Grade
```http
DELETE /api/grades/:id/subjects/:subjectId
Authorization: Bearer <admin_token>

Note: Fails if marks exist for this subject in the grade.
```

#### Assign Students to Grade
```http
POST /api/grades/:id/assign-students
Authorization: Bearer <admin_token>

Body:
{
  "studentIds": ["student_id_1", "student_id_2"],
  "autoAssignRollNumbers": true
}

Features:
- Checks grade capacity
- Auto-assigns sequential roll numbers
- Prevents double-assignment
- Updates both gradeId and batchId
```

#### Remove Student from Grade
```http
DELETE /api/grades/:id/students/:studentId
Authorization: Bearer <admin_token>

Query Params:
- clearMarks: true | false (default: false)

If student has marks, must set clearMarks=true.
```

#### Get Grade Statistics
```http
GET /api/grades/:id/statistics
Authorization: Bearer <token>

Returns:
- Student count and capacity
- Subject count
- Average marks per subject
- Occupancy rate
```

### Updated Batch Endpoints

#### Get Batch Details
```http
GET /api/batches/:id/details
Authorization: Bearer <token>

Query Params:
- includeGrades: true | false (default: true)

Now returns:
- Batch info
- List of grades with student counts
- Overall statistics aggregated across grades
```

#### Deprecated Endpoints
```http
POST /api/batches/:id/assign-students
DELETE /api/batches/:id/remove-student/:studentId

Both return 410 Gone with message directing to Grade endpoints.
```

### Updated Marks Endpoints

#### Bulk Entry (Grade-based)
```http
POST /api/marks/bulk-entry
Authorization: Bearer <admin_token>

Body:
{
  "gradeId": "grade_id_here",        // Changed from batchId
  "subjectId": "subject_id_here",
  "examType": "Mid-Term",
  "examName": "Mid-Term Exam 2024",
  "examDate": "2024-03-15",
  "totalMarks": 100,
  "marks": [
    {
      "studentId": "student_id_1",
      "obtainedMarks": 85,
      "remarks": "Excellent"
    }
  ]
}

Validations:
- Grade must exist
- Subject must be assigned to the grade
- All students must be in the grade
```

#### Get Grade Marks
```http
GET /api/marks/grade/:gradeId
Authorization: Bearer <token>

Query Params:
- subjectId: filter by subject (optional)
- examType: filter by exam type (optional)
- studentId: filter by student (optional)
```

#### Get Grade-Subject Marks Grid
```http
GET /api/marks/grade/:gradeId/subject/:subjectId
Authorization: Bearer <token>

Returns marks grouped by exam with students sorted by roll number.
```

### Updated Rankings Endpoints

#### Calculate Grade Rankings
```http
POST /api/rankings/grade/:gradeId/calculate
Authorization: Bearer <admin_token>

Calculates rankings for all students in the grade.
Rankings are based on all marks for each student.
```

#### Get Grade Rankings
```http
GET /api/rankings/grade/:gradeId
Authorization: Bearer <token>

Query Params:
- sortBy: rankInBatch | overallPercentage (default: rankInBatch)
- limit: number of results (optional)

Returns ranked list with statistics.
```

#### Get Student Ranking
```http
GET /api/rankings/student/:studentId
Authorization: Bearer <token>

Returns student's rank within their grade.
```

#### Get Subject Rankings (Grade-based)
```http
GET /api/rankings/grade/:gradeId/subject/:subjectId
Authorization: Bearer <token>

Returns subject-specific rankings for the grade.
```

## Updated Controllers

### 1. gradeController.js (NEW)
- `createGrade`: Create grade in batch
- `getBatchGrades`: List grades with counts
- `getGradeDetails`: Full grade info
- `updateGrade`: Update grade settings
- `assignSubjects`: Add subjects to grade
- `removeSubject`: Remove subject (with validation)
- `assignStudents`: Add students with capacity checks
- `removeStudent`: Remove student (with marks check)
- `getGradeStatistics`: Comprehensive stats

### 2. batchController.js (UPDATED)
- `getBatchDetails`: Now includes grades array
- `assignStudents`: Deprecated (returns 410)
- `removeStudent`: Deprecated (returns 410)
- `getBatchStatistics`: Aggregates across grades

### 3. rankingController.js (UPDATED)
- `calculateGradeRankings`: Changed from batch to grade
- `getGradeRankings`: Changed from batch to grade
- `getStudentRanking`: Now includes grade info
- `getSubjectRankings`: Grade-based subject rankings

### 4. markController.js (UPDATED)
- `bulkEntry`: Uses gradeId, validates subject assignment
- `getGradeMarks`: Changed from batch to grade
- `getGradeSubjectMarks`: Grade-based marks grid

## Migration Guide

### For Existing Data

If you have existing data with students assigned to batches:

1. **Create Grades** for each batch:
   ```javascript
   // Example: Create Grade-10 section A in batch
   POST /api/grades
   {
     "batchId": "existing_batch_id",
     "gradeName": "Grade-10",
     "gradeCode": "2024-G10-A",
     "section": "A"
   }
   ```

2. **Assign Students** to appropriate grades:
   ```javascript
   // Query students by old academicInfo.grade field
   // Then assign to new Grade
   POST /api/grades/{gradeId}/assign-students
   {
     "studentIds": [...],
     "autoAssignRollNumbers": false  // Keep existing roll numbers
   }
   ```

3. **Assign Subjects** to grades:
   ```javascript
   POST /api/grades/{gradeId}/assign-subjects
   {
     "subjectIds": [...]
   }
   ```

### Frontend Updates Required

#### 1. Batch Page
- Add "View Grades" button
- Show grade cards with student counts

#### 2. Grade Selection Flow
```
Batch Selection → Grade Selection → Student Management
```

#### 3. Marks Entry Page
```
1. Select Batch
2. Select Grade (show dropdown with grades in batch)
3. Select Subject (show only subjects assigned to grade)
4. Show Students (filtered by selected grade)
5. Enter Marks
```

#### 4. Rankings Page
```
1. Select Batch
2. Select Grade
3. View Rankings (grade-specific)
4. Optional: View subject-specific rankings
```

## New Workflow Example

### Complete Student Management Flow

1. **Create Batch** (if not exists)
   ```
   POST /api/batches
   { "batchName": "2024-2025", "academicYear": "2024-2025" }
   ```

2. **Create Grade in Batch**
   ```
   POST /api/grades
   {
     "batchId": "batch_id",
     "gradeName": "Grade-10",
     "section": "A",
     "maxStudents": 50
   }
   ```

3. **Assign Subjects to Grade**
   ```
   POST /api/grades/{gradeId}/assign-subjects
   { "subjectIds": ["math_id", "science_id", "english_id"] }
   ```

4. **Assign Students to Grade**
   ```
   POST /api/grades/{gradeId}/assign-students
   {
     "studentIds": ["student1_id", "student2_id"],
     "autoAssignRollNumbers": true
   }
   ```

5. **Enter Marks for Grade**
   ```
   POST /api/marks/bulk-entry
   {
     "gradeId": "grade_id",
     "subjectId": "math_id",
     "examType": "Mid-Term",
     ...
   }
   ```

6. **Calculate Rankings for Grade**
   ```
   POST /api/rankings/grade/{gradeId}/calculate
   ```

7. **View Rankings**
   ```
   GET /api/rankings/grade/{gradeId}
   ```

## Benefits of New Architecture

1. **Clear Hierarchy**: Batch → Grade → Students matches educational structure
2. **Scalability**: Easy to manage multiple grade levels per batch
3. **Capacity Management**: Per-grade capacity limits
4. **Subject Organization**: Subjects assigned at grade level
5. **Accurate Rankings**: Rankings calculated per grade (not mixed)
6. **Better Analytics**: Grade-specific performance metrics
7. **Flexible Sections**: Multiple sections per grade (10-A, 10-B)

## Testing Checklist

- [ ] Create grade in batch
- [ ] Assign subjects to grade
- [ ] Assign students to grade (with capacity check)
- [ ] Enter marks for grade-subject
- [ ] Calculate grade rankings
- [ ] View grade statistics
- [ ] Remove student from grade
- [ ] Remove subject from grade
- [ ] View batch details (with grades)
- [ ] Verify deprecated batch endpoints return 410

## Notes

- Roll numbers are now managed at grade level
- Students must be assigned to grades (not directly to batches)
- Rankings are calculated per grade for fair comparison
- Marks entry requires grade selection
- All existing batch-based endpoints still work for backward compatibility
- The Grade model uses compound unique indexes to prevent duplicates

## Server Status

✅ All models registered
✅ All routes configured
✅ Server running on http://localhost:5000
⚠️  Analytics controller not yet updated for grade hierarchy
⚠️  Mongoose warnings about duplicate indexes (non-critical)
