const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { errorResponse } = require('../utils/responseHandler');
const { supabase, isMock } = require('../config/supabase');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication token missing or invalid format', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    // Fetch user from DB or mock store
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, avatar, carbon_target_monthly, monthly_budget')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return errorResponse(res, 'User session expired or user no longer exists', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token has expired. Please log in again.', 401);
    }
    return errorResponse(res, 'Invalid authentication token', 401);
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized', 401);
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return errorResponse(res, 'Forbidden: Insufficient privileges', 403);
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
