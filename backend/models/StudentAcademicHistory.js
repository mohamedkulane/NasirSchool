const mongoose = require('mongoose');

const studentAcademicHistorySchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true,
    enum: ['class 1B', 'class 1T', 'class 1J', 'class 2B', 'class 2T', 'class 3B', 'class 3T', 'class 4B','class 4T','class 5B','class 5T','class 6B','class 7B','class 7T','class 8B','class 8T', 'Form 1A', 'Form 1B', 'Form 2A', 'Form 2B','Form 3A','Form 4A']
  },
  status: {
    type: String,
    enum: ['active', 'transferred', 'graduated', 'left'],
    default: 'active'
  },
  transferredFrom: {
    type: String // Previous class if transferred
  },
  transferredDate: {
    type: Date
  },
  notes: {
    type: String
  }
}, { timestamps: true });

// Compound unique index
studentAcademicHistorySchema.index({ student: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('StudentAcademicHistory', studentAcademicHistorySchema);