const express = require('express');
const router = express.Router();
const EnergyController = require('../controllers/energyController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validatorMiddleware');
const { energyValidator } = require('../validators/trackingValidators');

router.use(authenticate);

router.post('/', energyValidator, validate, EnergyController.logEnergy);
router.get('/', EnergyController.getEnergyLogs);

module.exports = router;
