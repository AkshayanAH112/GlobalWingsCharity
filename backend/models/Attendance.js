const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch reference is required'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Excused', 'Holiday'],
      required: [true, 'Attendance status is required'],
      default: 'Present',
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    remarks: {
      type: String,
      trim: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate attendance records for the same student on the same date
attendanceSchema.index({ student: 1, date: 1, subject: 1 }, { unique: true });
attendanceSchema.index({ batch: 1, date: -1 });

// Virtual for duration (if both check-in and check-out are recorded)
attendanceSchema.virtual('duration').get(function () {
  if (this.checkInTime && this.checkOutTime) {
    const diff = this.checkOutTime - this.checkInTime;
    return Math.round(diff / (1000 * 60)); // Duration in minutes
  }
  return null;
});

// Ensure virtuals are included in JSON output
attendanceSchema.set('toJSON', { virtuals: true });
attendanceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Attendance', attendanceSchema);