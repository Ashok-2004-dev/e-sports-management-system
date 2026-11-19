const parse = (s) => new Date(String(s).replace(' ', 'T'));
export const fmtDate = (s) => (s ? parse(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-');
export const fmtDateTime = (s) => (s ? `${fmtDate(s)}, ${parse(s).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : '-');
export const fmtNu = (n) => `Nu. ${Number(n || 0).toLocaleString('en-IN')}`;

// LIVE GAMES helpers
// [score1, score2] to show for a match: the final score once completed, otherwise the running live score
export const scoreOf = (m) => (m.status === 'completed' ? [m.score1, m.score2] : [m.live_score1 ?? 0, m.live_score2 ?? 0]);
// "Just started", "25 min", "1 h 10 min" since kick-off. Returns '' if the start time looks wrong (e.g. in the future).
export const liveFor = (s) => {
  const mins = Math.floor((Date.now() - parse(s).getTime()) / 60000);
  if (!Number.isFinite(mins) || mins < 0 || mins > 1440) return '';
  if (mins < 1) return 'Just started';
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h ${mins % 60} min`;
};
