const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/expenseController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validatorMiddleware');
const { expenseValidator } = require('../validators/trackingValidators');

router.use(authenticate);

router.post('/', expenseValidator, validate, ExpenseController.logExpense);
router.get('/', ExpenseController.getExpenses);
router.get('/analytics', ExpenseController.getSavingsAnalytics);
router.delete('/:id', ExpenseController.deleteExpense);

module.exports = router;
