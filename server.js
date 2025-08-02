const app = require('./src/app');
const pool = require('./src/utils/db');

const PORT = process.env.PORT || 5000;

// Test database connection on startup
async function startServer() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
  } catch (err) {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  }

  // Start HTTP server
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Graceful Shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received: shutting down gracefully');
    server.close(async () => {
      console.log('HTTP server closed');
      await pool.end();
      console.log('Database pool closed');
      process.exit(0);
    });
  });

  process.on('unhandledRejection', err => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
  });

  process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });
}

startServer();
