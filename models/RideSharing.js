const mongoose = require('mongoose');

const rideSharingSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  platform: {
    type: String,
    enum: ['Uber', 'Rapido', 'Other'],
    required: true
  },
  date: { 
    type: Date, 
    default: Date.now,
    required: true
  },
  earnings: {
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    baseFare: {
      type: Number,
      min: 0,
      default: 0
    },
    tips: {
      type: Number,
      min: 0,
      default: 0
    },
    incentives: {
      type: Number,
      min: 0,
      default: 0
    },
    otherEarnings: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  tripDetails: {
    totalTrips: {
      type: Number,
      required: true,
      min: 0
    },
    totalDistance: {
      type: Number,
      min: 0,
      default: 0
    },
    totalHours: {
      type: Number,
      min: 0,
      default: 0
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
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
    commission: {
      type: Number,
      min: 0,
      default: 0
    },
    tax: {
      type: Number,
      min: 0,
      default: 0
    },
    otherExpenses: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  netEarnings: {
    type: Number,
    default: function() {
      const totalEarnings = this.earnings.totalAmount;
      const totalExpenses = this.expenses.fuel + 
                           this.expenses.maintenance + 
                           this.expenses.commission + 
                           this.expenses.tax + 
                           this.expenses.otherExpenses;
      return totalEarnings - totalExpenses;
    }
  },
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Create indexes for faster queries
rideSharingSchema.index({ userId: 1, date: -1 });
rideSharingSchema.index({ userId: 1, platform: 1 });

module.exports = mongoose.model('RideSharing', rideSharingSchema);