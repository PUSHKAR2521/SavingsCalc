const RideSharing = require('../models/RideSharing');

/**
 * @desc    Get ride sharing dashboard
 * @route   GET /ride-sharing
 * @access  Private
 */
exports.getRideSharingDashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get query parameters for filtering
    const { platform, startDate, endDate } = req.query;
    
    // Default to current month if no dates provided
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Build query
    const query = { userId };
    
    if (platform && platform !== 'All') {
      query.platform = platform;
    }
    
    // Set date range
    query.date = {
      $gte: startDate ? new Date(startDate) : firstDayOfMonth,
      $lte: endDate ? new Date(endDate) : lastDayOfMonth
    };
    
    // Prepare filters for the template
    const filters = {
      platform: platform || 'All',
      startDate: startDate ? startDate : firstDayOfMonth.toISOString().split('T')[0],
      endDate: endDate ? endDate : lastDayOfMonth.toISOString().split('T')[0]
    };
    
    // Get ride sharing entries
    const rideEntries = await RideSharing.find(query).sort({ date: -1 });
    
    // Calculate summary statistics
    const summary = {
      totalEarnings: 0,
      totalExpenses: 0,
      totalTrips: 0,
      totalHours: 0,
      netProfit: 0,
      averagePerTrip: 0,
      averagePerHour: 0
    };
    
    rideEntries.forEach(entry => {
      summary.totalEarnings += entry.earnings.totalAmount;
      
      const expenses = entry.expenses.fuel + 
                      entry.expenses.maintenance + 
                      entry.expenses.commission + 
                      entry.expenses.tax + 
                      entry.expenses.otherExpenses;
      
      summary.totalExpenses += expenses;
      summary.totalTrips += entry.tripDetails.totalTrips;
      summary.totalHours += entry.tripDetails.totalHours;
    });
    
    summary.netProfit = summary.totalEarnings - summary.totalExpenses;
    summary.averagePerTrip = summary.totalTrips > 0 ? summary.netProfit / summary.totalTrips : 0;
    summary.averagePerHour = summary.totalHours > 0 ? summary.netProfit / summary.totalHours : 0;
    
    // Get platform-specific summaries
    const platformSummaries = await RideSharing.aggregate([
      { 
        $match: query
      },
      { 
        $group: { 
          _id: "$platform", 
          totalEarnings: { $sum: "$earnings.totalAmount" },
          totalExpenses: { 
            $sum: { 
              $add: [
                "$expenses.fuel", 
                "$expenses.maintenance", 
                "$expenses.commission", 
                "$expenses.tax", 
                "$expenses.otherExpenses"
              ] 
            } 
          },
          totalTrips: { $sum: "$tripDetails.totalTrips" },
          totalHours: { $sum: "$tripDetails.totalHours" },
          count: { $sum: 1 }
        } 
      },
      { $sort: { totalEarnings: -1 } }
    ]);
    
    // Calculate net profit and averages for each platform
    platformSummaries.forEach(platform => {
      platform.netProfit = platform.totalEarnings - platform.totalExpenses;
      platform.averagePerTrip = platform.totalTrips > 0 ? platform.netProfit / platform.totalTrips : 0;
      platform.averagePerHour = platform.totalHours > 0 ? platform.netProfit / platform.totalHours : 0;
    });
    
    // Get monthly trends
    const monthlyTrends = await RideSharing.aggregate([
      { 
        $match: { userId: userId }
      },
      {
        $group: {
          _id: { 
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          totalEarnings: { $sum: "$earnings.totalAmount" },
          totalExpenses: { 
            $sum: { 
              $add: [
                "$expenses.fuel", 
                "$expenses.maintenance", 
                "$expenses.commission", 
                "$expenses.tax", 
                "$expenses.otherExpenses"
              ] 
            } 
          },
          totalTrips: { $sum: "$tripDetails.totalTrips" },
          totalHours: { $sum: "$tripDetails.totalHours" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Format monthly trends for chart
    const formattedTrends = monthlyTrends.map(month => {
      const date = new Date(month._id.year, month._id.month - 1, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const yearMonth = `${monthName} ${month._id.year}`;
      
      return {
        month: yearMonth,
        earnings: month.totalEarnings,
        expenses: month.totalExpenses,
        profit: month.totalEarnings - month.totalExpenses,
        trips: month.totalTrips,
        hours: month.totalHours
      };
    });
    
    res.render('ride-sharing/dashboard', {
      title: 'Ride Sharing Dashboard',
      rideEntries,
      summary,
      platformSummaries,
      trends: formattedTrends,
      filters,
      dateRange: {
        start: startDate ? new Date(startDate).toLocaleDateString() : firstDayOfMonth.toLocaleDateString(),
        end: endDate ? new Date(endDate).toLocaleDateString() : lastDayOfMonth.toLocaleDateString()
      }
    });
  } catch (error) {
    console.error('Ride sharing dashboard error:', error);
    res.render('ride-sharing/dashboard', {
      title: 'Ride Sharing Dashboard',
      error: 'Failed to load ride sharing data',
      rideEntries: [],
      summary: {},
      platformSummaries: [],
      trends: [],
      filters: {},
      dateRange: {}
    });
  }
};

/**
 * @desc    Render add ride sharing entry form
 * @route   GET /ride-sharing/add
 * @access  Private
 */
exports.renderAddRideSharing = (req, res) => {
  res.render('ride-sharing/add', {
    title: 'Add Ride Sharing Entry'
  });
};

/**
 * @desc    Add new ride sharing entry
 * @route   POST /ride-sharing
 * @access  Private
 */
exports.addRideSharing = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const {
      platform,
      date,
      totalAmount,
      baseFare,
      tips,
      incentives,
      otherEarnings,
      totalTrips,
      totalDistance,
      totalHours,
      averageRating,
      fuelExpense,
      maintenanceExpense,
      commissionExpense,
      taxExpense,
      otherExpenses,
      notes
    } = req.body;
    
    // Validation
    if (!platform || !totalAmount || !totalTrips) {
      return res.render('ride-sharing/add', {
        title: 'Add Ride Sharing Entry',
        error: 'Platform, total amount, and total trips are required',
        entry: req.body
      });
    }
    
    // Create ride sharing entry
    const rideSharing = new RideSharing({
      userId,
      platform,
      date: date ? new Date(date) : new Date(),
      earnings: {
        totalAmount: parseFloat(totalAmount),
        baseFare: baseFare ? parseFloat(baseFare) : 0,
        tips: tips ? parseFloat(tips) : 0,
        incentives: incentives ? parseFloat(incentives) : 0,
        otherEarnings: otherEarnings ? parseFloat(otherEarnings) : 0
      },
      tripDetails: {
        totalTrips: parseInt(totalTrips),
        totalDistance: totalDistance ? parseFloat(totalDistance) : 0,
        totalHours: totalHours ? parseFloat(totalHours) : 0,
        averageRating: averageRating ? parseFloat(averageRating) : 0
      },
      expenses: {
        fuel: fuelExpense ? parseFloat(fuelExpense) : 0,
        maintenance: maintenanceExpense ? parseFloat(maintenanceExpense) : 0,
        commission: commissionExpense ? parseFloat(commissionExpense) : 0,
        tax: taxExpense ? parseFloat(taxExpense) : 0,
        otherExpenses: otherExpenses ? parseFloat(otherExpenses) : 0
      },
      notes
    });
    
    await rideSharing.save();
    
    res.redirect('/ride-sharing?success=Ride sharing entry added successfully');
  } catch (error) {
    console.error('Add ride sharing error:', error);
    res.render('ride-sharing/add', {
      title: 'Add Ride Sharing Entry',
      error: 'Failed to add ride sharing entry',
      entry: req.body
    });
  }
};

/**
 * @desc    Get ride sharing entry details
 * @route   GET /ride-sharing/:id
 * @access  Private
 */
exports.getRideSharingDetails = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const entryId = req.params.id;
    
    // Find entry and ensure it belongs to the user
    const entry = await RideSharing.findOne({ _id: entryId, userId });
    
    if (!entry) {
      return res.redirect('/ride-sharing?error=Entry not found');
    }
    
    res.render('ride-sharing/details', {
      title: 'Ride Sharing Details',
      entry
    });
  } catch (error) {
    console.error('Get ride sharing details error:', error);
    res.redirect('/ride-sharing?error=Failed to load entry details');
  }
};

/**
 * @desc    Delete ride sharing entry
 * @route   DELETE /ride-sharing/:id
 * @access  Private
 */
exports.deleteRideSharing = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const entryId = req.params.id;
    
    // Find entry and ensure it belongs to the user
    const entry = await RideSharing.findOne({ _id: entryId, userId });
    
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    
    // Delete the entry
    await RideSharing.findByIdAndDelete(entryId);
    
    res.json({ success: true, message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Delete ride sharing error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete entry' });
  }
};