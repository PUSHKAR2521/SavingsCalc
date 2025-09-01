/**
 * Authentication middleware
 */

exports.requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
};

exports.requireGuest = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
};

exports.attachUser = (req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
};