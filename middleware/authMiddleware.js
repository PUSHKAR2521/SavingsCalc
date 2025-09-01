/**
 * Authentication middleware functions
 */

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    req.session.error_msg = 'Please log in to access this resource';
    return res.redirect('/auth/login');
  }
};

// Middleware to check if user is a guest (not logged in)
const requireGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  } else {
    return next();
  }
};

module.exports = {
  requireAuth,
  requireGuest
};