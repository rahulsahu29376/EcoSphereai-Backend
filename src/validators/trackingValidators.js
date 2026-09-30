const { body } = require('express-validator');

const energyValidator = [
  body('electricity_units')
    .optional()
    .isFloat({ min: 0 }).withMessage('Electricity units must be 0 or greater'),
  body('ac_hours')
    .optional()
    .isFloat({ min: 0, max: 24 }).withMessage('AC hours must be between 0 and 24'),
  body('fan_hours')
    .optional()
    .isFloat({ min: 0, max: 24 }).withMessage('Fan hours must be between 0 and 24'),
  body('solar_energy')
    .optional()
    .isFloat({ min: 0 }).withMessage('Solar energy must be 0 or greater'),
  body('renewable_percentage')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Renewable percentage must be between 0 and 100'),
  body('date')
    .optional()
    .isISO8601().withMessage('Invalid date format')
];

const foodValidator = [
  body('food_type')
    .notEmpty().withMessage('Food type is required')
    .isIn(['vegetarian', 'vegan', 'mixed', 'meat_heavy'])
    .withMessage('Food type must be vegetarian, vegan, mixed, or meat_heavy'),
  body('meals_per_day')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('Meals per day must be between 1 and 10'),
  body('food_spending')
    .optional()
    .isFloat({ min: 0 }).withMessage('Food spending cannot be negative'),
  body('is_organic')
    .optional()
    .isBoolean().withMessage('is_organic must be a boolean'),
  body('is_local')
    .optional()
    .isBoolean().withMessage('is_local must be a boolean'),
  body('date')
    .optional()
    .isISO8601().withMessage('Invalid date format')
];

const wasteValidator = [
  body('plastic_waste')
    .optional()
    .isFloat({ min: 0 }).withMessage('Plastic waste must be 0 or greater'),
  body('recycled_waste')
    .optional()
    .isFloat({ min: 0 }).withMessage('Recycled waste must be 0 or greater'),
  body('composting')
    .optional()
    .isFloat({ min: 0 }).withMessage('Composting must be 0 or greater'),
  body('paper_waste')
    .optional()
    .isFloat({ min: 0 }).withMessage('Paper waste must be 0 or greater'),
  body('electronic_waste')
    .optional()
    .isFloat({ min: 0 }).withMessage('Electronic waste must be 0 or greater'),
  body('date')
    .optional()
    .isISO8601().withMessage('Invalid date format')
];

const goalValidator = [
  body('goal_name')
    .trim()
    .notEmpty().withMessage('Goal name is required')
    .isLength({ min: 3, max: 150 }).withMessage('Goal name must be 3-150 characters'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['carbon', 'transport', 'energy', 'waste', 'savings'])
    .withMessage('Invalid goal category'),
  body('target')
    .notEmpty().withMessage('Target value is required')
    .isFloat({ min: 0.01 }).withMessage('Target must be greater than 0'),
  body('unit')
    .notEmpty().withMessage('Unit of measurement is required'),
  body('deadline')
    .optional()
    .isISO8601().withMessage('Invalid deadline date')
];

const expenseValidator = [
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['transport', 'electricity', 'food', 'sustainable_purchase', 'other'])
    .withMessage('Invalid expense category'),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description')
    .optional()
    .trim(),
  body('is_sustainable')
    .optional()
    .isBoolean(),
  body('savings_estimate')
    .optional()
    .isFloat({ min: 0 })
];

module.exports = {
  energyValidator,
  foodValidator,
  wasteValidator,
  goalValidator,
  expenseValidator
};
