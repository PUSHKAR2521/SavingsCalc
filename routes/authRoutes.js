const express = require('express');
const router = express.Router();
const { register, login, logout, renderRegister, renderLogin } = require('../controllers/authController');
const { requireGuest, requireAuth } = require('../middleware/auth');

// @route   GET /auth/register
// @desc    Render register page
// @access  Public (only for guests)
router.get('/register', requireGuest, renderRegister);

// @route   POST /auth/register
// @desc    Register a new user
// @access  Public (only for guests)
router.post('/register', requireGuest, register);

// @route   GET /auth/login
// @desc    Render login page
// @access  Public (only for guests)
router.get('/login', requireGuest, renderLogin);

// @route   POST /auth/login
// @desc    Login user
// @access  Public (only for guests)
router.post('/login', requireGuest, login);

// @route   GET /auth/logout
// @desc    Logout user
// @access  Private (only for authenticated users)
router.get('/logout', requireAuth, logout);

module.exports = router;