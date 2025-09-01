const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

// @route   GET /dashboard
// @desc    Dashboard page with summary of finances
// @access  Private
router.get('/', requireAuth, getDashboard);

module.exports = router;