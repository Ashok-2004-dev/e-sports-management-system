import { Link } from 'react-router-dom';
import { Calendar, MapPin, Coins, Play } from 'lucide-react';
import { StatusBadge, LiveBadge, Thumb, Reveal } from './ui';
import { tournamentImg, categoryLabel } from '../services/categories.jsx';
import { fmtDate, fmtDateTime, fmtNu, scoreOf } from '../services/format';

// ANIMATION: every card below is wrapped in <Reveal> (entrance) and uses .card-hover (glow + lift on hover).
// Pass `index` from the list's .map((x, i) => ...) so cards cascade in one after another.

export function TournamentCard({ t, base = '', index = 0, registration }) {
  return (
    <Reveal index={index} className="h-full">
      <Link to={`${base}/tournaments/${t.id}`} className="card card-hover group block h-full overflow-hidden">
        <div className="relative h-40 overflow-hidden">
          <img src={tournamentImg(t)} alt={t.game} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-800 via-transparent to-transparent" />
          <div className="absolute right-3 top-3"><StatusBadge status={t.status} /></div>
        </div>
        <div className="space-y-2 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">{t.game} - {categoryLabel(t.category)}</p>
          <h3 className="text-xl font-bold leading-tight transition group-hover:text-cyan-300">{t.title}</h3>
          {registration && <p className="flex items-center gap-2 text-xs text-slate-400">Your registration <StatusBadge status={registration} /></p>}
          <div className="space-y-1 pt-1 text-sm text-slate-400">
            <p className="flex items-center gap-2"><Calendar size={14} /> {fmtDate(t.start_date)} - {fmtDate(t.end_date)}</p>
            <p className="flex items-center gap-2"><MapPin size={14} /> {t.location || 'To be announced'}</p>
            <p className="flex items-center gap-2 text-amber-300"><Coins size={14} /> {fmtNu(t.prize_pool)}</p>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

// Standard match card for schedules and results. Live matches get a crimson outline, the pulsing badge,
// their running score and a "Watch live" link (LIVE GAMES).
export function MatchRow({ m, index = 0 }) {
  const done = m.status === 'completed';
  const live = m.status === 'live';
  const [a, b] = scoreOf(m);
  const cls = (id) => (done && m.winner_id === id ? 'font-bold text-fg' : 'text-slate-300');
  return (
    <Reveal index={index} className="h-full">
      <div className={`card card-hover h-full p-4 ${live ? 'card-live' : ''}`}>
        <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-400">
          <span className="truncate">{m.tournament} - {m.stage}</span>
          <StatusBadge status={m.status} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className={`flex flex-1 items-center justify-end gap-2 truncate text-right ${cls(m.team1_id)}`}><span className="truncate">{m.team1}</span><Thumb src={m.team1_logo} name={m.team1} size={26} /></span>
          <span className={`min-w-[4.5rem] rounded-md px-3 py-1 text-center font-display text-lg font-bold tabular-nums text-fg ${live ? 'border border-live/40 bg-live/10' : 'bg-ink-900'}`}>
            {done || live ? `${a} - ${b}` : 'VS'}
          </span>
          <span className={`flex flex-1 items-center gap-2 truncate ${cls(m.team2_id)}`}><Thumb src={m.team2_logo} name={m.team2} size={26} /><span className="truncate">{m.team2}</span></span>
        </div>
        {live
          ? <Link to={`/live/${m.id}`} className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-live-soft hover:text-fg"><Play size={13} /> Watch live</Link>
          : <p className="mt-2 text-center text-xs text-slate-500">{fmtDateTime(m.match_date)}</p>}
      </div>
    </Reveal>
  );
}

// team logo above its name (used by LiveMatchCard)
const TeamSide = ({ name, logo }) => (
  <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
    <Thumb src={logo} name={name} size={52} />
    <span className="line-clamp-2 w-full break-words text-sm font-semibold leading-tight text-fg">{name}</span>
  </div>
);

// NEW: big score. `key` changes when the score changes, which replays the "pop" animation so viewers notice the update.
export const LiveScore = ({ m, size = 'text-4xl' }) => {
  const [a, b] = scoreOf(m);
  return (
    <span key={`${a}-${b}`} className={`animate-pop font-display ${size} font-bold tabular-nums text-fg`} style={{ textShadow: '0 0 18px rgba(255,46,77,.55)' }} aria-label={`Score ${a} to ${b}`}>
      {a}<span className="mx-1.5 text-slate-500">:</span>{b}
    </span>
  );
};

// NEW: card for one live match: LIVE badge, tournament, both team logos, running score.
// Links to the watch page /live/:id. `selected` outlines the card that is currently in the player.
export function LiveMatchCard({ m, index = 0, selected = false, replace = false }) {
  return (
    <Reveal index={index} className="h-full">
      <Link to={`/live/${m.id}`} replace={replace} aria-current={selected ? 'true' : undefined} className={`card card-live card-hover group flex h-full flex-col p-4 ${selected ? 'card-selected' : ''}`}>
        <div className="mb-3 flex items-center justify-between gap-2 text-xs text-slate-400">
          <LiveBadge />
          <span className="truncate text-right">{m.tournament}</span>
        </div>
        <div className="flex items-center justify-between gap-2 py-1">
          <TeamSide name={m.team1} logo={m.team1_logo} />
          <LiveScore m={m} />
          <TeamSide name={m.team2} logo={m.team2_logo} />
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-ink-600 pt-3 text-xs">
          <span className="truncate text-slate-400">{m.game}, {m.stage}</span>
          <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-fg transition group-hover:text-live-soft"><Play size={13} /> {m.stream_url ? 'Watch stream' : 'Follow score'}</span>
        </div>
      </Link>
    </Reveal>
  );
}

// NEW: compact one-line live match (hero panel on the home page)
export function LiveMiniRow({ m }) {
  return (
    <Link to={`/live/${m.id}`} className="group block rounded-lg border border-ink-600 bg-ink-900/70 p-3 transition duration-200 hover:border-live/70 hover:bg-live/10 hover:shadow-[0_0_20px_-4px_rgba(255,46,77,.5)]">
      <p className="mb-2 truncate text-xs text-slate-400">{m.tournament}</p>
      <div className="flex items-center gap-2">
        <span className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right"><span className="truncate text-sm font-semibold text-fg">{m.team1}</span><Thumb src={m.team1_logo} name={m.team1} size={26} /></span>
        <LiveScore m={m} size="text-2xl" />
        <span className="flex min-w-0 flex-1 items-center gap-2"><Thumb src={m.team2_logo} name={m.team2} size={26} /><span className="truncate text-sm font-semibold text-fg">{m.team2}</span></span>
      </div>
    </Link>
  );
}
