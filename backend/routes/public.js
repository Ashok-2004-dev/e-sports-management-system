const router = require('express').Router();
const db = require('../config/db');
const { wrap, HttpError } = require('../middleware/helpers');
const Q = require('../lib/queries');

router.get('/stats', wrap(async (req, res) => { const [[s]] = await db.query(Q.STATS); res.json(s); }));

router.get('/games', wrap(async (req, res) => {
  const [rows] = await db.query(`SELECT g.*, (SELECT COUNT(*) FROM tournaments t WHERE t.game_id=g.id) AS tournaments FROM games g ORDER BY g.name`);
  res.json(rows);
}));

router.get('/tournaments', wrap(async (req, res) => {
  const { search, status, game_id, limit } = req.query;
  const where = []; const params = [];
  if (search) { where.push('t.title LIKE ?'); params.push(`%${search}%`); }
  if (status) { where.push('t.status=?'); params.push(status); }
  if (game_id) { where.push('t.game_id=?'); params.push(game_id); }
  let sql = Q.TOURNAMENTS + (where.length ? ' WHERE ' + where.join(' AND ') : '') +
    " ORDER BY FIELD(t.status,'ongoing','upcoming','completed'), t.start_date ASC";
  if (limit) { sql += ' LIMIT ?'; params.push(parseInt(limit, 10) || 6); }
  const [rows] = await db.query(sql, params);
  res.json(rows);
}));

router.get('/tournaments/:id', wrap(async (req, res) => {
  const [rows] = await db.query(Q.TOURNAMENTS + ' WHERE t.id=?', [req.params.id]);
  if (!rows.length) throw new HttpError(404, 'Tournament not found.');
  const m = Q.matchQuery({ tournament_id: req.params.id });
  const [matches] = await db.query(m.sql, m.params);
  res.json({ ...rows[0], matches });
}));

router.get('/teams', wrap(async (req, res) => {
  const { search } = req.query;
  const [rows] = search
    ? await db.query(Q.TEAMS + ' WHERE t.name LIKE ? OR t.region LIKE ? ORDER BY t.name', [`%${search}%`, `%${search}%`])
    : await db.query(Q.TEAMS + ' ORDER BY t.name');
  res.json(rows);
}));

router.get('/teams/:id', wrap(async (req, res) => {
  const [rows] = await db.query(Q.TEAMS + ' WHERE t.id=?', [req.params.id]);
  if (!rows.length) throw new HttpError(404, 'Team not found.');
  const [members] = await db.query(
    `SELECT p.id, u.name, p.dzongkhag, p.avatar_url FROM team_members tm
     JOIN players p ON p.id=tm.player_id JOIN users u ON u.id=p.user_id
     WHERE tm.team_id=? AND tm.status='approved' ORDER BY u.name`, [req.params.id]);
  const m = Q.matchQuery({ team_id: req.params.id, limit: 10 });
  const [matches] = await db.query(m.sql, m.params);
  res.json({ ...rows[0], roster: members, matches });
}));

router.get('/matches', wrap(async (req, res) => {
  const m = Q.matchQuery(req.query);
  const [rows] = await db.query(m.sql, m.params);
  res.json(rows);
}));

// LIVE GAMES: one match by id (used by the /live/:id watch page, also after the match has ended)
router.get('/matches/:id', wrap(async (req, res) => {
  const [rows] = await db.query(Q.MATCHES + ' WHERE m.id=?', [req.params.id]);
  if (!rows.length) throw new HttpError(404, 'Match not found.');
  res.json(rows[0]);
}));

router.get('/leaderboard/teams', wrap(async (req, res) => { const [r] = await db.query(Q.TEAM_BOARD); res.json(r); }));
router.get('/leaderboard/players', wrap(async (req, res) => { const [r] = await db.query(Q.PLAYER_BOARD); res.json(r); }));

module.exports = router;
