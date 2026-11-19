const router = require('express').Router();
const db = require('../config/db');
const { auth, requireRole } = require('../middleware/auth');
const { wrap, need, nn, dt, img, HttpError } = require('../middleware/helpers');
const Q = require('../lib/queries');
const notify = require('../lib/notify');

router.use(auth, requireRole('admin'));
router.post('/upload', require('../middleware/upload'));
const like = (s) => `%${s || ''}%`;
const matchLabel = async (a, b) => {
  const [[n]] = await db.query('SELECT t1.name AS a, t2.name AS b FROM teams t1, teams t2 WHERE t1.id=? AND t2.id=?', [a, b]);
  return n ? `${n.a} vs ${n.b}` : 'A match';
};
const gone = (r, what) => { if (!r.affectedRows) throw new HttpError(404, `${what} not found.`); };

// ---- dashboard ----
router.get('/stats', wrap(async (req, res) => {
  const [[stats]] = await db.query(Q.STATS);
  const [activities] = await db.query(`
    (SELECT 'player' AS type, CONCAT(name,' joined the platform') AS text, created_at AS happened_at FROM users WHERE role='player')
    UNION ALL (SELECT 'registration', CONCAT(u.name,' registered for ',t.title), r.registered_at
       FROM registrations r JOIN players p ON p.id=r.player_id JOIN users u ON u.id=p.user_id JOIN tournaments t ON t.id=r.tournament_id)
    UNION ALL (SELECT 'result', CONCAT('Result published: ',t1.name,' ',rs.score1,' - ',rs.score2,' ',t2.name), rs.published_at
       FROM results rs JOIN matches m ON m.id=rs.match_id JOIN teams t1 ON t1.id=m.team1_id JOIN teams t2 ON t2.id=m.team2_id)
    UNION ALL (SELECT 'tournament', CONCAT('Tournament created: ',title), created_at FROM tournaments)
    ORDER BY happened_at DESC LIMIT 8`);
  res.json({ stats, activities });
}));

// ---- games ----
const CATEGORIES = ['battle-royale', 'moba', 'shooter', 'sports', 'strategy', 'racing', 'fighting', 'other'];
router.get('/games', wrap(async (req, res) => {
  const [rows] = await db.query(`SELECT g.*, (SELECT COUNT(*) FROM tournaments t WHERE t.game_id=g.id) AS tournaments FROM games g WHERE g.name LIKE ? ORDER BY g.name`, [like(req.query.search)]);
  res.json(rows);
}));
router.post('/games', wrap(async (req, res) => {
  const { name, category, description, image_url } = req.body;
  need(name && name.trim().length >= 2, 'Game name must be at least 2 characters.');
  need(CATEGORIES.includes(category), 'Choose a category.');
  await db.query('INSERT INTO games (name,category,description,image_url) VALUES (?,?,?,?)', [name.trim(), category, nn(description), img(image_url)]);
  notify.toPlayers({ type: 'game', title: 'New game added', message: `${name.trim()} is now available on the platform.`, link: '/player/games' });
  notify.toAdmins({ type: 'game', title: 'Game added', message: `You added the game ${name.trim()}.`, link: '/admin/games' });
  res.status(201).json({ message: 'Game added.' });
}));
router.put('/games/:id', wrap(async (req, res) => {
  const { name, category, description, image_url } = req.body;
  need(name && name.trim().length >= 2, 'Game name must be at least 2 characters.');
  need(CATEGORIES.includes(category), 'Choose a category.');
  const [r] = await db.query('UPDATE games SET name=?,category=?,description=?,image_url=? WHERE id=?', [name.trim(), category, nn(description), img(image_url), req.params.id]);
  gone(r, 'Game');
  notify.toPlayers({ type: 'game', title: 'Game updated', message: `Details of ${name.trim()} were updated.`, link: '/player/games' });
  notify.toAdmins({ type: 'game', title: 'Game updated', message: `You updated the game ${name.trim()}.`, link: '/admin/games' });
  res.json({ message: 'Game updated.' });
}));
router.delete('/games/:id', wrap(async (req, res) => {
  const [[c]] = await db.query('SELECT COUNT(*) AS n FROM tournaments WHERE game_id=?', [req.params.id]);
  need(c.n === 0, 'This game is used by tournaments. Delete those tournaments first.');
  const [[old]] = await db.query('SELECT name FROM games WHERE id=?', [req.params.id]);
  const [r] = await db.query('DELETE FROM games WHERE id=?', [req.params.id]);
  gone(r, 'Game');
  notify.toAdmins({ type: 'game', title: 'Game deleted', message: `You deleted the game ${old.name}.`, link: '/admin/games' });
  res.json({ message: 'Game deleted.' });
}));

