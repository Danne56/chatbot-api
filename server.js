// server.js
const app = require('./src/app');
const pool = require('./src/utils/db');

const PORT = process.env.PORT || 3000;

// Graceful Shutdown
let server;
server = app.listen(PORT, () => {
  console.log(`✅ Secure Gateway API running on port ${PORT}`);
  console.log(`🔗 Contacts: POST /api/contacts`);
  console.log(`🔗 Messages: POST /api/messages`);
  console.log(`🔗 Preferences: POST /api/preferences/opt-in`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received: shutting down');
  server.close(async () => {
    console.log('HTTP server closed');
    await pool.end();
    console.log('Database pool closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
