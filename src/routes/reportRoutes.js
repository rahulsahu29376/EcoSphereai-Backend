const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', ReportController.getReport);
router.get('/export/csv', ReportController.exportCSV);

module.exports = router;