// ---- players ----
router.get('/players', wrap(async (req, res) => {
  const s = like(req.query.search);
  const [rows] = await db.query(
    `SELECT p.id, u.name, u.email, u.status, p.dzongkhag, p.contact_no, p.avatar_url
     FROM players p JOIN users u ON u.id=p.user_id
     WHERE u.name LIKE ? OR u.email LIKE ? OR p.dzongkhag LIKE ? ORDER BY u.name`, [s, s, s]);
  res.json(rows);
}));
router.put('/players/:id', (req, res) => {
  res.status(403).json({ message: 'Administrators do not have rights to edit player accounts.' });
});
router.delete('/players/:id', wrap(async (req, res) => {
  const [[p]] = await db.query('SELECT p.user_id, u.name FROM players p JOIN users u ON u.id=p.user_id WHERE p.id=?', [req.params.id]);
  if (!p) throw new HttpError(404, 'Player not found.');
  await db.query('DELETE FROM users WHERE id=?', [p.user_id]); // players row is removed by cascade
  notify.toAdmins({ type: 'player', title: 'Player deleted', message: `You deleted the player ${p.name}.`, link: '/admin/players' });
  res.json({ message: 'Player deleted.' });
}));

// ---- teams ----
router.get('/teams', wrap(async (req, res) => {
  const [rows] = await db.query(Q.TEAMS + ' WHERE t.name LIKE ? OR t.region LIKE ? ORDER BY t.name', [like(req.query.search), like(req.query.search)]);
  res.json(rows);
}));
router.post('/teams', wrap(async (req, res) => {
  const { name, region, coach_name, logo_url } = req.body;
  need(name && name.trim().length >= 3, 'Team name must be at least 3 characters.');
  await db.query('INSERT INTO teams (name,region,coach_name,logo_url) VALUES (?,?,?,?)', [name.trim(), nn(region), nn(coach_name), img(logo_url)]);
  notify.toPlayers({ type: 'team', title: 'New team created', message: `Team ${name.trim()} is open for join requests.`, link: '/player/teams' });
  notify.toAdmins({ type: 'team', title: 'Team created', message: `You created the team ${name.trim()}.`, link: '/admin/teams' });
  res.status(201).json({ message: 'Team created.' });
}));
router.put('/teams/:id', wrap(async (req, res) => {
  const { name, region, coach_name, logo_url } = req.body;
  need(name && name.trim().length >= 3, 'Team name must be at least 3 characters.');
  const [r] = await db.query('UPDATE teams SET name=?,region=?,coach_name=?,logo_url=? WHERE id=?', [name.trim(), nn(region), nn(coach_name), img(logo_url), req.params.id]);
  gone(r, 'Team');
  notify.toTeams([req.params.id], { type: 'team', title: 'Team updated', message: `The administrator updated your team ${name.trim()}.`, link: '/player/team' });
  notify.toAdmins({ type: 'team', title: 'Team updated', message: `You updated the team ${name.trim()}.`, link: '/admin/teams' });
  res.json({ message: 'Team updated.' });
}));
router.delete('/teams/:id', wrap(async (req, res) => {
  const [[old]] = await db.query('SELECT name FROM teams WHERE id=?', [req.params.id]);
  if (old) await notify.toTeams([req.params.id], { type: 'team', title: 'Team deleted', message: `Your team ${old.name} was removed by the administrator.`, link: '/player/team' });
  const [r] = await db.query('DELETE FROM teams WHERE id=?', [req.params.id]);
  gone(r, 'Team');
  notify.toAdmins({ type: 'team', title: 'Team deleted', message: `You deleted the team ${old.name}.`, link: '/admin/teams' });
  res.json({ message: 'Team deleted (its matches were removed too).' });
}));

