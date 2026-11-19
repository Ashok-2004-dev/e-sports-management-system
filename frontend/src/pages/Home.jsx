import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Users, UserPlus, Medal, Swords, ClipboardCheck, Radio, Flame, Crosshair } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { Async, LiveBadge, Thumb } from '../components/ui';
import { TournamentCard, MatchRow, LiveMatchCard, LiveMiniRow } from '../components/Cards';
import LiveButton from '../components/LiveButton';
import { useLive } from '../context/LiveContext';
import { fmtDateTime } from '../services/format';
import { CATEGORIES, coverFor, gameImg, categoryLabel } from '../services/categories.jsx';
import { useAuth } from '../context/AuthContext';

const Section = ({ title, subtitle, to, children }) => (
  <section className="mx-auto max-w-7xl px-4 py-12">
    <div className="mb-7 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-game text-2xl font-bold uppercase tracking-wide md:text-3xl">{title}</h2>
        <div className="hud-line mt-2 w-28" />
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {to && <Link to={to} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-400 hover:text-white">View all <ArrowRight size={14} /></Link>}
    </div>
    {children}
  </section>
);

function HeroLivePanel({ next }) {
  const { matches } = useLive();
  const list = matches.slice(0, 3);
  return (
    <aside className="card esports-frame animate-panelIn border-cyan-400/50 p-5" aria-label="Live matches">
      <div className="mb-4 flex items-center justify-between gap-3">
        {list.length ? <LiveBadge label="LIVE BROADCAST" /> : <span className="inline-flex items-center gap-2 font-game text-xs font-bold tracking-widest text-slate-400"><Radio size={14} className="text-cyan-300" /> ARENA FEED READY</span>}
        <Link to="/live" className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white">Live Centre <ArrowRight size={13} /></Link>
      </div>
      {list.length ? (
        <div className="space-y-3">{list.map((m) => <LiveMiniRow key={m.id} m={m} />)}</div>
      ) : next ? (
        <div className="rounded-lg border border-ink-600 bg-ink-900/80 p-4">
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="font-game uppercase tracking-wider text-slate-400">Next Featured Match</span>
            <span className="font-semibold text-cyan-300">{next.tournament}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
              <span className="truncate text-sm font-semibold text-white">{next.team1}</span>
              <Thumb src={next.team1_logo} name={next.team1} size={30} />
            </span>
            <span className="rounded bg-ink-800 px-2.5 py-1 font-display text-base font-bold text-cyan-300">VS</span>
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <Thumb src={next.team2_logo} name={next.team2} size={30} />
              <span className="truncate text-sm font-semibold text-white">{next.team2}</span>
            </span>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">{fmtDateTime(next.match_date)}</p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-ink-600 bg-ink-900/50 p-5 text-center">
          <Crosshair className="mx-auto mb-2 text-cyan-300" size={24} />
          <p className="text-sm font-medium text-slate-300">Standby for live broadcasts</p>
          <p className="mt-1 text-xs text-slate-500">Live scores and TikTok/YouTube streams appear here automatically.</p>
        </div>
      )}
    </aside>
  );
}

export default function Home() {
  const { user } = useAuth();

  const stats = useFetch('/stats');
  const tournaments = useFetch('/tournaments?limit=3');
  const games = useFetch('/games');
  const upcoming = useFetch('/matches?status=scheduled&limit=4');
  const latest = useFetch('/matches?status=completed&limit=4');
  const live = useLive();
  const s = stats.data;
  const countFor = (c) => (games.data ? games.data.filter((g) => g.category === c).length : null);

  return (
    <div>
      {/* ESPORTS BROADCAST TICKER BAR */}
      <div className="overflow-hidden border-b border-white/[0.07] bg-ink-900/90 py-2 backdrop-blur-md">
        <div className="animate-marquee flex items-center gap-8 font-game text-xs uppercase tracking-widest text-slate-300">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-8">
              <span className="flex items-center gap-2 text-cyan-300"><Flame size={14} className="text-live" /> SEASON 2026 REGISTRATION OPEN</span>
              <span className="text-slate-600">///</span>
              <span>REAL-TIME TIKTOK &amp; YOUTUBE LIVE STREAM INTEGRATION</span>
              <span className="text-slate-600">///</span>
              <span className="text-amber-300">COMPETE • CLIMB THE LEADERBOARD • CLAIM VICTORY</span>
              <span className="text-slate-600">///</span>
              <span>PUBG MOBILE • MOBILE LEGENDS • VALORANT • FREE FIRE • EFOOTBALL</span>
              <span className="text-slate-600">///</span>
            </div>
          ))}
        </div>
      </div>

      {/* HERO: Cinematic Esports Opening */}
      <section className="relative overflow-hidden border-b border-ink-600">
        <img src="/images/hero.svg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-75 transition-transform duration-1000 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-brand/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/35" />

        {/* Tactical HUD Brackets */}
        <div className="pointer-events-none absolute left-4 top-4 h-12 w-12 border-l-2 border-t-2 border-cyan-400/80" />
        <div className="pointer-events-none absolute right-4 top-4 h-12 w-12 border-r-2 border-t-2 border-brand/80" />
        <div className="pointer-events-none absolute bottom-4 left-4 h-12 w-12 border-b-2 border-l-2 border-brand/80" />
        <div className="pointer-events-none absolute bottom-4 right-4 h-12 w-12 border-b-2 border-r-2 border-cyan-400/80" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink-950 to-transparent" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 md:py-20 lg:grid-cols-[1.18fr_1fr]">
          <div>
            <h1 className="animate-fadeUp max-w-2xl font-game text-4xl font-bold uppercase leading-[1.06] tracking-wide md:text-6xl">
              Enter the <span className="neon-text">Arena</span>. Dominate Every Match.
            </h1>
            <p className="animate-fadeUp mt-5 max-w-xl text-base text-slate-300 md:text-lg" style={{ animationDelay: '.1s' }}>
              Watch live streams, track real-time scores, build your squad, and compete in official esports tournaments.
            </p>

            <div className="animate-fadeUp mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: '.2s' }}>
              <LiveButton size="lg" />
              <Link to="/tournaments" className="btn-primary hud-clip px-6 py-3"><Trophy size={18} /> Browse Tournaments</Link>
              {user ? (
                <Link to={user.role === 'admin' ? '/admin' : '/player'} className="btn-ghost px-6 py-3">Go to Dashboard</Link>
              ) : (
                <Link to="/signup" className="btn-ghost px-6 py-3"><UserPlus size={18} /> Join as a Player</Link>
              )}
            </div>

            {/* HUD Stat Counters */}
            <div className="animate-fadeUp mt-10 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4" style={{ animationDelay: '.3s' }}>
              {[
                ['Players', s?.players],
                ['Teams', s?.teams],
                ['Tournaments', s?.tournaments],
                ['Matches', s?.matches],
              ].map(([l, v]) => (
                <div key={l} className="group rounded-xl border border-white/10 bg-ink-900/75 p-3.5 backdrop-blur transition hover:border-cyan-400/50">
                  <p className="font-display text-3xl font-bold text-white transition group-hover:text-cyan-300">{v ?? '-'}</p>
                  <p className="font-game text-[11px] font-semibold uppercase tracking-widest text-slate-400">{l}</p>
                </div>
              ))}
            </div>
          </div>

          <HeroLivePanel next={upcoming.data?.[0]} />
        </div>
      </section>

      {/* LIVE NOW */}
      {live.matches.length > 0 && (
        <Section title="Live now" subtitle="Matches being played right now. Scores update automatically." to="/live">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{live.matches.slice(0, 6).map((m, i) => <LiveMatchCard key={m.id} m={m} index={i} />)}</div>
        </Section>
      )}

      {/* FEATURED GAMES */}
      <Section title="Featured games" subtitle="The games our tournaments are played in." to="/games">
        <Async state={games} empty="The administrator has not added any games yet.">{(d) => (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {d.slice(0, 5).map((g) => (
              <Link key={g.id} to={`/games?category=${g.category}`} className="group relative block aspect-[3/4] overflow-hidden rounded-2xl border border-ink-600 transition duration-300 hover:-translate-y-1.5 hover:border-cyan-400/70 hover:shadow-[0_0_28px_rgba(34,211,238,.3)]">
                <img src={gameImg(g)} alt={g.name} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
                <div className="absolute inset-x-3 bottom-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">{categoryLabel(g.category)}</p>
                  <p className="font-display text-xl font-bold leading-tight text-white">{g.name}</p>
                  <p className="text-xs text-slate-300">{g.tournaments} tournament{g.tournaments === 1 ? '' : 's'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}</Async>
      </Section>

      {/* CATEGORIES */}
      <Section title="Game categories" subtitle="Pick a category to see its games." to="/games">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORIES.map((c) => {
            const n = countFor(c.value);
            return (
              <Link key={c.value} to={`/games?category=${c.value}`} className="group relative block h-40 overflow-hidden rounded-2xl border border-ink-600 transition duration-300 hover:-translate-y-1 hover:border-brand/60">
                <img src={coverFor(c.value)} alt={c.label} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="flex items-center gap-2 font-display text-xl font-bold uppercase text-white"><c.icon size={18} className="text-brand-400" /> {c.label}</p>
                  <p className="text-xs text-slate-300">{n === null ? ' ' : n === 0 ? 'No games yet' : `${n} game${n > 1 ? 's' : ''}`}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* TOURNAMENTS */}
      <Section title="Featured tournaments" subtitle="Ongoing and upcoming events." to="/tournaments">
        <Async state={tournaments} empty="No tournaments have been created yet. Check back soon.">{(d) => <div className="grid gap-5 md:grid-cols-3">{d.map((t, i) => <TournamentCard key={t.id} t={t} index={i} />)}</div>}</Async>
      </Section>

      {/* HOW IT WORKS */}
      <section className="border-y border-ink-600 bg-ink-900/60">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="mb-8 text-center font-game text-3xl font-bold uppercase md:text-4xl">How it works</h2>
          <div className="grid gap-5 md:grid-cols-4">
            {[
              [UserPlus, 'Create an account', 'Sign up as a player in under a minute.'],
              [Users, 'Build your team', 'Create a team or ask to join one.'],
              [ClipboardCheck, 'Register', 'Enter tournaments that are open for registration.'],
              [Medal, 'Climb the ranks', 'Wins from published results update the leaderboard.'],
            ].map(([I, t, d], i) => (
              <div key={t} className="card p-6 text-center transition hover:-translate-y-1 hover:border-brand/50">
                <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-violet-600 text-white"><I size={22} /></span>
                <p className="font-game text-xs font-bold tracking-widest text-brand-400">STEP {i + 1}</p>
                <h3 className="text-xl font-bold">{t}</h3>
                <p className="mt-1 text-sm text-slate-400">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MATCHES */}
      <Section title="Upcoming matches" subtitle="Scheduled by the tournament administrators." to="/matches">
        <Async state={upcoming} empty="No matches are scheduled right now.">{(d) => <div className="grid gap-4 md:grid-cols-2">{d.map((m, i) => <MatchRow key={m.id} m={m} index={i} />)}</div>}</Async>
      </Section>
      <Section title="Latest results" to="/matches">
        <Async state={latest} empty="No match results have been published yet.">{(d) => <div className="grid gap-4 md:grid-cols-2">{d.map((m, i) => <MatchRow key={m.id} m={m} index={i} />)}</div>}</Async>
      </Section>

      {/* BOTTOM ARENA CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-4 pt-6">
        <div className="esports-frame relative overflow-hidden rounded-2xl border border-ink-600 p-10 text-center md:p-14">
          <img src="/images/covers/moba.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/90 via-ink-950/60 to-ink-950/90" />
          <div className="relative">
            <Swords className="mx-auto mb-3 text-cyan-400" size={38} />
            <h2 className="font-game text-3xl font-bold uppercase md:text-5xl">Ready to join the arena?</h2>
            <p className="mx-auto mt-2 max-w-lg text-slate-300">Create your player account, join a team and register for your first tournament.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/signup" className="btn-primary hud-clip px-6 py-3">Get started</Link>
              <Link to="/leaderboard" className="btn-ghost px-6 py-3"><Medal size={16} /> See the leaderboard</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
