const express = require('express');
const router = express.Router();
const FoodController = require('../controllers/foodController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validatorMiddleware');
const { foodValidator } = require('../validators/trackingValidators');

router.use(authenticate);

router.post('/', foodValidator, validate, FoodController.logFood);
router.get('/', FoodController.getFoodLogs);

module.exports = router;
