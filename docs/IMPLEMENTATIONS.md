# Express.js Secure Gateway API - Implementation Guide

This document provides a complete, ready-to-implement version of the secure API for n8n integration, tailored to your database schema:

- `contacts`
- `message_logs`
- `user_preferences`

All endpoints are protected with API key authentication, input validation, rate limiting, and safe SQL queries.

---

## 1. Project Setup

```bash
mkdir secure-gateway-api
cd secure-gateway-api
npm init -y
npm install express mysql2 helmet cors compression express-rate-limit express-validator nanoid
npm install --save-dev dotenv
```

Create `.env` file:

```env
DB_HOST=localhost
DB_USER=secure_user
DB_PASSWORD=strong_password
DB_NAME=n8n
DB_CONNECTION_LIMIT=5

API_KEY=your-super-secret-api-key-here

PORT=5000
NODE_ENV=production
```

> ⚠️ Add `.env` to `.gitignore`

---

## 2. Database Connection Pool (`src/utils/db.js`)

```js
// src/utils/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 5,
  queueLimit: 0,
});

module.exports = pool;
```

---

## 3. Authentication Middleware (`src/middleware/auth.js`)

```js
// src/middleware/auth.js
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

module.exports = { authenticateApiKey };
```

---

## 4. Rate Limiting (`src/middleware/rateLimiter.js`)

```js
// src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests from this IP' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = rateLimiter;
```

---

## 5. Error Handling (`src/middleware/errorHandler.js`)

```js
// src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err.stack || err.message);
  res.status(500).json({ error: 'Internal server error' });
};

module.exports = errorHandler;
```

---

## 6. Main App Configuration (`src/app.js`)

```js
// src/app.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const { authenticateApiKey } = require('./middleware/auth');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Import Routes
const contactRoutes = require('./routes/contactRoutes');
const messageLogRoutes = require('./routes/messageLogRoutes');
const userPreferenceRoutes = require('./routes/userPreferenceRoutes');

const app = express();

// Security & Performance
app.use(helmet());
app.use(compression());
app.use(cors({ origin: false })); // server-to-server, no CORS needed
app.use(express.json({ limit: '10mb' }));

// Rate Limiting
app.use(rateLimiter);

// API Routes (all protected by API key)
app.use('/api/contacts', authenticateApiKey, contactRoutes);
app.use('/api/messages', authenticateApiKey, messageLogRoutes);
app.use('/api/preferences', authenticateApiKey, userPreferenceRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handling (must be last)
app.use(errorHandler);

module.exports = app;
```

---

## 7. Contact Routes (`src/routes/contactRoutes.js`)

```js
// src/routes/contactRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');

const pool = require('../utils/db');

const router = express.Router();

/**
 * POST /api/contacts
 * Create a new contact (or ignore if exists)
 */
router.post(
  '/',
  body('phone_number').isString().trim().isLength({ min: 5, max: 20 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone_number } = req.body;
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const db = await pool.getConnection();

    try {
      const [existing] = await db.execute('SELECT id FROM contacts WHERE phone_number = ?', [
        phone_number,
      ]);
      if (existing.length > 0) {
        return res.status(200).json({ success: true, id: existing[0].id, existed: true });
      }

      const [result] = await db.execute(
        'INSERT INTO contacts (phone_number, timestamp) VALUES (?, ?)',
        [phone_number, timestamp]
      );

      res.status(201).json({ success: true, id: result.insertId });
    } catch (err) {
      console.error('DB Error (contacts):', err);
      res.status(500).json({ error: 'Failed to create contact' });
    } finally {
      db.release();
    }
  }
);

/**
 * GET /api/contacts/:phone_number
 * Get contact by phone number
 */
router.get('/:phone_number', async (req, res) => {
  const { phone_number } = req.params;
  const db = await pool.getConnection();

  try {
    const [rows] = await db.execute('SELECT * FROM contacts WHERE phone_number = ?', [
      phone_number,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('DB Error (get contact):', err);
    res.status(500).json({ error: 'Failed to fetch contact' });
  } finally {
    db.release();
  }
});

module.exports = router;
```

---

## 8. Message Log Routes (`src/routes/messageLogRoutes.js`)

```js
// src/routes/messageLogRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');

const pool = require('../utils/db');

const router = express.Router();

/**
 * POST /api/messages
 * Log an incoming and/or outgoing message
 */
router.post(
  '/',
  body('contact_id').isInt({ min: 1 }),
  body('message_in').isString().trim().notEmpty(),
  body('message_out').optional().isString().trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { contact_id, message_in, message_out } = req.body;
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const db = await pool.getConnection();

    try {
      // Verify contact exists
      const [contact] = await db.execute('SELECT id FROM contacts WHERE id = ?', [contact_id]);
      if (contact.length === 0) {
        return res.status(400).json({ error: 'Invalid contact_id' });
      }

      await db.execute(
        'INSERT INTO message_logs (contact_id, timestamp, message_in, message_out) VALUES (?, ?, ?, ?)',
        [contact_id, timestamp, message_in, message_out || null]
      );

      res.status(201).json({ success: true });
    } catch (err) {
      console.error('DB Error (message_logs):', err);
      res.status(500).json({ error: 'Failed to log message' });
    } finally {
      db.release();
    }
  }
);

module.exports = router;
```

