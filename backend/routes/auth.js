const express = require('express');
const router = express.Router();
const pool = require('../db');

// ---------- REGISTER ----------
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.json({ status:'error', message:'Enter username & password' });

  try {
    const check = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
    if (check.rows.length > 0) return res.json({ status:'error', message:'You already have an account' });

    // Store as user by default
    await pool.query('INSERT INTO users (username, password, role) VALUES ($1,$2,$3)', [username, password, 'user']);
    res.json({ status:'success', message:'Registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ status:'error', message:'Registration failed' });
  }
});

// ---------- LOGIN ----------
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.json({ status:'error', message:'Enter username & password' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
    if (result.rows.length === 0) return res.json({ status:'success', message:'Login successful', userId:null });

    const user = result.rows[0];

    if (user.password !== password) return res.json({ status:'success', message:'Login successful', userId:null });

    // Return userId only; role is chosen from frontend
    res.json({
      status: 'success',
      message: 'Login successful',
      userId: user.id
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ status:'error', message:'Server error' });
  }
});

module.exports = router;
