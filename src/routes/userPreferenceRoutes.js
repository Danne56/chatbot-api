const express = require('express');
const { validationResult, param } = require('express-validator');

const pool = require('../utils/db');

const router = express.Router();

/**
 * PUT /api/preferences/opt-in
 * Mark a user as opted-in and update timestamps
 */
router.put(
  '/opt-in/:contact_id',
  param('contact_id').isString().isLength({ min: 10, max: 12 }), // Changed to accept nanoid(12) string
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { contact_id } = req.params;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const db = await pool.getConnection();

    try {
      // Verify contact exists
      const [contact] = await db.execute(
        'SELECT id FROM contacts WHERE id = ?',
        [contact_id]
      );
      if (contact.length === 0) {
        return res.status(400).json({ error: 'Contact not found' });
      }

      // Only perform UPDATE. This will affect 0 rows if no preference record exists.
      const [result] = await db.execute(
        `
        UPDATE user_preferences
        SET
          has_opted_in = 1,
          awaiting_optin = 0,
          opted_in_at = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE contact_id = ?
      `,
        [now, contact_id]
      );

      // Check if any row was actually updated
      if (result.affectedRows === 0) {
        // No existing preference record was found to update
        return res
          .status(404)
          .json({ error: 'User preference record not found for this contact' });
      }

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
 * PUT /api/preferences/opt-out
 * Mark a user as opted-out
 */
router.put(
  '/opt-out/:contact_id',
  param('contact_id').isString().isLength({ min: 10, max: 12 }), // Changed to accept nanoid(12) string
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { contact_id } = req.params;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const db = await pool.getConnection();

    try {
      // Verify contact exists
      const [contact] = await db.execute(
        'SELECT id FROM contacts WHERE id = ?',
        [contact_id]
      );
      if (contact.length === 0) {
        return res.status(400).json({ error: 'Contact not found' });
      }

      // Only perform UPDATE. This will affect 0 rows if no preference record exists.
      const [result] = await db.execute(
        `
        UPDATE user_preferences
        SET
          has_opted_in = 0,
          awaiting_optin = 0,
          opted_out_at = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE contact_id = ?
      `,
        [now, contact_id]
      );

      // Check if any row was actually updated
      if (result.affectedRows === 0) {
        // No existing preference record was found to update
        return res
          .status(404)
          .json({ error: 'User preference record not found for this contact' });
      }

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
 * Get user preferences by contact ID (returns pref_id as 'id' field)
 */
router.get('/:contact_id', async (req, res) => {
  const { contact_id } = req.params;
  const db = await pool.getConnection();

  try {
    const [rows] = await db.execute(
      'SELECT * FROM user_preferences WHERE contact_id = ?',
      [contact_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Preferences not found' });
    }
    // Returns all fields including 'id' (pref_id), contact_id, has_opted_in, etc.
    res.json(rows[0]);
  } catch (err) {
    console.error('DB Error (get preferences):', err);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  } finally {
    db.release();
  }
});

/**
 * PUT /api/preferences/intro-sent
 * Mark that daily intro has been sent to user
 */
router.put(
  '/intro-sent/:contact_id',
  param('contact_id').isString().isLength({ min: 10, max: 12 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { contact_id } = req.params;
    const db = await pool.getConnection();

    try {
      // Verify contact exists
      const [contact] = await db.execute(
        'SELECT id FROM contacts WHERE id = ?',
        [contact_id]
      );
      if (contact.length === 0) {
        return res.status(400).json({ error: 'Contact not found' });
      }

      // Update intro_sent_today flag
      const [result] = await db.execute(
        `
        UPDATE user_preferences
        SET
          intro_sent_today = 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE contact_id = ?
      `,
        [contact_id]
      );

      // Check if any row was actually updated
      if (result.affectedRows === 0) {
        // No existing preference record was found to update
        return res
          .status(404)
          .json({ error: 'User preference record not found for this contact' });
      }

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
 * POST /api/preferences/reset
 * Reset daily intro flags (typically called daily via cron)
 */
router.post('/reset', async (req, res) => {
  const db = await pool.getConnection();

  try {
    const [result] = await db.execute(
      'UPDATE user_preferences SET has_opted_in = 0, awaiting_optin = 1, intro_sent_today = 0'
    );
    res.status(200).json({
      success: true,
      message: `Reset intro flags for ${result.affectedRows} users`,
    });
  } catch (err) {
    console.error('DB Error (reset intro):', err);
    res.status(500).json({ error: 'Failed to reset intro flags' });
  } finally {
    db.release();
  }
});

module.exports = router;
