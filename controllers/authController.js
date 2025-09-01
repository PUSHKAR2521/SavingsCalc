const User = require('../models/User');

/**
 * @desc    Register a new user
 * @route   POST /auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.render('auth/register', {
        title: 'Register',
        error: 'All fields are required',
        name,
        email
      });
    }

    if (password !== confirmPassword) {
      return res.render('auth/register', {
        title: 'Register',
        error: 'Passwords do not match',
        name,
        email
      });
    }

    if (password.length < 6) {
      return res.render('auth/register', {
        title: 'Register',
        error: 'Password must be at least 6 characters',
        name,
        email
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('auth/register', {
        title: 'Register',
        error: 'Email is already registered',
        name,
        email
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });

    // Store user in session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email
    };

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Registration error:', error);
    res.render('auth/register', {
      title: 'Register',
      error: 'An error occurred during registration',
      name: req.body.name,
      email: req.body.email
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.render('auth/login', {
        title: 'Login',
        error: 'Please provide email and password',
        email
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/login', {
        title: 'Login',
        error: 'Invalid credentials',
        email
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('auth/login', {
        title: 'Login',
        error: 'Invalid credentials',
        email
      });
    }

    // Store user in session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email
    };

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', {
      title: 'Login',
      error: 'An error occurred during login',
      email: req.body.email
    });
  }
};

/**
 * @desc    Logout user
 * @route   GET /auth/logout
 * @access  Private
 */
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.redirect('/auth/login');
  });
};

/**
 * @desc    Render register page
 * @route   GET /auth/register
 * @access  Public
 */
exports.renderRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Register'
  });
};

/**
 * @desc    Render login page
 * @route   GET /auth/login
 * @access  Public
 */
exports.renderLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login'
  });
};