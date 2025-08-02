const express = require('express');
const { body, validationResult } = require('express-validator');
const { generateId } = require('../utils/id-generator');
const logger = require('../utils/logger');

const pool = require('../utils/db');

const router = express.Router();

/**
 * POST /api/messages
 * Log an incoming and/or outgoing message
 */
router.post(
  '/',
  body('contact_id').isString().trim().isLength({ min: 1, max: 12 }),
  body('message_in').isString().trim().notEmpty(),
  body('message_out').optional().isString().trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { contact_id, message_in, message_out } = req.body;
    const id = generateId(12); // Generate unique ID
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const db = await pool.getConnection();

    try {
      // Verify contact exists
      const [contact] = await db.execute(
        'SELECT id FROM contacts WHERE id = ?',
        [contact_id]
      );
      if (contact.length === 0) {
        return res.status(400).json({ error: 'Invalid contact_id' });
      }

      await db.execute(
        'INSERT INTO message_logs (id, contact_id, timestamp, message_in, message_out) VALUES (?, ?, ?, ?, ?)',
        [id, contact_id, timestamp, message_in, message_out || null]
      );

      logger.info({
        message: 'Message logged successfully',
        messageId: id,
        contactId: contact_id,
      });

      res.status(201).json({ success: true, id });
    } catch (err) {
      logger.error({
        message: 'DB Error (message_logs)',
        error: err.message,
      });
      res.status(500).json({ error: 'Failed to log message' });
    } finally {
      db.release();
    }
  }
);

module.exports = router;
