const express = require('express');
const { body, validationResult } = require('express-validator');
const generateId = require('../utils/id-generator').generateId;

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
    const contact_id = generateId(12); // Generate unique ID
    const pref_id = generateId(12); // Generate unique ID
    const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const db = await pool.getConnection();

    try {
      const [existing] = await db.execute(
        'SELECT id FROM contacts WHERE phone_number = ?',
        [phone_number]
      );
      if (existing.length > 0) {
        return res
          .status(200)
          .json({ success: true, id: existing[0].id, existed: true });
      }

      await db.execute(
        'INSERT INTO contacts (id, phone_number, created_at) VALUES (?, ?, ?)',
        [contact_id, phone_number, created_at]
      );

      await db.execute(
        `INSERT INTO user_preferences
        (id, contact_id, has_opted_in, awaiting_optin, intro_sent_today)
        VALUES (?, ?, ?, ?, ?)`,
        [pref_id, contact_id, 0, 1, 1]
      );

      res.status(201).json({ success: true, id: contact_id, existed: false });
    } catch (err) {
      console.error('DB Error (contacts insert):', err);
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
    const [rows] = await db.execute(
      'SELECT * FROM contacts WHERE phone_number = ?',
      [phone_number]
    );

    if (rows.length === 0) {
      return res.status(200).json({ data: null });
    }

    res.status(200).json({ data: rows[0] });
  } catch (err) {
    console.error('DB Error (get contact):', err);
    res.status(500).json({ error: 'Failed to fetch contact' });
  } finally {
    db.release();
  }
});

module.exports = router;
