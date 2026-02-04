// Application Constants
module.exports = {
  // User Roles
  ROLES: {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student',
  },

  // Student Status
  STUDENT_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    GRADUATED: 'graduated',
    WITHDRAWN: 'withdrawn',
  },

  // Batch Status
  BATCH_STATUS: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    ARCHIVED: 'archived',
  },

  // Exam Types
  EXAM_TYPES: {
    MIDTERM: 'midterm',
    FINAL: 'final',
    QUIZ: 'quiz',
    ASSIGNMENT: 'assignment',
    PROJECT: 'project',
  },

  // Grades
  GRADES: {
    A_PLUS: 'A+',
    A: 'A',
    B_PLUS: 'B+',
    B: 'B',
    C: 'C',
    D: 'D',
    F: 'F',
  },

  // Gender Options
  GENDER: {
    MALE: 'male',
    FEMALE: 'female',
    OTHER: 'other',
  },

  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,

  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  EXCEL_MIME_TYPES: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};
