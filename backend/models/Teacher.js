// models/Teacher.js - Add tokenVersion field
const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  T_Name: {
    type: String,
    required: true
  },
  T_subject: {
    type: [String],
    required: true
  },
  T_Number: {
    type: String,
    required: true
  },
  T_class: {
    type: [String],
    required: true
  },
  User_Name: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  // 🔐 LOGIN CONTROL FIELDS
  loginAllowed: {
    type: Boolean,
    default: true,
    index: true // Add index for faster queries
  },
  lastLogin: {
    type: Date
  },
  // ✅ ADD TOKEN VERSION FOR SESSION INVALIDATION
  tokenVersion: {
    type: Number,
    default: 0
  },
  // ✅ ADD ACCOUNT STATUS
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'inactive'],
    default: 'active'
  }
}, { 
  timestamps: true 
});

// ✅ INDEX FOR FASTER LOGIN STATUS QUERIES
teacherSchema.index({ loginAllowed: 1, accountStatus: 1 });

module.exports = mongoose.model('Teacher', teacherSchema);