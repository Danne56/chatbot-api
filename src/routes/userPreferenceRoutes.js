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
        INSERT INTO user_preferences (contact_id, has_opted_in, awaiting_optin, intro_sent_today, opted_in_at)
        VALUES (?, 1, 0, 0, ?)
        ON DUPLICATE KEY UPDATE
          has_opted_in = 1,
          awaiting_optin = 0,
          opted_in_at = VALUES(opted_in_at),
          updated_at = CURRENT_TIMESTAMP
      `, [contact_id, now]);

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
        INSERT INTO user_preferences (contact_id, has_opted_in, awaiting_optin, intro_sent_today, opted_out_at)
        VALUES (?, 0, 0, 0, ?)
        ON DUPLICATE KEY UPDATE
          has_opted_in = 0,
          awaiting_optin = 0,
          opted_out_at = VALUES(opted_out_at),
          updated_at = CURRENT_TIMESTAMP
      `, [contact_id, now]);

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

/**
 * POST /api/preferences/intro-sent
 * Mark that daily intro has been sent to user
 */
router.post(
  '/intro-sent',
  body('contact_id').isInt({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { contact_id } = req.body;
    const db = await pool.getConnection();

    try {
      // Verify contact exists
      const [contact] = await db.execute('SELECT id FROM contacts WHERE id = ?', [contact_id]);
      if (contact.length === 0) {
        return res.status(400).json({ error: 'Invalid contact_id' });
      }

      // Update intro_sent_today flag
      await db.execute(`
        INSERT INTO user_preferences (contact_id, intro_sent_today)
        VALUES (?, 1)
        ON DUPLICATE KEY UPDATE
          intro_sent_today = 1,
          updated_at = CURRENT_TIMESTAMP
      `, [contact_id]);

      res.status(200).json({ success: true });
    } catch (err) {
      console.error('DB Error (intro sent):', err);
      res.status(500).json({ error: 'Failed to update intro status' });
    } finally {
      db.release();
    }
  }
);

/**
 * POST /api/preferences/reset-intro
 * Reset daily intro flags (typically called daily via cron)
 */
router.post('/reset', async (req, res) => {
  const db = await pool.getConnection();

  try {
    const [result] = await db.execute('UPDATE user_preferences SET intro_sent_today = 0');
    res.status(200).json({ 
      success: true, 
      message: `Reset intro flags for ${result.affectedRows} users` 
    });
  } catch (err) {
    console.error('DB Error (reset intro):', err);
    res.status(500).json({ error: 'Failed to reset intro flags' });
  } finally {
    db.release();
  }
});

module.exports = router;
