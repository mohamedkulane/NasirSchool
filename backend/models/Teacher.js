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
  }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);