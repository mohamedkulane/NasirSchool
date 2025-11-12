const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  E_item: {
    type: String,
    required: true
  },
  E_amount: {
    type: Number,
    required: true
  },
  E_date: {
    type: Date,
    default: Date.now
  },
  E_description: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);