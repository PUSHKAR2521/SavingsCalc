const express = require('express');
const router = express.Router();
const { 
  getExpenses, 
  renderAddExpense, 
  addExpense, 
  renderEditExpense, 
  updateExpense, 
  deleteExpense 
} = require('../controllers/expenseController');
const { requireAuth } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(requireAuth);

// @route   GET /expenses
// @desc    Get all expenses
// @access  Private
router.get('/', getExpenses);

// @route   GET /expenses/add
// @desc    Render add expense form
// @access  Private
router.get('/add', renderAddExpense);

// @route   POST /expenses
// @desc    Add new expense
// @access  Private
router.post('/', addExpense);

// @route   GET /expenses/edit/:id
// @desc    Render edit expense form
// @access  Private
router.get('/edit/:id', renderEditExpense);

// @route   POST /expenses/:id
// @desc    Update expense
// @access  Private
router.post('/:id', updateExpense);

// @route   DELETE /expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', deleteExpense);

module.exports = router;