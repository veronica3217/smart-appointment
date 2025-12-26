const express = require('express');
const router = express.Router();
const pool = require('../db');

// ADD SLOT
router.post('/addslot', async (req, res) => {
  const { doctor, slot } = req.body;
  try {
    await pool.query(
      'INSERT INTO doctor_slots (doctor, slot) VALUES ($1, $2)',
      [doctor, slot]
    );
    res.json({ status: 'success', message: 'Slot added successfully' });
  } catch (err) {
    console.error(err);
    res.json({ status: 'error', message: 'Database error' });
  }
});

// VIEW ALL APPOINTMENTS
router.get('/appointments', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT name, age, doctor, slot FROM appointments ORDER BY slot'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error loading appointments' });
  }
});

module.exports = router;
