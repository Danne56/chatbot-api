// src/routes/userPreferenceRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');

const pool = require('../utils/db');

const router = express.Router();

/**
 * POST /api/preferences/opt-in
 * Mark a user as opted-in and update timestamps
 */
router.post(
  '/opt-in',
  body('contact_id').isInt({ min: 1 }),
  async (req, res) => {
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
      await db.execute(`
        INSERT INTO user_preferences (contact_id, has_opted_in, awaiting_optin, opted_in_at)
        VALUES (?, 1, 0, ?)
        ON DUPLICATE KEY UPDATE
          has_opted_in = 1,
          awaiting_optin = 0,
          opted_in_at = VALUES(opted_in_at),
          updated_at = ?
      `, [contact_id, now, now]);

      res.status(200).json({ success: true });
    } catch (err) {
      console.error('DB Error (preferences opt-in):', err);
      res.status(500).json({ error: 'Failed to update preference' });
    } finally {
      db.release();
    }
  }
);

/**
 * POST /api/preferences/opt-out
 * Mark a user as opted-out
 */
router.post(
  '/opt-out',
  body('contact_id').isInt({ min: 1 }),
  async (req, res) => {
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

      await db.execute(`
        INSERT INTO user_preferences (contact_id, has_opted_in, awaiting_optin, opted_out_at)
        VALUES (?, 0, 0, ?)
        ON DUPLICATE KEY UPDATE
          has_opted_in = 0,
          awaiting_optin = 0,
          opted_out_at = VALUES(opted_out_at),
          updated_at = ?
      `, [contact_id, now, now]);

      res.status(200).json({ success: true });
    } catch (err) {
      console.error('DB Error (preferences opt-out):', err);
      res.status(500).json({ error: 'Failed to update preference' });
    } finally {
      db.release();
    }
  }
);

/**
 * GET /api/preferences/:contact_id
 * Get user preferences by contact ID
 */
router.get('/:contact_id', async (req, res) => {
  const { contact_id } = req.params;
  const db = await pool.getConnection();

  try {
    const [rows] = await db.execute('SELECT * FROM user_preferences WHERE contact_id = ?', [contact_id]);
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
