const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Housing', 'Food', 'Transportation', 'Utilities', 'Healthcare', 'Personal', 'Entertainment', 'Education', 'Debt', 'Savings', 'Other']
  },
  amount: { 
    type: Number, 
    required: true 
  },
  description: {
    type: String,
    trim: true
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Other'],
    default: 'Cash'
  },
  recurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
    required: function() {
      return this.recurring === true;
    },
  default: undefined,  // 👈 important! don't set null, let it be undefined
  }
}, { timestamps: true });

// Create indexes for faster queries
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);