// Creates notifications. A failed notification must never break the action that caused it, so errors are only logged.
const db = require('../config/db');

const clean = (n) => [String(n.type || 'info').slice(0, 30), String(n.title).slice(0, 150), String(n.message).slice(0, 500), n.link || null];
const safe = async (fn) => { try { await fn(); } catch (e) { console.error('Notification failed:', e.message); } };

// one specific user (users.id)
const toUser = (userId, n) => safe(async () => {
  if (!userId) return;
  await db.query('INSERT INTO notifications (user_id,type,title,message,link) VALUES (?,?,?,?,?)', [userId, ...clean(n)]);
});
// every active administrator
const toAdmins = (n) => safe(() => db.query(
  "INSERT INTO notifications (user_id,type,title,message,link) SELECT id,?,?,?,? FROM users WHERE role='admin' AND status='active'", clean(n)));
// every active player (optionally skipping one user)
const toPlayers = (n, exceptUserId = 0) => safe(() => db.query(
  "INSERT INTO notifications (user_id,type,title,message,link) SELECT id,?,?,?,? FROM users WHERE role='player' AND status='active' AND id<>?", [...clean(n), exceptUserId]));
// approved members of one or more teams
const toTeams = (teamIds, n) => safe(async () => {
  const ids = [...new Set(teamIds.filter(Boolean))];
  if (!ids.length) return;
  await db.query(
    `INSERT INTO notifications (user_id,type,title,message,link)
     SELECT DISTINCT p.user_id,?,?,?,? FROM team_members tm JOIN players p ON p.id=tm.player_id
     WHERE tm.status='approved' AND tm.team_id IN (?)`, [...clean(n), ids]);
});
// a player, found by players.id
const toPlayer = (playerId, n) => safe(async () => {
  const [[p]] = await db.query('SELECT user_id FROM players WHERE id=?', [playerId]);
  if (p) await db.query('INSERT INTO notifications (user_id,type,title,message,link) VALUES (?,?,?,?,?)', [p.user_id, ...clean(n)]);
});

module.exports = { toUser, toAdmins, toPlayers, toTeams, toPlayer };
