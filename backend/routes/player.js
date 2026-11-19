const router = require('express').Router();
const db = require('../config/db');
const { auth, requireRole, withPlayer } = require('../middleware/auth');
const { wrap, need, nn, img, HttpError } = require('../middleware/helpers');
const Q = require('../lib/queries');
const notify = require('../lib/notify');

router.use(auth, requireRole('player'), withPlayer);
router.post('/upload', require('../middleware/upload'));

// helper: the player's team membership (or undefined)
async function membership(playerId) {
  const [rows] = await db.query(
    `SELECT tm.team_id, tm.status AS member_status, t.name, t.region, t.coach_name, t.captain_id, t.logo_url
     FROM team_members tm JOIN teams t ON t.id=tm.team_id WHERE tm.player_id=?`, [playerId]);
  return rows[0];
}

const phoneOk = (p) => /^(?:\+?975)?(?:17|77)\d{6}$|^\+?[0-9]{7,15}$/.test(String(p || '').replace(/[\s-]/g, ''));

router.get('/profile', wrap(async (req, res) => {
  const [[p]] = await db.query(
    `SELECT u.name,u.email,p.dzongkhag,p.contact_no,p.avatar_url FROM players p JOIN users u ON u.id=p.user_id WHERE p.id=?`, [req.playerId]);
  res.json(p);
}));

router.put('/profile', wrap(async (req, res) => {
  const { name, dzongkhag, contact_no, avatar_url } = req.body;
  const cleanedPhone = String(contact_no || '').replace(/[\s-]/g, '');
  need(name && name.trim().length >= 2, 'Name must be at least 2 characters.');
  if (cleanedPhone) need(phoneOk(cleanedPhone), 'Enter a valid phone number.');
  await db.query('UPDATE users SET name=? WHERE id=?', [name.trim(), req.user.id]);
  await db.query('UPDATE players SET dzongkhag=?,contact_no=?,avatar_url=? WHERE id=?',
    [nn(dzongkhag), nn(cleanedPhone), img(avatar_url), req.playerId]);
  notify.toUser(req.user.id, { type: 'account', title: 'Profile updated', message: 'Your profile changes were saved.', link: '/player/profile' });
  notify.toAdmins({ type: 'player', title: 'Player updated profile', message: `${name.trim()} updated their profile.`, link: '/admin/players' });
  res.json({ message: 'Profile updated.' });
}));

router.get('/overview', wrap(async (req, res) => {
  const [[c]] = await db.query('SELECT COUNT(*) AS registrations FROM registrations WHERE player_id=?', [req.playerId]);
  const mem = await membership(req.playerId);
  let nextMatches = [];
  if (mem && mem.member_status === 'approved') {
    const q = Q.matchQuery({ status: 'scheduled', team_id: mem.team_id, limit: 3 });
    [nextMatches] = await db.query(q.sql, q.params);
  }
  res.json({ registrations: c.registrations, team: mem && mem.member_status === 'approved' ? mem.name : null, nextMatches });
}));

// ---- tournament registrations ----
router.get('/registrations', wrap(async (req, res) => {
  const [rows] = await db.query(
    `SELECT r.id, r.status, r.registered_at, t.id AS tournament_id, t.title, t.start_date, t.status AS tournament_status,
            g.name AS game, tm.name AS team
     FROM registrations r JOIN tournaments t ON t.id=r.tournament_id JOIN games g ON g.id=t.game_id
     LEFT JOIN teams tm ON tm.id=r.team_id WHERE r.player_id=? ORDER BY r.registered_at DESC`, [req.playerId]);
  res.json(rows);
}));

router.post('/registrations', wrap(async (req, res) => {
  const { tournament_id } = req.body;
  const [[t]] = await db.query('SELECT title, status, registration_deadline >= CURDATE() AS is_open FROM tournaments WHERE id=?', [tournament_id]);
  if (!t) throw new HttpError(404, 'Tournament not found.');
  need(t.status === 'upcoming' && t.is_open, 'Registration for this tournament is closed.');
  const mem = await membership(req.playerId);
  const teamId = mem && mem.member_status === 'approved' ? mem.team_id : null;
  await db.query('INSERT INTO registrations (tournament_id,player_id,team_id) VALUES (?,?,?)', [tournament_id, req.playerId, teamId]);
  notify.toAdmins({ type: 'registration', title: 'New tournament registration', message: `${req.user.name} registered for ${t.title} and is waiting for approval.`, link: '/admin/registrations' });
  notify.toUser(req.user.id, { type: 'registration', title: 'Registration submitted', message: `Your registration for ${t.title} is waiting for admin approval.`, link: '/player/registrations' });
  res.status(201).json({ message: 'Registration submitted. Waiting for admin approval.' });
}));

router.delete('/registrations/:id', wrap(async (req, res) => {
  const [[old]] = await db.query('SELECT t.title FROM registrations r JOIN tournaments t ON t.id=r.tournament_id WHERE r.id=? AND r.player_id=?', [req.params.id, req.playerId]);
  const [r] = await db.query('DELETE FROM registrations WHERE id=? AND player_id=?', [req.params.id, req.playerId]);
  if (!r.affectedRows) throw new HttpError(404, 'Registration not found.');
  notify.toAdmins({ type: 'registration', title: 'Registration cancelled', message: `${req.user.name} cancelled their registration for ${old.title}.`, link: '/admin/registrations' });
  res.json({ message: 'Registration cancelled.' });
}));

