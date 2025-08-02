const app = require('./src/app');
const pool = require('./src/utils/db');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Test database connection on startup
async function startServer() {
  try {
    const connection = await pool.getConnection();
    logger.info('Database connected successfully');
    connection.release();
  } catch (err) {
    logger.error('Failed to connect to database:', err.message);
    process.exit(1);
  }

  // Start HTTP server
  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });

  // Graceful Shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received: shutting down gracefully');
    server.close(async () => {
      logger.info('HTTP server closed');
      await pool.end();
      logger.info('Database pool closed');
      process.exit(0);
    });
  });

  process.on('unhandledRejection', err => {
    logger.error('Unhandled Promise Rejection:', err);
    process.exit(1);
  });

  process.on('uncaughtException', err => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
  });
}

startServer();
