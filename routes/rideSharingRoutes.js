const express = require('express');
const router = express.Router();
const { 
  getRideSharingDashboard, 
  renderAddRideSharing, 
  addRideSharing, 
  getRideSharingDetails, 
  deleteRideSharing 
} = require('../controllers/rideSharingController');
const { requireAuth } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(requireAuth);

// @route   GET /ride-sharing
// @desc    Get ride sharing dashboard
// @access  Private
router.get('/', getRideSharingDashboard);

// @route   GET /ride-sharing/add
// @desc    Render add ride sharing form
// @access  Private
router.get('/add', renderAddRideSharing);

// @route   POST /ride-sharing
// @desc    Add new ride sharing entry
// @access  Private
router.post('/', addRideSharing);

// @route   GET /ride-sharing/:id
// @desc    Get ride sharing entry details
// @access  Private
router.get('/:id', getRideSharingDetails);

// @route   DELETE /ride-sharing/:id
// @desc    Delete ride sharing entry
// @access  Private
router.delete('/:id', deleteRideSharing);

module.exports = router;