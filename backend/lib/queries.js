// SQL used by both the public and the admin routes
const TOURNAMENTS = `
SELECT t.*, g.name AS game, g.category, g.image_url AS game_image,
  (SELECT COUNT(*) FROM registrations r WHERE r.tournament_id=t.id AND r.status<>'rejected') AS registrations
FROM tournaments t JOIN games g ON g.id=t.game_id`;

const TEAMS = `
SELECT t.*, cu.name AS captain,
  (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id=t.id AND tm.status='approved') AS members
FROM teams t LEFT JOIN players cp ON cp.id=t.captain_id LEFT JOIN users cu ON cu.id=cp.user_id`;

// LIVE GAMES: a match is 'completed' once it has a result, 'live' while is_live=1, otherwise 'scheduled'.
// The extra columns (is_live, live_score1/2, stream_url) feed the Live Games pages.
const MATCHES = `
SELECT m.id, m.tournament_id, tr.title AS tournament, g.name AS game,
  m.team1_id, t1.name AS team1, t1.logo_url AS team1_logo, m.team2_id, t2.name AS team2, t2.logo_url AS team2_logo, m.stage, m.match_date,
  m.is_live, m.live_score1, m.live_score2, m.stream_url,
  r.score1, r.score2, r.winner_id, w.name AS winner,
  IF(r.match_id IS NOT NULL,'completed',IF(m.is_live=1,'live','scheduled')) AS status
FROM matches m
JOIN tournaments tr ON tr.id=m.tournament_id
JOIN games g ON g.id=tr.game_id
JOIN teams t1 ON t1.id=m.team1_id
JOIN teams t2 ON t2.id=m.team2_id
LEFT JOIN results r ON r.match_id=m.id
LEFT JOIN teams w ON w.id=r.winner_id`;

// builds a match query from simple filters
function matchQuery({ status, tournament_id, team_id, limit } = {}) {
  const where = []; const params = [];
  if (status === 'scheduled') where.push('r.match_id IS NULL AND m.is_live=0');
  if (status === 'live') where.push('r.match_id IS NULL AND m.is_live=1');   // LIVE GAMES
  if (status === 'completed') where.push('r.match_id IS NOT NULL');
  if (tournament_id) { where.push('m.tournament_id=?'); params.push(tournament_id); }
  if (team_id) { where.push('(m.team1_id=? OR m.team2_id=?)'); params.push(team_id, team_id); }
  const dir = status === 'scheduled' || status === 'live' ? 'ASC' : 'DESC';
  let sql = MATCHES + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ` ORDER BY m.match_date ${dir}`;
  if (limit) { sql += ' LIMIT ?'; params.push(parseInt(limit, 10) || 10); }
  return { sql, params };
}

const TEAM_BOARD = `
SELECT t.id, t.name, t.region, t.logo_url,
  COUNT(r.match_id) AS played,
  COALESCE(SUM(CASE WHEN r.winner_id=t.id THEN 1 ELSE 0 END),0) AS wins
FROM teams t
LEFT JOIN matches m ON (m.team1_id=t.id OR m.team2_id=t.id)
LEFT JOIN results r ON r.match_id=m.id
GROUP BY t.id, t.name, t.region, t.logo_url
ORDER BY wins DESC, played ASC, t.name ASC`;

const PLAYER_BOARD = `
SELECT p.id, u.name, p.dzongkhag, p.avatar_url, t.name AS team,
  COUNT(r.match_id) AS played,
  COALESCE(SUM(CASE WHEN r.winner_id=t.id THEN 1 ELSE 0 END),0) AS wins
FROM players p
JOIN users u ON u.id=p.user_id
JOIN team_members tm ON tm.player_id=p.id AND tm.status='approved'
JOIN teams t ON t.id=tm.team_id
LEFT JOIN matches m ON (m.team1_id=t.id OR m.team2_id=t.id)
LEFT JOIN results r ON r.match_id=m.id
GROUP BY p.id, u.name, p.dzongkhag, p.avatar_url, t.name
ORDER BY wins DESC, played ASC, u.name ASC
LIMIT 20`;

const STATS = `
SELECT
 (SELECT COUNT(*) FROM players) AS players,
 (SELECT COUNT(*) FROM teams) AS teams,
 (SELECT COUNT(*) FROM tournaments) AS tournaments,
 (SELECT COUNT(*) FROM tournaments WHERE status='upcoming') AS upcoming,
 (SELECT COUNT(*) FROM tournaments WHERE status='ongoing') AS ongoing,
 (SELECT COUNT(*) FROM tournaments WHERE status='completed') AS completed,
 (SELECT COUNT(*) FROM matches) AS matches,
 (SELECT COUNT(*) FROM matches m LEFT JOIN results r ON r.match_id=m.id WHERE m.is_live=1 AND r.match_id IS NULL) AS live`;

module.exports = { TOURNAMENTS, TEAMS, MATCHES, matchQuery, TEAM_BOARD, PLAYER_BOARD, STATS };