// ---- tournaments ----
function checkTournament(b) {
  need(b.title && b.title.trim(), 'Title is required.');
  need(b.game_id, 'Choose a game.');
  need(b.registration_deadline && b.start_date && b.end_date, 'Deadline, start date and end date are required.');
  need(b.start_date <= b.end_date, 'End date must not be before the start date.');
  need(b.registration_deadline <= b.start_date, 'Registration deadline must be on or before the start date.');
  need(['upcoming', 'ongoing', 'completed'].includes(b.status), 'Invalid status.');
  need(Number(b.prize_pool || 0) >= 0, 'Prize pool cannot be negative.');
}
const tValues = (b) => [b.title.trim(), b.game_id, nn(b.description), nn(b.location), b.prize_pool || 0,
  b.registration_deadline, b.start_date, b.end_date, b.status, img(b.banner_url)];
router.get('/tournaments', wrap(async (req, res) => {
  const [rows] = await db.query(Q.TOURNAMENTS + ' WHERE t.title LIKE ? ORDER BY t.start_date DESC', [like(req.query.search)]);
  res.json(rows);
}));
router.post('/tournaments', wrap(async (req, res) => {
  checkTournament(req.body);
  await db.query(`INSERT INTO tournaments (title,game_id,description,location,prize_pool,registration_deadline,start_date,end_date,status,banner_url) VALUES (?,?,?,?,?,?,?,?,?,?)`, tValues(req.body));
  const t = req.body.title.trim();
  notify.toPlayers({ type: 'tournament', title: 'New tournament', message: `${t} has been announced. Registration closes ${req.body.registration_deadline}.`, link: '/player/tournaments' });
  notify.toAdmins({ type: 'tournament', title: 'Tournament created', message: `You created the tournament ${t}.`, link: '/admin/tournaments' });
  res.status(201).json({ message: 'Tournament created.' });
}));
router.put('/tournaments/:id', wrap(async (req, res) => {
  checkTournament(req.body);
  const [[old]] = await db.query('SELECT status FROM tournaments WHERE id=?', [req.params.id]);
  const [r] = await db.query(`UPDATE tournaments SET title=?,game_id=?,description=?,location=?,prize_pool=?,registration_deadline=?,start_date=?,end_date=?,status=?,banner_url=? WHERE id=?`, [...tValues(req.body), req.params.id]);
  gone(r, 'Tournament');
  const t = req.body.title.trim();
  const changed = old && old.status !== req.body.status ? `${t} is now ${req.body.status}.` : `Details of ${t} were updated.`;
  notify.toPlayers({ type: 'tournament', title: 'Tournament updated', message: changed, link: `/player/tournaments/${req.params.id}` });
  notify.toAdmins({ type: 'tournament', title: 'Tournament updated', message: `You updated the tournament ${t}.`, link: '/admin/tournaments' });
  res.json({ message: 'Tournament updated.' });
}));
router.delete('/tournaments/:id', wrap(async (req, res) => {
  const [[old]] = await db.query('SELECT title FROM tournaments WHERE id=?', [req.params.id]);
  const [r] = await db.query('DELETE FROM tournaments WHERE id=?', [req.params.id]);
  gone(r, 'Tournament');
  notify.toPlayers({ type: 'tournament', title: 'Tournament removed', message: `${old.title} was removed by the administrator.`, link: '/player/tournaments' });
  notify.toAdmins({ type: 'tournament', title: 'Tournament deleted', message: `You deleted the tournament ${old.title}.`, link: '/admin/tournaments' });
  res.json({ message: 'Tournament deleted.' });
}));

