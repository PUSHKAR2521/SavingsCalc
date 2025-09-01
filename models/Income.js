const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  source: { 
    type: String, 
    required: true,
    enum: ['Salary', 'Freelance', 'Business', 'Investment', 'Uber', 'Rapido', 'Other']
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
  // Fields specific to ride-sharing income
  rideDetails: {
    platform: {
      type: String,
      enum: ['Uber', 'Rapido', 'Other'],
      required: function() {
        return this.source === 'Uber' || this.source === 'Rapido';
      }
    },
    trips: {
      type: Number,
      min: 0,
      default: function() {
        return this.source === 'Uber' || this.source === 'Rapido' ? 0 : undefined;
      }
    },
    hours: {
      type: Number,
      min: 0,
      default: function() {
        return this.source === 'Uber' || this.source === 'Rapido' ? 0 : undefined;
      }
    },
    expenses: {
      fuel: {
        type: Number,
        min: 0,
        default: 0
      },
      maintenance: {
        type: Number,
        min: 0,
        default: 0
      },
      other: {
        type: Number,
        min: 0,
        default: 0
      }
    }
  }
}, { timestamps: true });

// Create indexes for faster queries
incomeSchema.index({ userId: 1, date: -1 });
incomeSchema.index({ userId: 1, source: 1 });

module.exports = mongoose.model('Income', incomeSchema);