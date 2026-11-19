// Notifications for the logged-in user (works for both Admin and Player dashboards)
const router = require('express').Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');
const { wrap } = require('../middleware/helpers');

router.use(auth);

router.get('/', wrap(async (req, res) => {
  const [items] = await db.query('SELECT id,type,title,message,link,is_read,created_at FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 50', [req.user.id]);
  const [[c]] = await db.query('SELECT COUNT(*) AS n FROM notifications WHERE user_id=? AND is_read=0', [req.user.id]);
  res.json({ items, unread: c.n });
}));
router.put('/read-all', wrap(async (req, res) => {
  await db.query('UPDATE notifications SET is_read=1 WHERE user_id=?', [req.user.id]);
  res.json({ message: 'All notifications marked as read.' });
}));
router.put('/:id/read', wrap(async (req, res) => {
  await db.query('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  res.json({ message: 'Marked as read.' });
}));
router.delete('/', wrap(async (req, res) => {
  await db.query('DELETE FROM notifications WHERE user_id=?', [req.user.id]);
  res.json({ message: 'Notifications cleared.' });
}));
router.delete('/:id', wrap(async (req, res) => {
  await db.query('DELETE FROM notifications WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  res.json({ message: 'Notification removed.' });
}));

module.exports = router;
