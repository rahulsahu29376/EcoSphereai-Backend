const express = require('express');
const router = express.Router();
const ActivityController = require('../controllers/activityController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validatorMiddleware');
const { activityValidator } = require('../validators/activityValidator');

router.use(authenticate);

router.post('/', activityValidator, validate, ActivityController.logActivity);
router.get('/', ActivityController.getActivities);
router.delete('/:id', ActivityController.deleteActivity);

module.exports = router;