// ---- registrations ----
router.get('/registrations', wrap(async (req, res) => {
  const s = like(req.query.search);
  const [rows] = await db.query(
    `SELECT r.id, r.status, r.registered_at, t.title AS tournament, u.name, u.email, tm.name AS team
     FROM registrations r JOIN tournaments t ON t.id=r.tournament_id JOIN players p ON p.id=r.player_id
     JOIN users u ON u.id=p.user_id LEFT JOIN teams tm ON tm.id=r.team_id
     WHERE t.title LIKE ? OR u.email LIKE ? OR u.name LIKE ?
     ORDER BY FIELD(r.status,'pending','approved','rejected'), r.registered_at DESC`, [s, s, s]);
  res.json(rows);
}));
router.put('/registrations/:id', wrap(async (req, res) => {
  need(['approved', 'rejected', 'pending'].includes(req.body.status), 'Invalid status.');
  const [[reg]] = await db.query('SELECT r.status, r.player_id, t.id AS tid, t.title, u.name FROM registrations r JOIN tournaments t ON t.id=r.tournament_id JOIN players p ON p.id=r.player_id JOIN users u ON u.id=p.user_id WHERE r.id=?', [req.params.id]);
  if (!reg) throw new HttpError(404, 'Registration not found.');
  const [r] = await db.query('UPDATE registrations SET status=? WHERE id=?', [req.body.status, req.params.id]);
  gone(r, 'Registration');
  if (reg.status !== req.body.status) {
    const word = { approved: 'approved', rejected: 'rejected', pending: 'set back to pending' }[req.body.status];
    notify.toPlayer(reg.player_id, { type: 'registration', title: `Registration ${req.body.status}`, message: `Your registration for ${reg.title} was ${word}.`, link: '/player/registrations' });
    notify.toAdmins({ type: 'registration', title: `Registration ${req.body.status}`, message: `You ${word} ${reg.name}'s registration for ${reg.title}.`, link: '/admin/registrations' });
  }
  res.json({ message: `Registration ${req.body.status}.` });
}));

// ---- matches and results ----
function checkMatch(b) {
  need(b.tournament_id && b.team1_id && b.team2_id, 'Choose a tournament and both teams.');
  need(String(b.team1_id) !== String(b.team2_id), 'A team cannot play against itself.');
  need(b.match_date, 'Match date and time are required.');
  // LIVE GAMES: the stream link is optional but must be a normal web address
  need(!b.stream_url || (String(b.stream_url).length <= 500 && /^https?:\/\/\S+$/i.test(String(b.stream_url).trim())), 'The stream link must start with http:// or https://');
}
router.get('/matches', wrap(async (req, res) => {
  const s = like(req.query.search);
  const [rows] = await db.query(Q.MATCHES + ' WHERE tr.title LIKE ? OR t1.name LIKE ? OR t2.name LIKE ? ORDER BY m.match_date DESC', [s, s, s]);
  res.json(rows);
}));
router.post('/matches', wrap(async (req, res) => {
  const b = req.body; checkMatch(b);
  await db.query('INSERT INTO matches (tournament_id,team1_id,team2_id,stage,match_date,stream_url) VALUES (?,?,?,?,?,?)',
    [b.tournament_id, b.team1_id, b.team2_id, b.stage || 'Group Stage', dt(b.match_date), b.stream_url ? String(b.stream_url).trim() : null]);
  const label = await matchLabel(b.team1_id, b.team2_id);
  notify.toTeams([b.team1_id, b.team2_id], { type: 'match', title: 'Match scheduled', message: `${label} on ${dt(b.match_date).slice(0, 16)}.`, link: '/player/matches' });
  notify.toAdmins({ type: 'match', title: 'Match scheduled', message: `You scheduled ${label}.`, link: '/admin/matches' });
  res.status(201).json({ message: 'Match scheduled.' });
}));
router.put('/matches/:id', wrap(async (req, res) => {
  const b = req.body; checkMatch(b);
  const [r] = await db.query('UPDATE matches SET tournament_id=?,team1_id=?,team2_id=?,stage=?,match_date=?,stream_url=? WHERE id=?',
    [b.tournament_id, b.team1_id, b.team2_id, b.stage || 'Group Stage', dt(b.match_date), b.stream_url ? String(b.stream_url).trim() : null, req.params.id]);
  gone(r, 'Match');
  const label = await matchLabel(b.team1_id, b.team2_id);
  notify.toTeams([b.team1_id, b.team2_id], { type: 'match', title: 'Match updated', message: `${label} now on ${dt(b.match_date).slice(0, 16)} (${b.stage || 'Group Stage'}).`, link: '/player/matches' });
  notify.toAdmins({ type: 'match', title: 'Match updated', message: `You updated ${label}.`, link: '/admin/matches' });
  res.json({ message: 'Match updated.' });
}));
router.delete('/matches/:id', wrap(async (req, res) => {
  const [[old]] = await db.query('SELECT team1_id, team2_id FROM matches WHERE id=?', [req.params.id]);
  const [r] = await db.query('DELETE FROM matches WHERE id=?', [req.params.id]);
  gone(r, 'Match');
  const label = await matchLabel(old.team1_id, old.team2_id);
  notify.toTeams([old.team1_id, old.team2_id], { type: 'match', title: 'Match cancelled', message: `${label} was cancelled.`, link: '/player/matches' });
  notify.toAdmins({ type: 'match', title: 'Match deleted', message: `You deleted ${label}.`, link: '/admin/matches' });
  res.json({ message: 'Match deleted.' });
}));
// LIVE GAMES: start / update / stop a live match. Body: { is_live: boolean, score1, score2 }
router.put('/matches/:id/live', wrap(async (req, res) => {
  const s1 = parseInt(req.body.score1, 10), s2 = parseInt(req.body.score2, 10);
  need(Number.isInteger(s1) && Number.isInteger(s2) && s1 >= 0 && s2 >= 0, 'Enter valid live scores (0 or more).');
  const [[m]] = await db.query('SELECT m.team1_id, m.team2_id, m.is_live, r.match_id AS done FROM matches m LEFT JOIN results r ON r.match_id=m.id WHERE m.id=?', [req.params.id]);
  if (!m) throw new HttpError(404, 'Match not found.');
  need(!m.done, 'This match already has a published result. Edit the result instead.');
  const live = req.body.is_live ? 1 : 0;
  await db.query('UPDATE matches SET is_live=?, live_score1=?, live_score2=? WHERE id=?', [live, s1, s2, req.params.id]);
  if (live && !m.is_live) { // only announce the moment a match goes live, not every score change
    const label = await matchLabel(m.team1_id, m.team2_id);
    notify.toTeams([m.team1_id, m.team2_id], { type: 'match', title: 'Your match is LIVE', message: `${label} is being played now.`, link: `/live/${req.params.id}` });
  }
  res.json({ message: live ? 'Live score updated.' : 'Match taken off the live list.' });
}));

