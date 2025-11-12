const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  class: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  exam_type: {
    type: String,
    enum: ['monthly_one', 'midTerm', 'monthly_two', 'Final'],
    required: true
  },
  marks: {
    type: Number,
    required: true,
    min: 0,
    // REMOVE THE MAX VALIDATION OR USE CUSTOM VALIDATOR
  },
  total_marks: {
    type: Number,
    default: 100
  },
  grade: {
    type: String
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  }
}, { timestamps: true });

// Custom validation for marks based on exam type
examResultSchema.path('marks').validate(function(value) {
  const maxValues = {
    'monthly_one': 10,
    'midTerm': 20,
    'monthly_two': 10,
    'Final': 60
  };
  
  const maxMark = maxValues[this.exam_type];
  return value <= maxMark;
}, 'Marks exceed maximum allowed for this exam type');

// Calculate grade before saving
examResultSchema.pre('save', function(next) {
  if (this.marks >= 90) this.grade = 'A+';
  else if (this.marks >= 80) this.grade = 'A';
  else if (this.marks >= 70) this.grade = 'B+';
  else if (this.marks >= 60) this.grade = 'B';
  else if (this.marks >= 50) this.grade = 'C';
  else if (this.marks >= 40) this.grade = 'D';
  else this.grade = 'F';
  next();
});

module.exports = mongoose.model('ExamResult', examResultSchema);