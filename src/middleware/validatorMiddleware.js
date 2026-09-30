const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/responseHandler');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return errorResponse(res, 'Validation Error: Check provided fields', 422, formattedErrors);
  }
  next();
};

module.exports = {
  validate
};
