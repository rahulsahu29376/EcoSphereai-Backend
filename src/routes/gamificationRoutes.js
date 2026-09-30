const express = require('express');
const router = express.Router();
const GamificationController = require('../controllers/gamificationController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/status', GamificationController.getStatus);

module.exports = router;
