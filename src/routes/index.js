const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const activityRoutes = require('./activityRoutes');
const energyRoutes = require('./energyRoutes');
const foodRoutes = require('./foodRoutes');
const wasteRoutes = require('./wasteRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const goalRoutes = require('./goalRoutes');
const expenseRoutes = require('./expenseRoutes');
const aiRoutes = require('./aiRoutes');
const reportRoutes = require('./reportRoutes');
const gamificationRoutes = require('./gamificationRoutes');
const notificationRoutes = require('./notificationRoutes');

// Root API Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'AI Sustainability Tracker API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/activities', activityRoutes);
router.use('/energy', energyRoutes);
router.use('/food', foodRoutes);
router.use('/waste', wasteRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/goals', goalRoutes);
router.use('/expenses', expenseRoutes);
router.use('/ai', aiRoutes);
router.use('/reports', reportRoutes);
router.use('/gamification', gamificationRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
