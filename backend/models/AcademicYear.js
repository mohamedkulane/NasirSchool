const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema({
  yearName: {
    type: String,
    required: true,
    unique: true,
    enum: ['2025-2026', '2026-2027', '2027-2028', '2028-2029', '2029-2030']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Only one active academic year at a time
academicYearSchema.pre('save', async function(next) {
  if (this.isActive) {
    await mongoose.model('AcademicYear').updateMany(
      { _id: { $ne: this._id } },
      { $set: { isActive: false } }
    );
  }
  next();
});

module.exports = mongoose.model('AcademicYear', academicYearSchema);