router.put('/matches/:id/result', wrap(async (req, res) => {
  const s1 = parseInt(req.body.score1, 10), s2 = parseInt(req.body.score2, 10);
  need(Number.isInteger(s1) && Number.isInteger(s2) && s1 >= 0 && s2 >= 0, 'Enter valid scores (0 or more).');
  need(s1 !== s2, 'Scores cannot be tied. A winner must be declared.');
  const [[m]] = await db.query('SELECT team1_id, team2_id FROM matches WHERE id=?', [req.params.id]);
  if (!m) throw new HttpError(404, 'Match not found.');
  const winner = s1 > s2 ? m.team1_id : m.team2_id;
  await db.query(`INSERT INTO results (match_id,score1,score2,winner_id) VALUES (?,?,?,?)
    ON DUPLICATE KEY UPDATE score1=VALUES(score1), score2=VALUES(score2), winner_id=VALUES(winner_id), published_at=CURRENT_TIMESTAMP`,
    [req.params.id, s1, s2, winner]);
  await db.query('UPDATE matches SET is_live=0 WHERE id=?', [req.params.id]); // LIVE GAMES: publishing the result ends the live state
  const [[names]] = await db.query('SELECT t1.name AS a, t2.name AS b FROM teams t1, teams t2 WHERE t1.id=? AND t2.id=?', [m.team1_id, m.team2_id]);
  const text = `${names.a} ${s1} - ${s2} ${names.b}. Winner: ${s1 > s2 ? names.a : names.b}.`;
  notify.toTeams([m.team1_id, m.team2_id], { type: 'result', title: 'Match result published', message: text, link: '/player/matches' });
  notify.toAdmins({ type: 'result', title: 'Result published', message: text, link: '/admin/matches' });
  res.json({ message: 'Result published.' });
}));

module.exports = router;
