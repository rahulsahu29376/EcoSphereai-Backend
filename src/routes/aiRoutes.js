const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/advice', AIController.getAdvice);
router.post('/chat', AIController.chat);

module.exports = router;