// ---- teams ----
router.get('/team', wrap(async (req, res) => {
  const mem = await membership(req.playerId);
  if (!mem) return res.json({ team: null });
  let roster = [], requests = [];
  if (mem.member_status === 'approved') {
    [roster] = await db.query(
      `SELECT p.id, u.name, p.avatar_url FROM team_members tm JOIN players p ON p.id=tm.player_id JOIN users u ON u.id=p.user_id
       WHERE tm.team_id=? AND tm.status='approved'`, [mem.team_id]);
    if (mem.captain_id === req.playerId)
      [requests] = await db.query(
        `SELECT p.id, u.name, p.avatar_url FROM team_members tm JOIN players p ON p.id=tm.player_id JOIN users u ON u.id=p.user_id
         WHERE tm.team_id=? AND tm.status='pending'`, [mem.team_id]);
  }
  res.json({ team: { id: mem.team_id, name: mem.name, region: mem.region, coach_name: mem.coach_name, logo_url: mem.logo_url },
    status: mem.member_status, isCaptain: mem.captain_id === req.playerId, roster, requests });
}));

router.post('/teams', wrap(async (req, res) => {
  const { name, region, coach_name } = req.body;
  need(name && name.trim().length >= 3, 'Team name must be at least 3 characters.');
  need(!(await membership(req.playerId)), 'Leave your current team or cancel your join request first.');
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [t] = await conn.query('INSERT INTO teams (name,region,coach_name,captain_id) VALUES (?,?,?,?)',
      [name.trim(), nn(region), nn(coach_name), req.playerId]);
    await conn.query('INSERT INTO team_members (team_id,player_id,status) VALUES (?,?,"approved")', [t.insertId, req.playerId]);
    await conn.commit();
    notify.toAdmins({ type: 'team', title: 'New team created', message: `${req.user.name} created the team ${name.trim()}.`, link: '/admin/teams' });
    notify.toPlayers({ type: 'team', title: 'New team created', message: `Team ${name.trim()} is open for join requests.`, link: '/player/teams' }, req.user.id);
    res.status(201).json({ message: 'Team created. You are the captain.' });
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
}));

router.post('/teams/:id/join', wrap(async (req, res) => {
  need(!(await membership(req.playerId)), 'You already belong to a team or have a pending request.');
  const [[t]] = await db.query('SELECT id, name, captain_id FROM teams WHERE id=?', [req.params.id]);
  if (!t) throw new HttpError(404, 'Team not found.');
  await db.query('INSERT INTO team_members (team_id,player_id,status) VALUES (?,?,"pending")', [t.id, req.playerId]);
  notify.toPlayer(t.captain_id, { type: 'team', title: 'New join request', message: `${req.user.name} wants to join ${t.name}.`, link: '/player/team' });
  notify.toAdmins({ type: 'team', title: 'Team join request', message: `${req.user.name} asked to join ${t.name}.`, link: '/admin/teams' });
  res.status(201).json({ message: 'Join request sent. The team captain must approve it.' });
}));

router.put('/team/requests/:playerId', wrap(async (req, res) => {
  const mem = await membership(req.playerId);
  need(mem && mem.captain_id === req.playerId, 'Only the team captain can do this.');
  const { action } = req.body;
  need(['approve', 'reject'].includes(action), 'Invalid action.');
  const sql = action === 'approve'
    ? 'UPDATE team_members SET status="approved" WHERE team_id=? AND player_id=? AND status="pending"'
    : 'DELETE FROM team_members WHERE team_id=? AND player_id=? AND status="pending"';
  const [r] = await db.query(sql, [mem.team_id, req.params.playerId]);
  if (!r.affectedRows) throw new HttpError(404, 'Request not found.');
  notify.toPlayer(req.params.playerId, { type: 'team', title: action === 'approve' ? 'Join request approved' : 'Join request rejected', message: action === 'approve' ? `You are now a member of ${mem.name}.` : `Your request to join ${mem.name} was rejected.`, link: '/player/team' });
  res.json({ message: action === 'approve' ? 'Player added to your team.' : 'Request rejected.' });
}));

router.post('/team/leave', wrap(async (req, res) => {
  const mem = await membership(req.playerId);
  need(mem, 'You are not in a team.');
  await db.query('DELETE FROM team_members WHERE player_id=?', [req.playerId]);
  if (mem.member_status === 'approved' && mem.captain_id === req.playerId) {
    const [next] = await db.query('SELECT player_id FROM team_members WHERE team_id=? AND status="approved" ORDER BY joined_at LIMIT 1', [mem.team_id]);
    if (next.length) {
      await db.query('UPDATE teams SET captain_id=? WHERE id=?', [next[0].player_id, mem.team_id]);
      notify.toPlayer(next[0].player_id, { type: 'team', title: 'You are the new captain', message: `${req.user.name} left ${mem.name}, so you are now the team captain.`, link: '/player/team' });
    } else {
      await db.query('DELETE FROM teams WHERE id=?', [mem.team_id]);
      notify.toAdmins({ type: 'team', title: 'Team removed', message: `${mem.name} was removed because its last member left.`, link: '/admin/teams' });
    }
  } else if (mem.member_status === 'approved') {
    notify.toPlayer(mem.captain_id, { type: 'team', title: 'Member left your team', message: `${req.user.name} left ${mem.name}.`, link: '/player/team' });
  }
  res.json({ message: 'You have left the team.' });
}));

module.exports = router;
