const router = require('express').Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { auth } = require('../middleware/auth');
const { wrap, need } = require('../middleware/helpers');
const notify = require('../lib/notify');
const sendMail = require('../lib/mailer');

const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '');
const phoneOk = (p) => /^(?:\+?975)?(?:17|77)\d{6}$|^\+?[0-9]{7,15}$/.test(String(p || '').replace(/[\s-]/g, ''));
const sign = (u) => jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '8h' });

router.post('/register', wrap(async (req, res) => {
  const { name, email, password, dzongkhag, contact_no } = req.body;
  const cleanedPhone = String(contact_no || '').replace(/[\s-]/g, '');
  need(name && name.trim().length >= 2, 'Name must be at least 2 characters.');
  need(emailOk(email), 'Enter a valid email address.');
  need(password && password.length >= 6, 'Password must be at least 6 characters.');
  need(phoneOk(cleanedPhone), 'Enter a valid phone number (e.g., 17XXXXXX or 77XXXXXX).');

  const hash = await bcrypt.hash(password, 10);
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [u] = await conn.query('INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,"player")',
      [name.trim(), email.trim().toLowerCase(), hash]);
    await conn.query('INSERT INTO players (user_id,dzongkhag,contact_no) VALUES (?,?,?)',
      [u.insertId, dzongkhag || null, cleanedPhone]);
    await conn.commit();
    const user = { id: u.insertId, name: name.trim(), email: email.trim().toLowerCase(), role: 'player' };
    notify.toAdmins({ type: 'player', title: 'New player registered', message: `${user.name} (${user.email}) created a player account.`, link: '/admin/players' });
    notify.toUser(u.insertId, { type: 'account', title: 'Welcome to E-Sports MS', message: 'Your account is ready. Join a team and register for a tournament to get started.', link: '/player/tournaments' });
    res.status(201).json({ token: sign(user), user });
  } catch (e) { await conn.rollback(); throw e; }
  finally { conn.release(); }
}));

