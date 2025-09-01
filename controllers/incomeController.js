const Income = require('../models/Income');

/**
 * @desc    Get all incomes for the logged in user
 * @route   GET /income
 * @access  Private
 */
exports.getIncomes = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get query parameters for filtering
    const { source, startDate, endDate, sort } = req.query;
    
    // Build query
    const query = { userId };
    
    if (source && source !== 'All') {
      query.source = source;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }
    
    // Build sort options
    let sortOptions = { date: -1 }; // Default sort by date descending
    
    if (sort) {
      const [field, order] = sort.split(':');
      sortOptions = { [field]: order === 'asc' ? 1 : -1 };
    }
    
    // Get all incomes for the user with filters
    const incomes = await Income.find(query).sort(sortOptions);
    
    // Calculate total income
    const totalIncome = incomes.reduce((acc, income) => acc + income.amount, 0);
    
    // Get unique sources for filter dropdown
    const sources = await Income.distinct('source', { userId });
    
    // Aggregate income by source for chart
    const incomeBySource = await Income.aggregate([
      { $match: { userId } },
      { $group: { _id: '$source', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);
    
    res.render('income/index', {
      title: 'Income',
      incomes,
      totalIncome,
      sources,
      incomeBySource,
      filters: { source, startDate, endDate, sort }
    });
  } catch (error) {
    console.error('Get incomes error:', error);
    res.render('income/index', {
      title: 'Income',
      error: 'Failed to load income data',
      incomes: [],
      totalIncome: 0,
      sources: [],
      incomeBySource: [],
      filters: {}
    });
  }
};

/**
 * @desc    Add new income
 * @route   POST /income
 * @access  Private
 */
exports.addIncome = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { source, amount, description, date } = req.body;
    
    // Validation
    if (!source || !amount) {
      return res.render('income/add', {
        title: 'Add Income',
        error: 'Source and amount are required',
        income: req.body
      });
    }
    
    // Create income object
    const incomeData = {
      userId,
      source,
      amount: parseFloat(amount),
      description,
      date: date ? new Date(date) : new Date()
    };
    
    // Add ride-sharing details if applicable
    if (source === 'Uber' || source === 'Rapido') {
      const { platform, trips, hours, fuelExpense, maintenanceExpense, otherExpense } = req.body;
      
      incomeData.rideDetails = {
        platform: platform || source,
        trips: trips ? parseInt(trips) : 0,
        hours: hours ? parseFloat(hours) : 0,
        expenses: {
          fuel: fuelExpense ? parseFloat(fuelExpense) : 0,
          maintenance: maintenanceExpense ? parseFloat(maintenanceExpense) : 0,
          other: otherExpense ? parseFloat(otherExpense) : 0
        }
      };
    }
    
    // Save to database
    await Income.create(incomeData);
    
    res.redirect('/income?success=Income added successfully');
  } catch (error) {
    console.error('Add income error:', error);
    res.render('income/add', {
      title: 'Add Income',
      error: 'Failed to add income',
      income: req.body
    });
  }
};

/**
 * @desc    Render add income form
 * @route   GET /income/add
 * @access  Private
 */
exports.renderAddIncome = (req, res) => {
  res.render('income/add', {
    title: 'Add Income'
  });
};

/**
 * @desc    Delete income
 * @route   DELETE /income/:id
 * @access  Private
 */
exports.deleteIncome = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const incomeId = req.params.id;
    
    // Find income and ensure it belongs to the user
    const income = await Income.findOne({ _id: incomeId, userId });
    
    if (!income) {
      return res.status(404).json({ success: false, message: 'Income not found' });
    }
    
    // Delete the income
    await Income.findByIdAndDelete(incomeId);
    
    res.json({ success: true, message: 'Income deleted successfully' });
  } catch (error) {
    console.error('Delete income error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete income' });
  }
};

/**
 * @desc    Edit income
 * @route   GET /income/edit/:id
 * @access  Private
 */
exports.renderEditIncome = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const incomeId = req.params.id;
    
    // Find income and ensure it belongs to the user
    const income = await Income.findOne({ _id: incomeId, userId });
    
    if (!income) {
      return res.redirect('/income?error=Income not found');
    }
    
    res.render('income/edit', {
      title: 'Edit Income',
      income
    });
  } catch (error) {
    console.error('Edit income error:', error);
    res.redirect('/income?error=Failed to load income data');
  }
};

/**
 * @desc    Update income
 * @route   PUT /income/:id
 * @access  Private
 */
exports.updateIncome = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const incomeId = req.params.id;
    const { source, amount, description, date } = req.body;
    
    // Validation
    if (!source || !amount) {
      return res.render('income/edit', {
        title: 'Edit Income',
        error: 'Source and amount are required',
        income: { _id: incomeId, ...req.body }
      });
    }
    
    // Find income and ensure it belongs to the user
    const income = await Income.findOne({ _id: incomeId, userId });
    
    if (!income) {
      return res.redirect('/income?error=Income not found');
    }
    
    // Update income object
    const incomeData = {
      source,
      amount: parseFloat(amount),
      description,
      date: date ? new Date(date) : income.date
    };
    
    // Update ride-sharing details if applicable
    if (source === 'Uber' || source === 'Rapido') {
      const { platform, trips, hours, fuelExpense, maintenanceExpense, otherExpense } = req.body;
      
      incomeData.rideDetails = {
        platform: platform || source,
        trips: trips ? parseInt(trips) : 0,
        hours: hours ? parseFloat(hours) : 0,
        expenses: {
          fuel: fuelExpense ? parseFloat(fuelExpense) : 0,
          maintenance: maintenanceExpense ? parseFloat(maintenanceExpense) : 0,
          other: otherExpense ? parseFloat(otherExpense) : 0
        }
      };
    } else {
      // Remove ride details if source is not ride-sharing
      incomeData.rideDetails = undefined;
    }
    
    // Update in database
    await Income.findByIdAndUpdate(incomeId, incomeData);
    
    res.redirect('/income?success=Income updated successfully');
  } catch (error) {
    console.error('Update income error:', error);
    res.render('income/edit', {
      title: 'Edit Income',
      error: 'Failed to update income',
      income: { _id: req.params.id, ...req.body }
    });
  }
};