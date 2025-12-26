const express = require('express');
const router = express.Router();
const pool = require('../db');

// ---------- GET ALL DOCTORS ----------
router.get('/doctors', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT doctor FROM doctor_slots ORDER BY doctor'
    );
    res.json({ doctors: result.rows.map(r => r.doctor) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ doctors: [] });
  }
});

// ---------- GET SLOTS FOR A DOCTOR ----------
router.get('/slots', async (req, res) => {
  const { doctor } = req.query;
  if (!doctor) return res.json({ slots: [] });

  try {
    const result = await pool.query(
      `
      SELECT ds.slot,
      EXISTS (
        SELECT 1 FROM appointments a
        WHERE a.doctor = ds.doctor AND a.slot = ds.slot
      ) AS booked
      FROM doctor_slots ds
      WHERE ds.doctor = $1
      ORDER BY ds.slot
      `,
      [doctor]
    );

    // Convert timestamp → frontend format
    const slots = result.rows.map(r => ({
      slot: r.slot.toISOString().slice(0, 16), // YYYY-MM-DDTHH:MM
      booked: r.booked
    }));

    res.json({ slots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ slots: [] });
  }
});

// ---------- BOOK A SLOT ----------
router.post('/book', async (req, res) => {
  const { userId, name, age, gender, phone, doctor, slot } = req.body;

  if (!userId || !name || !age || !gender || !phone || !doctor || !slot) {
    return res.json({ status: 'error', message: 'Missing fields' });
  }

  try {
    // Prevent double booking
    const check = await pool.query(
      'SELECT 1 FROM appointments WHERE doctor=$1 AND slot=$2',
      [doctor, slot]
    );

    if (check.rows.length > 0) {
      return res.json({ status: 'error', message: 'Slot already booked' });
    }

    await pool.query(
      `
      INSERT INTO appointments
      (user_id, name, age, gender, phone, doctor, slot)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      `,
      [userId, name, age, gender, phone, doctor, slot]
    );

    res.json({ status: 'success', message: 'Booking successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Booking failed' });
  }
});

module.exports = router;
