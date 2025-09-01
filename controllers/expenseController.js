const Expense = require('../models/Expense');

/**
 * @desc    Get expenses with filtering and pagination
 * @route   GET /expenses
 * @access  Private
 */
exports.getExpenses = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get query parameters for filtering
    const { category, startDate, endDate, sort } = req.query;
    
    // Default to current month if no dates provided
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Build query
    const query = { userId };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    // Set date range
    query.date = {
      $gte: startDate ? new Date(startDate) : firstDayOfMonth,
      $lte: endDate ? new Date(endDate) : lastDayOfMonth
    };
    
    // Set sort order
    let sortOrder = { date: -1 }; // Default: newest first
    
    if (sort === 'oldest') {
      sortOrder = { date: 1 };
    } else if (sort === 'amount-high') {
      sortOrder = { amount: -1 };
    } else if (sort === 'amount-low') {
      sortOrder = { amount: 1 };
    }
    
    // Get expenses
    const expenses = await Expense.find(query).sort(sortOrder);
    
    // Calculate total for the filtered period
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Prepare filters for the template
    const filters = {
      category: category || 'All',
      startDate: startDate ? startDate : firstDayOfMonth.toISOString().split('T')[0],
      endDate: endDate ? endDate : lastDayOfMonth.toISOString().split('T')[0],
      sort: sort || 'newest'
    };
    
    // Get category totals
    const categoryTotals = await Expense.aggregate([
      { $match: query },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);
    
    // Format category data for charts
    const categoryData = {
      labels: categoryTotals.map(cat => cat._id),
      values: categoryTotals.map(cat => cat.total)
    };
    
    // Helper function for category styling
    const getCategoryClass = (category) => {
      const categoryClasses = {
        'Housing': 'bg-blue-100 text-blue-800',
        'Transportation': 'bg-green-100 text-green-800',
        'Food': 'bg-yellow-100 text-yellow-800',
        'Utilities': 'bg-purple-100 text-purple-800',
        'Insurance': 'bg-indigo-100 text-indigo-800',
        'Healthcare': 'bg-red-100 text-red-800',
        'Entertainment': 'bg-pink-100 text-pink-800',
        'Personal': 'bg-orange-100 text-orange-800',
        'Education': 'bg-teal-100 text-teal-800',
        'Debt': 'bg-gray-100 text-gray-800',
        'Other': 'bg-gray-100 text-gray-800'
      };
      
      return categoryClasses[category] || 'bg-gray-100 text-gray-800';
    };
    
    res.render('expenses/index', {
      title: 'Expenses',
      expenses,
      total,
      categoryData,
      filters: {
        category,
        startDate: startDate || firstDayOfMonth.toISOString().split('T')[0],
        endDate: endDate || lastDayOfMonth.toISOString().split('T')[0],
        sort: sort || 'newest'
      },
      dateRange: {
        start: startDate ? new Date(startDate).toLocaleDateString() : firstDayOfMonth.toLocaleDateString(),
        end: endDate ? new Date(endDate).toLocaleDateString() : lastDayOfMonth.toLocaleDateString()
      },
      getCategoryClass
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.render('expenses/index', {
      title: 'Expenses',
      error: 'Failed to load expenses',
      expenses: [],
      total: 0,
      categoryData: { labels: [], values: [] },
      filters: {},
      dateRange: {}
    });
  }
};

/**
 * @desc    Render add expense form
 * @route   GET /expenses/add
 * @access  Private
 */
exports.renderAddExpense = (req, res) => {
  res.render('expenses/add', {
    title: 'Add Expense'
  });
};

/**
 * @desc    Add new expense
 * @route   POST /expenses
 * @access  Private
 */
exports.addExpense = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const {
      category,
      amount,
      description,
      date,
      paymentMethod,
      recurring,
      recurringFrequency
    } = req.body;
    
    // Validation
    if (!category || !amount) {
      return res.render('expenses/add', {
        title: 'Add Expense',
        error: 'Category and amount are required',
        expense: req.body
      });
    }
    
    // Create expense
    const expense = new Expense({
      userId,
      category,
      amount: parseFloat(amount),
      description,
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'Cash',
      recurring: recurring === 'on' || recurring === true,
      recurringFrequency: recurring === 'on' || recurring === true ? recurringFrequency : undefined
    });
    
    await expense.save();
    
    res.redirect('/expenses?success=Expense added successfully');
  } catch (error) {
    console.error('Add expense error:', error);
    res.render('expenses/add', {
      title: 'Add Expense',
      error: 'Failed to add expense',
      expense: req.body
    });
  }
};

/**
 * @desc    Render edit expense form
 * @route   GET /expenses/edit/:id
 * @access  Private
 */
exports.renderEditExpense = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const expenseId = req.params.id;
    
    // Find expense and ensure it belongs to the user
    const expense = await Expense.findOne({ _id: expenseId, userId });
    
    if (!expense) {
      return res.redirect('/expenses?error=Expense not found');
    }
    
    res.render('expenses/edit', {
      title: 'Edit Expense',
      expense
    });
  } catch (error) {
    console.error('Render edit expense error:', error);
    res.redirect('/expenses?error=Failed to load expense');
  }
};

/**
 * @desc    Update expense
 * @route   POST /expenses/:id
 * @access  Private
 */
exports.updateExpense = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const expenseId = req.params.id;
    
    const {
      category,
      amount,
      description,
      date,
      paymentMethod,
      recurring,
      recurringFrequency
    } = req.body;
    
    // Find expense and ensure it belongs to the user
    const expense = await Expense.findOne({ _id: expenseId, userId });
    
    if (!expense) {
      return res.redirect('/expenses?error=Expense not found');
    }
    
    // Update expense
    expense.category = category;
    expense.amount = parseFloat(amount);
    expense.description = description;
    expense.date = date ? new Date(date) : expense.date;
    expense.paymentMethod = paymentMethod || 'Cash';
    expense.recurring = recurring === 'on' || recurring === true;
    expense.recurringFrequency = recurring === 'on' || recurring === true ? recurringFrequency : null;
    
    await expense.save();
    
    res.redirect('/expenses?success=Expense updated successfully');
  } catch (error) {
    console.error('Update expense error:', error);
    res.redirect(`/expenses/edit/${req.params.id}?error=Failed to update expense`);
  }
};

/**
 * @desc    Delete expense
 * @route   DELETE /expenses/:id
 * @access  Private
 */
exports.deleteExpense = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const expenseId = req.params.id;
    
    // Find expense and ensure it belongs to the user
    const expense = await Expense.findOne({ _id: expenseId, userId });
    
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    
    // Delete the expense
    await Expense.findByIdAndDelete(expenseId);
    
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete expense' });
  }
};