const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  Std_ID: {
    type: String,
    unique: true,
    required: true
  },
  Std_Name: {
    type: String,
    required: true
  },
  parent_Name: {
    type: String,
    required: true
  },
  parent_phone: {
    type: String,
    required: true
  },
  Gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  Class: {
    type: String,
    required: true,
    enum: ['class 1B', 'class 1T', 'class 1J', 'class 2B', 'class 2T', 'class 3B', 'class 3T', 'class 4B','class 4T','class 5B','class 5T','class 6B','class 7B','class 7T','class 8B','class 8T', 'Form 1A', 'Form 1B', 'Form 2A', 'Form 2B','Form 3A','Form 4A']
  },
  Shift: {
    type: String,
    enum: ['morning', 'afternoon'],
    required: true
  },
  Status: {
    type: String,
    enum: ['active', 'unactive'],
    default: 'active'
  },
    loginAllowed: {
    type: Boolean,
    default: false // By default, arday ma geli karo login-ka
  },
  Std_Password: {
    type: String,
    required: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginHistory: [{
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);