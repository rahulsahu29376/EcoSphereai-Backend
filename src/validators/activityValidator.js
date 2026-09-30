const { body } = require('express-validator');

const activityValidator = [
  body('activity_type')
    .notEmpty().withMessage('Activity type is required')
    .isIn(['car', 'bike', 'bus', 'metro', 'train', 'shared_ride', 'walking'])
    .withMessage('Invalid activity type'),
  body('distance')
    .notEmpty().withMessage('Distance is required')
    .isFloat({ min: 0.01 }).withMessage('Distance must be greater than 0 km'),
  body('duration')
    .optional()
    .isFloat({ min: 0 }).withMessage('Duration must be positive'),
  body('steps')
    .optional()
    .isInt({ min: 0 }).withMessage('Steps must be positive integer'),
  body('cost')
    .optional()
    .isFloat({ min: 0 }).withMessage('Cost cannot be negative'),
  body('date')
    .optional()
    .isISO8601().withMessage('Invalid date format (YYYY-MM-DD)')
];

module.exports = {
  activityValidator
};
