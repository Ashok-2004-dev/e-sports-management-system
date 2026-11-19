require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');

if (!process.env.JWT_SECRET) { console.error('JWT_SECRET is missing. Copy .env.example to .env first.'); process.exit(1); }

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // uploaded images

app.get('/api/health', async (req, res) => {
  try { await db.query('SELECT 1'); res.json({ status: 'ok', database: 'connected' }); }
  catch (e) { res.status(500).json({ status: 'error', database: e.message }); }
});
app.use('/api/auth', require('./routes/auth'));
app.use('/api/player', require('./routes/player'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api', require('./routes/public'));

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use((err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ message: err.message });
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That value already exists (duplicate email, team name or registration).' });
  if (err.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ message: 'A selected item does not exist.' });
  console.error(err);
  res.status(500).json({ message: 'Server error. Please try again.' });
});

// ---- Auto-end TikTok Live matches when the TikTok stream ends ----
async function isTikTokLiveEnded(url) {
  try {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
    let targetUrl = url.trim();
    let u = new URL(targetUrl);

    // 1. If it's a mobile short link (vt.tiktok.com / vm.tiktok.com), follow the redirect first
    if (u.hostname.startsWith('vt.') || u.hostname.startsWith('vm.')) {
      const redirectRes = await fetch(targetUrl, {
        headers: { 'User-Agent': ua, 'Accept-Language': 'en-US,en;q=0.9' },
        redirect: 'follow',
        signal: AbortSignal.timeout(10000),
      });
      targetUrl = redirectRes.url;
      u = new URL(targetUrl);
      console.log(`[TikTok Watcher] Resolved short link -> ${targetUrl}`);
    }

    const userMatch = u.pathname.match(/^\/@([^/]+)/);
    if (!userMatch) {
      console.log(`[TikTok Watcher] Could not extract @username from: ${targetUrl}`);
      return false;
    }
    const uniqueId = userMatch[1];

    // 2. Grab a session cookie and HTML from TikTok's live page
    const pageRes = await fetch(`https://www.tiktok.com/@${uniqueId}/live`, {
      headers: { 'User-Agent': ua, 'Accept-Language': 'en-US,en;q=0.9' },
      signal: AbortSignal.timeout(10000),
    });
    const setCookie = pageRes.headers.get('set-cookie') || '';
    const html = await pageRes.text();

    const roomMatch = html.match(/"roomId"\s*:\s*"(\d+)"/);
    const statusMatch = html.match(/"liveRoom"[\s\S]*?"status"\s*:\s*(\d+)/);

    if (statusMatch) {
      const st = Number(statusMatch[1]);
      console.log(`[TikTok Watcher HTML] @${uniqueId} -> roomId=${roomMatch?.[1] || 'none'}, status=${st}`);
      if (st === 4) return true;
      if (st === 2) return false;
    }

    // 3. Query TikTok's live room API using the cookie we just received
    const apiUrl = `https://www.tiktok.com/api-live/user/room/?aid=1988&sourceType=54&uniqueId=${encodeURIComponent(uniqueId)}`;
    const apiRes = await fetch(apiUrl, {
      headers: {
        'User-Agent': ua,
        'Referer': `https://www.tiktok.com/@${uniqueId}/live`,
        'Accept': 'application/json',
        ...(setCookie ? { 'Cookie': setCookie } : {}),
      },
      signal: AbortSignal.timeout(10000),
    });

    if (apiRes.ok) {
      const json = await apiRes.json();
      const roomId = json?.data?.user?.roomId;
      const status = json?.data?.liveRoom?.status;
      console.log(`[TikTok Watcher API] @${uniqueId} -> roomId=${roomId || 'none'}, status=${status ?? 'none'}`);

      if (json?.statusCode === 0 && (!roomId || roomId === '0' || Number(status) === 4)) {
        return true;
      }
    }

    return false;
  } catch (err) {
    console.log(`[TikTok Watcher] Error checking ${url}:`, err.message);
    return false;
  }
}

function startTikTokLiveWatcher() {
  const runCheck = async () => {
    try {
      const [liveMatches] = await db.query(
        "SELECT id, team1_id, team2_id, live_score1, live_score2, stream_url FROM matches WHERE is_live = 1 AND stream_url LIKE '%tiktok.com%'"
      );
      if (!liveMatches.length) return;

      for (const m of liveMatches) {
        const ended = await isTikTokLiveEnded(m.stream_url);
        if (ended) {
          const s1 = Number(m.live_score1 || 0);
          const s2 = Number(m.live_score2 || 0);
          const winner = s1 > s2 ? m.team1_id : s2 > s1 ? m.team2_id : null;

          await db.query('UPDATE matches SET is_live = 0 WHERE id = ?', [m.id]);

          if (winner) {
            await db.query(
              `INSERT INTO results (match_id, score1, score2, winner_id) VALUES (?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE score1=VALUES(score1), score2=VALUES(score2), winner_id=VALUES(winner_id), published_at=CURRENT_TIMESTAMP`,
              [m.id, s1, s2, winner]
            );
          }
          console.log(`[TikTok Watcher] Match #${m.id} automatically ended (Score: ${s1}-${s2}).`);
        }
      }
    } catch (err) {
      console.error('[TikTok Watcher] Check failed:', err.message);
    }
  };

  runCheck();
  setInterval(runCheck, 15000);
}

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}  (database: ${process.env.DB_NAME || 'esms_final'})`);
  require('./lib/migrate')(db).catch((e) => console.error('Database upgrade failed:', e.message)).then(() => require('./lib/schemaCheck').missingColumns(db)).then((m) => {
    if (m.length) console.error(`\n!! WRONG DATABASE: missing ${m.slice(0, 4).join(', ')}... Set DB_NAME in backend/.env to a new name and run "npm run setup".\n`);
  }).catch((e) => console.error('Database check failed:', e.message));

  startTikTokLiveWatcher();
});