---

## 9. User Preference Routes (`src/routes/userPreferenceRoutes.js`)

```js
// src/routes/userPreferenceRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');

const pool = require('../utils/db');

const router = express.Router();

/**
 * POST /api/preferences/opt-in
 * Mark a user as opted-in and update timestamps
 */
router.post('/opt-in', body('contact_id').isInt({ min: 1 }), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { contact_id } = req.body;
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const db = await pool.getConnection();

  try {
    // Verify contact exists
    const [contact] = await db.execute('SELECT id FROM contacts WHERE id = ?', [contact_id]);
    if (contact.length === 0) {
      return res.status(400).json({ error: 'Invalid contact_id' });
    }

    // Upsert user preference
    await db.execute(
      `
        INSERT INTO user_preferences (contact_id, has_opted_in, awaiting_optin, opted_in_at)
        VALUES (?, 1, 0, ?)
        ON DUPLICATE KEY UPDATE
          has_opted_in = 1,
          awaiting_optin = 0,
          opted_in_at = VALUES(opted_in_at),
          updated_at = ?
      `,
      [contact_id, now, now]
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('DB Error (preferences opt-in):', err);
    res.status(500).json({ error: 'Failed to update preference' });
  } finally {
    db.release();
  }
});

/**
 * POST /api/preferences/opt-out
 * Mark a user as opted-out
 */
router.post('/opt-out', body('contact_id').isInt({ min: 1 }), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { contact_id } = req.body;
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const db = await pool.getConnection();

  try {
    const [contact] = await db.execute('SELECT id FROM contacts WHERE id = ?', [contact_id]);
    if (contact.length === 0) {
      return res.status(400).json({ error: 'Invalid contact_id' });
    }

    await db.execute(
      `
        INSERT INTO user_preferences (contact_id, has_opted_in, awaiting_optin, opted_out_at)
        VALUES (?, 0, 0, ?)
        ON DUPLICATE KEY UPDATE
          has_opted_in = 0,
          awaiting_optin = 0,
          opted_out_at = VALUES(opted_out_at),
          updated_at = ?
      `,
      [contact_id, now, now]
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('DB Error (preferences opt-out):', err);
    res.status(500).json({ error: 'Failed to update preference' });
  } finally {
    db.release();
  }
});

/**
 * GET /api/preferences/:contact_id
 * Get user preferences by contact ID
 */
router.get('/:contact_id', async (req, res) => {
  const { contact_id } = req.params;
  const db = await pool.getConnection();

  try {
    const [rows] = await db.execute('SELECT * FROM user_preferences WHERE contact_id = ?', [
      contact_id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Preferences not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('DB Error (get preferences):', err);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  } finally {
    db.release();
  }
});

module.exports = router;
```

---

## 10. Server Entry Point (`server.js`)

```js
// server.js
const app = require('./src/app');
const pool = require('./src/utils/db');

const PORT = process.env.PORT || 5000;

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

process.on('unhandledRejection', err => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
```

---

## 11. Package.json Scripts

Update `package.json`:

```json
{
  "name": "secure-gateway-api",
  "version": "1.0.0",
  "description": "Secure API gateway for n8n to protect MariaDB access",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^5.1.0",
    "mysql2": "^3.14.2",
    "helmet": "^8.1.0",
    "cors": "^2.8.5",
    "compression": "^1.8.1",
    "express-rate-limit": "^8.0.1",
    "express-validator": "^7.2.1",
    "nanoid": "^5.1.5"
  },
  "devDependencies": {
    "dotenv": "^17.2.1",
    "nodemon": "^3.1.10"
  }
}
```

Install `nodemon` for development:

```bash
npm install --save-dev nodemon
```

---

## 12. n8n Integration Examples

### ✅ Create Contact

- **Method**: `POST`
- **URL**: `http://api:5000/api/contacts`
- **Headers**: `X-API-Key: your-key`, `Content-Type: application/json`
- **Body**:

```json
{ "phone_number": "+1234567890" }
```

### ✅ Log Message

- **Method**: `POST`
- **URL**: `http://api:5000/api/messages`
- **Body**:

```json
{
  "contact_id": 1,
  "message_in": "Hello",
  "message_out": "Hi there!"
}
```

### ✅ Opt-In User

- **Method**: `POST`
- **URL**: `http://api:5000/api/preferences/opt-in`
- **Body**:

```json
{ "contact_id": 1 }
```

---

## ✅ Final Notes

- This API fully supports your schema: `contacts`, `message_logs`, `user_preferences`
- All foreign key relationships are respected
- Safe SQL with parameterized queries
- No direct DB access from n8n
- `nanoid` not needed here since `id` is auto-increment — but available if needed later
- Ready for Docker, PM2, or systemd deployment

You now have a **secure, production-ready gateway** between n8n and your MariaDB database.