// ---- Social OAuth Login / Sign-up (Google / Gmail & Facebook) ----
router.post('/social', wrap(async (req, res) => {
  const { provider, credential, accessToken } = req.body;
  need(provider === 'google' || provider === 'facebook', 'Unsupported social login provider.');

  let email = '';
  let name = '';
  let providerId = '';
  let avatarUrl = null;

  if (provider === 'google') {
    need(credential, 'Missing Google credential token.');
    const gRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    const payload = await gRes.json();
    if (!gRes.ok || !payload.email) {
      return res.status(401).json({ message: 'Invalid or expired Google token.' });
    }
    if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ message: 'Google Client ID mismatch.' });
    }
    email = payload.email.trim().toLowerCase();
    name = (payload.name || email.split('@')[0]).trim();
    providerId = payload.sub;
    avatarUrl = payload.picture || null;
  } else {
    need(accessToken, 'Missing Facebook access token.');
    const fbRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`
    );
    const payload = await fbRes.json();
    if (!fbRes.ok || !payload.id) {
      return res.status(401).json({ message: 'Invalid or expired Facebook token.' });
    }
    need(payload.email, 'Your Facebook account did not share an email address. Please allow email permission.');
    email = payload.email.trim().toLowerCase();
    name = (payload.name || email.split('@')[0]).trim();
    providerId = payload.id;
    avatarUrl = payload.picture?.data?.url || null;
  }

  const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  let u = existing[0];

  if (u) {
    if (u.role === 'admin') {
      return res.status(403).json({ message: 'Admin accounts must log in via the Admin portal.' });
    }
    if (u.status !== 'active') {
      return res.status(403).json({ message: 'This account has been deactivated.' });
    }
    await db.query(
      'UPDATE users SET auth_provider = ?, provider_id = ?, avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
      [provider, providerId, avatarUrl, u.id]
    );
  } else {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [ins] = await conn.query(
        'INSERT INTO users (name, email, password_hash, role, auth_provider, provider_id, avatar_url) VALUES (?, ?, NULL, "player", ?, ?, ?)',
        [name, email, provider, providerId, avatarUrl]
      );
      await conn.query('INSERT INTO players (user_id, avatar_url) VALUES (?, ?)', [ins.insertId, avatarUrl]);
      await conn.commit();
      u = { id: ins.insertId, name, email, role: 'player' };

      notify.toAdmins({
        type: 'player',
        title: 'New player registered',
        message: `${u.name} (${u.email}) signed in with ${provider === 'google' ? 'Google' : 'Facebook'}.`,
        link: '/admin/players',
      });
      notify.toUser(u.id, {
        type: 'account',
        title: 'Welcome to E-Sports MS',
        message: 'Your account is ready. Complete your profile, join a team, and register for a tournament.',
        link: '/player/profile',
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  const user = { id: u.id, name: u.name, email: u.email, role: u.role };
  res.json({ token: sign(user), user });
}));

// ---- first-time Admin setup (works only while NO admin exists) ----
router.get('/setup-status', wrap(async (req, res) => {
  const [[r]] = await db.query("SELECT COUNT(*) AS n FROM users WHERE role='admin'");
  res.json({ needsSetup: r.n === 0, keyConfigured: !!process.env.ADMIN_SETUP_KEY });
}));

router.post('/setup-admin', wrap(async (req, res) => {
  const { name, email, password, setupKey } = req.body;
  const expected = process.env.ADMIN_SETUP_KEY;
  if (!expected) return res.status(500).json({ message: 'ADMIN_SETUP_KEY is not set in backend/.env.' });
  const a = Buffer.from(String(setupKey || '')), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(403).json({ message: 'Incorrect setup code.' });
  need(name && name.trim().length >= 2, 'Name must be at least 2 characters.');
  need(emailOk(email), 'Enter a valid email address.');
  need(password && password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password), 'Password must be at least 8 characters with letters and numbers.');
  const hash = await bcrypt.hash(password, 10);
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[r]] = await conn.query("SELECT COUNT(*) AS n FROM users WHERE role='admin' FOR UPDATE");
    if (r.n > 0) { await conn.rollback(); return res.status(403).json({ message: 'An admin already exists. Setup is closed.' }); }
    const [u] = await conn.query('INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,"admin")', [name.trim(), email.trim().toLowerCase(), hash]);
    await conn.commit();
    const user = { id: u.insertId, name: name.trim(), email: email.trim().toLowerCase(), role: 'admin' };
    res.status(201).json({ token: sign(user), user });
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
}));

router.post('/login', wrap(async (req, res) => {
  const identifier = String(req.body.identifier || req.body.email || '').trim();
  const { password } = req.body;
  need(identifier && password, 'Enter your username or email and your password.');
  const [rows] = await db.query('SELECT * FROM users WHERE email=? OR username=?', [identifier.toLowerCase(), identifier]);
  const u = rows[0];
  if (!u) return res.status(401).json({ message: 'Incorrect username/email or password.' });
  if (!u.password_hash) {
    const prov = u.auth_provider === 'facebook' ? 'Facebook' : 'Gmail';
    return res.status(401).json({ message: `This account uses ${prov} login. Click "Continue with ${prov}" below.` });
  }
  if (!(await bcrypt.compare(password, u.password_hash))) return res.status(401).json({ message: 'Incorrect username/email or password.' });
  if (u.status !== 'active') return res.status(403).json({ message: 'This account has been deactivated.' });
  const user = { id: u.id, name: u.name, email: u.email, role: u.role };
  res.json({ token: sign(user), user });
}));

// ---- forgot password (players and admins) ----
const MAX_ATTEMPTS = 5;
const roleOf = (scope) => (scope === 'admin' ? 'admin' : 'player');
const findAccount = async (identifier, scope) => {
  const [rows] = await db.query('SELECT * FROM users WHERE (email=? OR username=?) AND role=? AND status="active"', [identifier.toLowerCase(), identifier, roleOf(scope)]);
  return rows[0];
};

router.post('/forgot-password', wrap(async (req, res) => {
  const identifier = String(req.body.identifier || '').trim();
  need(identifier, 'Enter your username or email.');
  const u = await findAccount(identifier, req.body.scope);
  if (u) {
    const [[recent]] = await db.query('SELECT COUNT(*) AS n FROM password_resets WHERE user_id=? AND created_at > (NOW() - INTERVAL 1 MINUTE)', [u.id]);
    if (recent.n === 0) {
      const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
      await db.query('DELETE FROM password_resets WHERE user_id=?', [u.id]);
      await db.query('INSERT INTO password_resets (user_id, code_hash, expires_at) VALUES (?,?, NOW() + INTERVAL 15 MINUTE)', [u.id, await bcrypt.hash(code, 10)]);
      console.log(`[Password Reset] ${u.role.toUpperCase()} (${u.email}) -> 6-digit code: ${code}`);
      await sendMail(u.email, 'Your E-Sports MS password reset code', `Hello ${u.name},\n\nYour password reset code is ${code}\nIt expires in 15 minutes. If you did not ask for this, ignore this message.`);
      if (!process.env.SMTP_HOST) {
        return res.json({ message: `Reset code generated (Local Dev Mode): ${code}`, devCode: code });
      }
    }
  }
  res.json({ message: 'If that account exists, a 6-digit reset code has been sent to its email address.' });
}));

router.post('/reset-password', wrap(async (req, res) => {
  const identifier = String(req.body.identifier || '').trim();
  const code = String(req.body.code || '').trim();
  const { password } = req.body;
  need(identifier && code, 'Enter your username or email and the reset code.');
  const admin = roleOf(req.body.scope) === 'admin';
  need(admin ? (password && password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)) : (password && password.length >= 6),
    admin ? 'Password must be at least 8 characters with letters and numbers.' : 'Password must be at least 6 characters.');
  const bad = () => res.status(400).json({ message: 'That code is wrong or has expired. Request a new one.' });
  const u = await findAccount(identifier, req.body.scope);
  if (!u) return bad();
  const [[r]] = await db.query('SELECT * FROM password_resets WHERE user_id=? AND expires_at > NOW() ORDER BY id DESC LIMIT 1', [u.id]);
  if (!r || r.attempts >= MAX_ATTEMPTS) return bad();
  if (!(await bcrypt.compare(code, r.code_hash))) {
    await db.query('UPDATE password_resets SET attempts = attempts + 1 WHERE id=?', [r.id]);
    return bad();
  }
  await db.query('UPDATE users SET password_hash=? WHERE id=?', [await bcrypt.hash(password, 10), u.id]);
  await db.query('DELETE FROM password_resets WHERE user_id=?', [u.id]);
  notify.toUser(u.id, { type: 'account', title: 'Password changed', message: 'Your password was reset. If this was not you, contact an administrator.', link: null });
  res.json({ message: 'Password updated. You can log in now.' });
}));

router.get('/me', auth, (req, res) => {
  const { id, name, email, role } = req.user;
  res.json({ id, name, email, role });
});

module.exports = router;
