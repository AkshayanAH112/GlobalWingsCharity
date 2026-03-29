const mongoose = require('mongoose');

const studentRankingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
    },
    
    // Overall performance
    totalMarks: {
      type: Number,
      default: 0,
    },
    totalPossible: {
      type: Number,
      default: 0,
    },
    overallPercentage: {
      type: Number,
      default: 0,
    },
    overallGrade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'N/A'],
      default: 'N/A',
    },
    
    // Rankings
    rankInBatch: {
      type: Number,
      required: true,
    },
    totalStudentsInBatch: {
      type: Number,
      required: true,
    },
    
    // Subject-wise performance
    subjectPerformance: [
      {
        subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
        },
        totalObtained: {
          type: Number,
          default: 0,
        },
        totalPossible: {
          type: Number,
          default: 0,
        },
        percentage: {
          type: Number,
          default: 0,
        },
        grade: {
          type: String,
          enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'N/A'],
        },
      },
    ],
    
    // Exam type breakdown
    examTypePerformance: [
      {
        examType: {
          type: String,
          enum: ['Quiz', 'Assignment', 'Mid-Term', 'Final', 'Project', 'Practical'],
        },
        totalObtained: {
          type: Number,
          default: 0,
        },
        totalPossible: {
          type: Number,
          default: 0,
        },
        percentage: {
          type: Number,
          default: 0,
        },
      },
    ],
    
    // Metadata
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
    academicYear: {
      type: String,
      default: () => new Date().getFullYear().toString(),
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
studentRankingSchema.index({ batch: 1, rankInBatch: 1 });
studentRankingSchema.index({ student: 1, batch: 1 }, { unique: true });
studentRankingSchema.index({ batch: 1, overallPercentage: -1 });

module.exports = mongoose.model('StudentRanking', studentRankingSchema);
