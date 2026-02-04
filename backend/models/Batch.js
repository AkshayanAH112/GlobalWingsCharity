const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
  {
    batchName: {
      type: String,
      required: [true, 'Batch name is required'],
      trim: true,
      unique: true,
    },
    batchCode: {
      type: String,
      required: [true, 'Batch code is required'],
      trim: true,
      uppercase: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    teacher: {
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
      enum: ['upcoming', 'active', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    schedule: {
      days: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      }],
      startTime: String,
      endTime: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
batchSchema.index({ batchCode: 1 });
batchSchema.index({ status: 1, startDate: -1 });

module.exports = mongoose.model('Batch', batchSchema);