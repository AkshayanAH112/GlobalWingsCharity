const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    gradeName: {
      type: String,
      required: [true, 'Grade name is required'],
      enum: ['Grade-6', 'Grade-7', 'Grade-8', 'Grade-9', 'Grade-10', 'Grade-11', 'Grade-12'],
    },
    gradeCode: {
      type: String,
      required: [true, 'Grade code is required'],
      trim: true,
      uppercase: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch reference is required'],
    },
    section: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'A',
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    maxStudents: {
      type: Number,
      default: 50,
      min: [1, 'Maximum students must be at least 1'],
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: One grade per batch
gradeSchema.index({ batch: 1, gradeName: 1, section: 1 }, { unique: true });
gradeSchema.index({ batch: 1, gradeCode: 1 }, { unique: true });
gradeSchema.index({ status: 1 });

module.exports = mongoose.model('Grade', gradeSchema);
