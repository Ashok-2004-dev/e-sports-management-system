import { Link, useParams } from 'react-router-dom';
import { ExternalLink, Link2, Radio, Tv, Trophy } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { useLive } from '../context/LiveContext';
import { useToast } from '../context/ToastContext';
import { Empty, ErrorBox, LiveBadge, Loading, PageHeader, Thumb } from '../components/ui';
import { LiveMatchCard, LiveScore, MatchRow } from '../components/Cards';
import { gameArt, coverFor } from '../services/categories.jsx';
import { streamInfo } from '../services/stream';
import { fmtDateTime, liveFor, scoreOf } from '../services/format';

/* NEW PAGE: Live Games  (routes /live and /live/:id, see App.jsx)
   - top:    the stream player + scoreboard for the selected match
   - below:  a card for every match that is live right now; clicking a card swaps the player (no full page reload)
   The list refreshes every 15 s through LiveContext, so scores update without the viewer doing anything. */

// ---- the 16:9 player area -------------------------------------------------
function StreamStage({ m }) {
  const s = streamInfo(m.stream_url);
  const ended = m.status === 'completed' || !m.is_live;
  const art = gameArt(m.game) || coverFor('other');
  return (
    <div className={`card overflow-hidden ${ended ? '' : 'card-live'}`}>
      <div className="relative aspect-video bg-black">
        {s?.src && !ended ? (
          // key={s.src} reloads the player when the viewer switches match
          <iframe key={s.src} src={s.src} title={`${m.team1} vs ${m.team2} live stream`} className="absolute inset-0 h-full w-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        ) : (
          // no embeddable stream: show the game artwork with the score on top instead of an empty black box
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
            <img src={art} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/40" />
            <div className="relative flex flex-col items-center gap-3">
              {ended ? <span className="badge bg-slate-500/20 text-slate-300">Match ended</span> : <LiveBadge />}
              <LiveScore m={m} size="text-6xl md:text-7xl" />
              <p className="max-w-sm text-sm text-slate-300">
                {ended ? 'This match has finished. Final score shown above.'
                  : s?.kind === 'external' ? `This stream plays on ${s.host}.`
                  : 'No stream is linked to this match. The score updates here automatically.'}
              </p>
              {s?.kind === 'external' && !ended && (
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="btn-primary"><Tv size={16} /> Watch on {s.host}</a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- scoreboard beside / below the player ----------------------------------
function TeamLine({ name, logo, score, win }) {
  return (
    <div className={`flex items-center gap-3 rounded-lg border px-3 py-3 ${win ? 'border-cyan-400/40 bg-cyan-400/5' : 'border-ink-600 bg-ink-900/60'}`}>
      <Thumb src={logo} name={name} size={44} />
      <span className="min-w-0 flex-1 truncate font-display text-xl font-bold text-white">{name}</span>
      <span key={score} className="animate-pop font-display text-4xl font-bold tabular-nums text-white">{score}</span>
    </div>
  );
}

function Scoreboard({ m }) {
  const toast = useToast();
  const s = streamInfo(m.stream_url);
  const ended = m.status === 'completed' || !m.is_live;
  const [a, b] = scoreOf(m);
  const since = !ended && liveFor(m.match_date);
  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); toast.success('Link copied.'); }
    catch { toast.error('Could not copy the link. Copy it from the address bar.'); }
  };
  return (
    <div className="card flex h-full flex-col gap-4 p-5">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">{ended ? <span className="badge bg-slate-500/20 text-slate-300">Final</span> : <LiveBadge />}{since && <span className="text-xs text-slate-400">{since}</span>}</div>
        <Link to={`/tournaments/${m.tournament_id}`} className="flex items-center gap-2 font-game text-lg font-bold leading-tight text-white transition hover:text-cyan-300"><Trophy size={16} className="shrink-0 text-amber-300" /> {m.tournament}</Link>
        <p className="mt-1 text-sm text-slate-400">{m.game}, {m.stage}</p>
        <p className="text-xs text-slate-500">Started {fmtDateTime(m.match_date)}</p>
      </div>
      <div className="space-y-2">
        <TeamLine name={m.team1} logo={m.team1_logo} score={a} win={ended && m.winner_id === m.team1_id} />
        <TeamLine name={m.team2} logo={m.team2_logo} score={b} win={ended && m.winner_id === m.team2_id} />
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        {s?.href && <a href={s.href} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1"><ExternalLink size={15} /> Open on {s.host}</a>}
        <button type="button" onClick={share} className="btn-ghost flex-1"><Link2 size={15} /> Copy link</button>
      </div>
    </div>
  );
}

// ---- the page ---------------------------------------------------------------
export default function LiveGames() {
  const { id } = useParams(); // present on /live/:id
  const { matches, loading, error } = useLive();

  const inLive = id ? matches.find((m) => String(m.id) === id) : null;
  // a /live/:id link to a match that is no longer live (or never was): load it on its own so the link still works
  const needSingle = Boolean(id) && !loading && !inLive;
  const single = useFetch(needSingle ? `/matches/${id}` : null);
  const selected = id ? inLive || (needSingle && single.data && String(single.data.id) === id ? single.data : null) : matches[0] || null;
  // when nothing is live, show what is coming up instead of a dead end
  const upcoming = useFetch(!loading && !matches.length && !id ? '/matches?status=scheduled&limit=4' : null);

  const header = (
    <PageHeader title="Live games" subtitle="Watch streams and follow scores for the matches being played right now.">
      <span className="inline-flex items-center gap-2 text-sm text-slate-300"><Radio size={16} className="text-live-soft" /> {matches.length} {matches.length === 1 ? 'match' : 'matches'} live</span>
    </PageHeader>
  );

  if (loading && !matches.length) return <div>{header}<Loading /></div>;
  if (error && !matches.length) return <div>{header}<ErrorBox text={error} /></div>;

  // /live/:id for a match that cannot be loaded
  if (id && !selected) {
    if (needSingle && single.loading) return <div>{header}<Loading /></div>;
    return <div>{header}<Empty title="Match not found" text="This match does not exist or was removed." action={<Link to="/live" className="btn-primary mt-2">See live games</Link>} /></div>;
  }

  // nothing live
  if (!selected) {
    return (
      <div>
        {header}
        <Empty title="No matches are live right now" text="Matches show up here the moment an administrator starts them. Here is what is coming up."
          action={<Link to="/matches" className="btn-primary mt-2">See all matches</Link>} />
        {upcoming.data?.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 font-game text-xl font-bold uppercase">Coming up</h2>
            <div className="grid gap-4 md:grid-cols-2">{upcoming.data.map((m, i) => <MatchRow key={m.id} m={m} index={i} />)}</div>
          </div>
        )}
      </div>
    );
  }

  const others = matches; // every live match, including the selected one (it gets the outline)
  return (
    <div>
      {header}
      {/* player (left) + scoreboard (right); stacks on phones, player first */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <StreamStage m={selected} />
        <Scoreboard m={selected} />
      </div>

      {others.length > 0 && (
        <section className="mt-10" aria-label="All live matches">
          <h2 className="mb-4 flex items-center gap-3 font-game text-xl font-bold uppercase">Live now <span className="hud-line w-20" /></h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* replace: switching between live matches should not fill the history, so "Back" still leaves this page in one step */}
            {others.map((m, i) => <LiveMatchCard key={m.id} m={m} index={i} selected={String(m.id) === String(selected.id)} replace={Boolean(id)} />)}
          </div>
        </section>
      )}
    </div>
  );
}
