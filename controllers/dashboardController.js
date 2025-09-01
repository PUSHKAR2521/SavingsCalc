const Income = require('../models/Income');
const Expense = require('../models/Expense');
const RideSharing = require('../models/RideSharing');

/**
 * @desc    Dashboard page with summary of finances
 * @route   GET /dashboard
 * @access  Private
 */
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get current month's data
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Get total income for current month
    const totalIncome = await Income.aggregate([
      { 
        $match: { 
          userId: userId,
          date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: "$amount" } 
        } 
      }
    ]);
    
    // Get total expenses for current month
    const totalExpenses = await Expense.aggregate([
      { 
        $match: { 
          userId: userId,
          date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: "$amount" } 
        } 
      }
    ]);
    
    // Get income by source for current month
    const incomeBySource = await Income.aggregate([
      { 
        $match: { 
          userId: userId,
          date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        } 
      },
      { 
        $group: { 
          _id: "$source", 
          total: { $sum: "$amount" } 
        } 
      },
      { $sort: { total: -1 } }
    ]);
    
    // Get expenses by category for current month
    const expensesByCategory = await Expense.aggregate([
      { 
        $match: { 
          userId: userId,
          date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        } 
      },
      { 
        $group: { 
          _id: "$category", 
          total: { $sum: "$amount" } 
        } 
      },
      { $sort: { total: -1 } }
    ]);
    
    // Get ride-sharing summary for current month
    const rideSharingSummary = await RideSharing.aggregate([
      { 
        $match: { 
          userId: userId,
          date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        } 
      },
      { 
        $group: { 
          _id: "$platform", 
          totalEarnings: { $sum: "$earnings.totalAmount" },
          totalExpenses: { $sum: { $add: ["$expenses.fuel", "$expenses.maintenance", "$expenses.commission", "$expenses.tax", "$expenses.otherExpenses"] } },
          totalTrips: { $sum: "$tripDetails.totalTrips" },
          totalHours: { $sum: "$tripDetails.totalHours" }
        } 
      },
      { $sort: { totalEarnings: -1 } }
    ]);
    
    // Get recent transactions
    const recentIncomes = await Income.find({ userId })
      .sort({ date: -1 })
      .limit(5);
      
    const recentExpenses = await Expense.find({ userId })
      .sort({ date: -1 })
      .limit(5);
    
    // Calculate savings
    const monthlyIncome = totalIncome.length > 0 ? totalIncome[0].total : 0;
    const monthlyExpenses = totalExpenses.length > 0 ? totalExpenses[0].total : 0;
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
    
    res.render('dashboard/index', {
      title: 'Dashboard',
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      savingsRate,
      incomeBySource,
      expensesByCategory,
      rideSharingSummary,
      recentIncomes,
      recentExpenses,
      currentMonth: currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('dashboard/index', {
      title: 'Dashboard',
      error: 'Failed to load dashboard data'
    });
  }
};