const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// @route   GET /
// @desc    Home page
// @access  Public
router.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('index', {
    title: 'SavingsCalc - Track Your Finances'
  });
});

module.exports = router;