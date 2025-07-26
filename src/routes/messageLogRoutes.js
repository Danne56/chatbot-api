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
