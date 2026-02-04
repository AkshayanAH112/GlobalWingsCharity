const mongoose = require('mongoose');

const markSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch reference is required'],
    },
    examType: {
      type: String,
      enum: ['Quiz', 'Assignment', 'Mid-Term', 'Final', 'Project', 'Practical'],
      required: [true, 'Exam type is required'],
    },
    examName: {
      type: String,
      required: [true, 'Exam name is required'],
      trim: true,
    },
    examDate: {
      type: Date,
      required: [true, 'Exam date is required'],
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks is required'],
      min: [0, 'Total marks cannot be negative'],
    },
    obtainedMarks: {
      type: Number,
      required: [true, 'Obtained marks is required'],
      min: [0, 'Obtained marks cannot be negative'],
      validate: {
        validator: function (value) {
          return value <= this.totalMarks;
        },
        message: 'Obtained marks cannot exceed total marks',
      },
    },
    percentage: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
    },
    remarks: {
      type: String,
      trim: true,
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate percentage before saving
markSchema.pre('save', function (next) {
  if (this.totalMarks > 0) {
    this.percentage = ((this.obtainedMarks / this.totalMarks) * 100).toFixed(2);
    
    // Auto-assign grade based on percentage
    if (this.percentage >= 90) this.grade = 'A+';
    else if (this.percentage >= 80) this.grade = 'A';
    else if (this.percentage >= 70) this.grade = 'B+';
    else if (this.percentage >= 60) this.grade = 'B';
    else if (this.percentage >= 50) this.grade = 'C+';
    else if (this.percentage >= 40) this.grade = 'C';
    else if (this.percentage >= 33) this.grade = 'D';
    else this.grade = 'F';
  }
  next();
});

// Index for efficient queries
markSchema.index({ student: 1, subject: 1, examDate: -1 });
markSchema.index({ batch: 1, examType: 1 });

module.exports = mongoose.model('Mark', markSchema);