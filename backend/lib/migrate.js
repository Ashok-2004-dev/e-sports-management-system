// Upgrades an existing database (created by an earlier version) when the server starts. Safe to run every time.
const NOTIFICATIONS = `CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(30) NOT NULL DEFAULT 'info',
  title VARCHAR(150) NOT NULL,
  message VARCHAR(500) NOT NULL,
  link VARCHAR(200) NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_feed (user_id, created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)`;

const REGISTRATION_OTPS = `CREATE TABLE IF NOT EXISTS registration_otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  dzongkhag VARCHAR(50) NULL,
  contact_no VARCHAR(20) NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  resend_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_registration_otp_email (email),
  INDEX idx_registration_otp_expiry (expires_at)
)`;

const PASSWORD_RESETS = `CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reset_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)`;
// LIVE GAMES: columns added to `matches` (see database/schema.sql)
const LIVE_COLUMNS = [['is_live', 'TINYINT(1) NOT NULL DEFAULT 0'], ['live_score1', 'INT NOT NULL DEFAULT 0'], ['live_score2', 'INT NOT NULL DEFAULT 0'], ['stream_url', 'VARCHAR(500) NULL']];
const IMAGE_COLUMNS = [['players', 'avatar_url'], ['games', 'image_url'], ['teams', 'logo_url'], ['tournaments', 'banner_url']];

module.exports = async function migrate(db) {
  await db.query(NOTIFICATIONS);
  const [uc] = await db.query("SELECT COLUMN_NAME AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users'");
  if (uc.length) {
    await db.query('ALTER TABLE users MODIFY password_hash VARCHAR(255) NULL');
    const userSocialCols = [['auth_provider', "VARCHAR(20) NOT NULL DEFAULT 'local'"], ['provider_id', 'VARCHAR(120) NULL'], ['avatar_url', 'VARCHAR(500) NULL']];
    for (const [c, def] of userSocialCols) {
      if (!uc.some((x) => x.c === c)) {
        await db.query(`ALTER TABLE users ADD COLUMN \`${c}\` ${def}`);
        console.log(`Database upgraded: users.${c} added.`);
      }
    }
  }

  await db.query(PASSWORD_RESETS);
  await db.query(REGISTRATION_OTPS);
  const [otpCols] = await db.query("SELECT COLUMN_NAME AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='registration_otps'");
  if (otpCols.length && !otpCols.some((x) => x.c === 'resend_count')) await db.query('ALTER TABLE registration_otps ADD COLUMN resend_count INT NOT NULL DEFAULT 0');
  // LIVE GAMES: add the live-match columns to an older database
  const [mc] = await db.query("SELECT COLUMN_NAME AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='matches'");
  for (const [c, def] of LIVE_COLUMNS) {
    if (mc.length && !mc.some((x) => x.c === c)) { await db.query(`ALTER TABLE matches ADD COLUMN \`${c}\` ${def}`); console.log(`Database upgraded: matches.${c} added.`); }
  }
  const [g] = await db.query("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='players' AND COLUMN_NAME='gamertag'");
  if (g.length) { await db.query('ALTER TABLE players DROP COLUMN gamertag'); console.log('Database upgraded: the gamertag column was removed.'); }
  const [cols] = await db.query("SELECT TABLE_NAME AS t, COLUMN_NAME AS c, CHARACTER_MAXIMUM_LENGTH AS n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('players','games','teams','tournaments')");
  for (const [t, c] of IMAGE_COLUMNS) {
    const col = cols.find((x) => x.t === t && x.c === c);
    if (col && col.n < 500) await db.query(`ALTER TABLE \`${t}\` MODIFY \`${c}\` VARCHAR(500) NULL`);
  }
};
