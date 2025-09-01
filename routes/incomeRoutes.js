const express = require('express');
const router = express.Router();
const { getIncomes, addIncome, renderAddIncome, deleteIncome, renderEditIncome, updateIncome } = require('../controllers/incomeController');
const { requireAuth } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(requireAuth);

// @route   GET /income
// @desc    Get all incomes
// @access  Private
router.get('/', getIncomes);

// @route   GET /income/add
// @desc    Render add income form
// @access  Private
router.get('/add', renderAddIncome);

// @route   POST /income
// @desc    Add new income
// @access  Private
router.post('/', addIncome);

// @route   GET /income/edit/:id
// @desc    Render edit income form
// @access  Private
router.get('/edit/:id', renderEditIncome);

// @route   POST /income/:id
// @desc    Update income
// @access  Private
router.post('/:id', updateIncome);

// @route   DELETE /income/:id
// @desc    Delete income
// @access  Private
router.delete('/:id', deleteIncome);

module.exports = router;