const express = require('express');
const router = express.Router();
const GoalController = require('../controllers/goalController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validatorMiddleware');
const { goalValidator } = require('../validators/trackingValidators');

router.use(authenticate);

router.post('/', goalValidator, validate, GoalController.createGoal);
router.get('/', GoalController.getGoals);
router.patch('/:id/progress', GoalController.updateProgress);
router.delete('/:id', GoalController.deleteGoal);

module.exports = router;
