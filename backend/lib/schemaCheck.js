// Makes sure the connected database really has THIS project's tables and columns.
const REQUIRED = [['users', 'username'], ['players', 'avatar_url'], ['games', 'category'], ['games', 'image_url'], ['teams', 'logo_url'],
  ['tournaments', 'banner_url'], ['matches', 'team1_id'], ['matches', 'team2_id'], ['matches', 'is_live'], ['results', 'winner_id'], ['team_members', 'status'], ['games', 'team_size'], ['teams', 'game_id'], ['registrations', 'tournament_id']];

async function missingColumns(db) {
  const [rows] = await db.query('SELECT TABLE_NAME AS t, COLUMN_NAME AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE()');
  const have = new Set(rows.map((r) => `${r.t}.${r.c}`.toLowerCase()));
  return REQUIRED.map(([t, c]) => `${t}.${c}`).filter((x) => !have.has(x));
}
module.exports = { missingColumns };
