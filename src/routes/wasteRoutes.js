const express = require('express');
const router = express.Router();
const WasteController = require('../controllers/wasteController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validatorMiddleware');
const { wasteValidator } = require('../validators/trackingValidators');

router.use(authenticate);

router.post('/', wasteValidator, validate, WasteController.logWaste);
router.get('/', WasteController.getWasteLogs);

module.exports = router;
