const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');

const server = app.listen(env.port, () => {
  logger.info(`=======================================================`);
  logger.info(`🚀 AI Sustainability Tracker Server active on port ${env.port}`);
  logger.info(`🌱 Environment: ${env.nodeEnv}`);
  logger.info(`📡 API Health Check: http://localhost:${env.port}/api/health`);
  logger.info(`=======================================================`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server terminated.');
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Keep event loop active
setInterval(() => {}, 1000 * 60 * 60);
