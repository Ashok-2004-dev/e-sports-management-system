const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { wrap } = require('./helpers');

// 1) checks the JWT token and loads the user
const auth = wrap(async (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Please log in first.' });
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET); }
  catch { return res.status(401).json({ message: 'Session expired. Please log in again.' }); }
  const [rows] = await db.query('SELECT id,name,email,role,status FROM users WHERE id=?', [payload.id]);
  if (!rows.length || rows[0].status !== 'active') return res.status(401).json({ message: 'Account is not available.' });
  req.user = rows[0];
  next();
});

// 2) allows only one role (admin or player)
const requireRole = (role) => (req, res, next) =>
  req.user.role === role ? next() : res.status(403).json({ message: 'You do not have permission to do this.' });

// 3) finds the players-table id of the logged-in player
const withPlayer = wrap(async (req, res, next) => {
  const [rows] = await db.query('SELECT id FROM players WHERE user_id=?', [req.user.id]);
  if (!rows.length) return res.status(403).json({ message: 'Player profile not found.' });
  req.playerId = rows[0].id;
  next();
});

module.exports = { auth, requireRole, withPlayer };
