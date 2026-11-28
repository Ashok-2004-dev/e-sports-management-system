import { Trophy, Swords, Medal, ShieldCheck, Radio, Sliders } from 'lucide-react';

const VARIANTS = {
  player: {
    image: '/images/auth/trophy-arena.png',
    alt: 'Championship Trophy Arena Artwork',
    badge: 'Player Portal',
    badgeClass: 'border-fuchsia-400/35 bg-fuchsia-950/50 text-fuchsia-200',
    accent: 'border-fuchsia-500/40 shadow-fuchsia-600/20',
    glow: 'from-fuchsia-600/25 via-violet-600/15 to-cyan-500/20',
    highlights: [
      { icon: Trophy, label: 'Tournaments', color: 'text-amber-300' },
      { icon: Swords, label: 'Matches', color: 'text-fuchsia-300' },
      { icon: Medal, label: 'Rankings', color: 'text-cyan-300' },
    ],
  },
  admin: {
    image: '/images/auth/trophy-arena.png',
    alt: 'Esports Command Centre Championship Trophy',
    badge: 'Restricted Access',
    badgeClass: 'border-violet-400/40 bg-violet-950/60 text-violet-200',
    accent: 'border-violet-500/45 shadow-violet-600/25',
    glow: 'from-violet-600/30 via-fuchsia-600/15 to-indigo-500/20',
    highlights: [
      { icon: ShieldCheck, label: 'Operations', color: 'text-violet-300' },
      { icon: Radio, label: 'Live Control', color: 'text-rose-400' },
      { icon: Sliders, label: 'Brackets', color: 'text-cyan-300' },
    ],
  },
};

// Two-column layout for login & auth pages: championship trophy artwork + form
export default function AuthShell({ children, tagline = 'Join the arena', subtitle, variant = 'player' }) {
  const cfg = VARIANTS[variant] || VARIANTS.player;

  return (
    <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-2 lg:gap-10">
      {/* Mobile / Tablet compact trophy banner */}
      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-fuchsia-500/35 bg-ink-900/90 shadow-xl shadow-fuchsia-950/40 lg:hidden">
        <div className="relative h-44 w-full overflow-hidden">
          <img
            src={cfg.image}
            alt={cfg.alt}
            className="h-full w-full object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/45 to-transparent" />
          <div className="absolute bottom-3.5 left-4 right-4 z-10 flex items-end justify-between gap-2">
            <div>
              <span className={`mb-1 inline-block rounded-full border px-2.5 py-0.5 font-game text-[10px] font-semibold uppercase tracking-widest backdrop-blur-md ${cfg.badgeClass}`}>
                {cfg.badge}
              </span>
              <p className="font-game text-lg font-bold uppercase tracking-wider text-fg">{tagline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop showcase card */}
      <div className="relative hidden lg:block">
        <div className={`pointer-events-none absolute -inset-3 rounded-[2rem] bg-gradient-to-br ${cfg.glow} blur-2xl opacity-80`} />
        <div className={`auth-art group relative overflow-hidden rounded-3xl border bg-ink-800 shadow-2xl shadow-black/80 ${cfg.accent}`}>
          <div className="relative h-[31rem] w-full overflow-hidden">
            <img
              src={cfg.image}
              alt={cfg.alt}
              className="h-full w-full object-cover object-center transition duration-700 ease-out group-hover:scale-105"
            />
            {/* Ambient purple & dark vignette blending */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgb(var(--ink-950)/0.75)_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/35 to-fuchsia-950/15" />

            {/* Top HUD corner accents */}
            <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2 rounded-full border border-fg/10 art-chip bg-ink-950/70 px-3 py-1 text-[11px] font-semibold tracking-wider text-fuchsia-200/90 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-fuchsia-400 shadow-[0_0_8px_#e879f9]" />
              ARENA CHAMPIONSHIP
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 z-10">
            <span className={`mb-2.5 inline-block rounded-full border px-3 py-0.5 font-game text-xs font-semibold uppercase tracking-widest backdrop-blur-md ${cfg.badgeClass}`}>
              {cfg.badge}
            </span>
            <p className="font-game text-2xl font-bold uppercase tracking-wider text-fg drop-shadow">{tagline}</p>
            {subtitle && <p className="mt-1 text-sm text-slate-300/90">{subtitle}</p>}
            <div className="mt-3.5 flex flex-wrap items-center gap-4 border-t border-fg/10 pt-3 text-sm text-slate-200">
              {cfg.highlights.map(({ icon: Icon, label, color }) => (
                <span key={label} className="flex items-center gap-1.5 font-medium">
                  <Icon size={15} className={color} /> {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">{children}</div>
    </div>
  );
}
