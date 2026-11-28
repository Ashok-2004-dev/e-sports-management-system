import { useEffect, useRef, useState } from 'react';
import { Loader2, X, Inbox } from 'lucide-react';

const COLORS = {
  upcoming: 'bg-blue-500/15 text-blue-300', scheduled: 'bg-blue-500/15 text-blue-300',
  ongoing: 'bg-emerald-500/15 text-emerald-300', approved: 'bg-emerald-500/15 text-emerald-300', active: 'bg-emerald-500/15 text-emerald-300',
  completed: 'bg-slate-500/20 text-slate-300', pending: 'bg-amber-500/15 text-amber-300',
  rejected: 'bg-red-500/15 text-red-300', inactive: 'bg-red-500/15 text-red-300',
};
// NEW: the red pulsing "LIVE" tag. The pulse comes from .live-dot in index.css.
export const LiveBadge = ({ label = 'LIVE' }) => <span className="live-badge"><span className="live-dot" aria-hidden />{label}</span>;
// 'live' matches get the pulsing badge; every other status keeps its coloured pill
export const StatusBadge = ({ status }) => (status === 'live' ? <LiveBadge /> : <span className={`badge ${COLORS[status] || 'bg-slate-500/20 text-slate-300'}`}>{status}</span>);

// NEW: entrance animation. Wraps a card; it fades/slides in the first time it scrolls into view.
// `index` staggers neighbours (70 ms apart, capped) so a grid of cards cascades in instead of popping in at once.
export function Reveal({ index = 0, className = '', children }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setSeen(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${seen ? 'is-in' : ''} ${className}`} style={{ '--d': `${Math.min(index, 8) * 70}ms` }}>{children}</div>;
}

export const Spinner = ({ size = 20 }) => <Loader2 size={size} className="animate-spin text-brand-400" />;
export const Loading = () => <div className="flex justify-center py-16"><Spinner size={32} /></div>;
export const ErrorBox = ({ text }) => <div className="rounded-lg border border-red-500/40 bg-red-950/50 p-4 text-sm text-red-200">{text}</div>;
export const Empty = ({ text = 'Nothing to show yet.', title = 'Nothing here yet', action }) => (
  <div className="card flex flex-col items-center gap-2 border-dashed p-10 text-center">
    <span className="rounded-full bg-ink-700 p-3 text-slate-400"><Inbox size={26} /></span>
    <p className="font-display text-xl font-bold text-fg">{title}</p>
    <p className="max-w-md text-sm text-slate-400">{text}</p>
    {action}
  </div>
);

export const PageHeader = ({ title, subtitle, children }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="font-game text-2xl font-bold tracking-wide md:text-3xl">{title}</h1>
      <div className="hud-line mt-2 w-16 rounded-full" />
      {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="card animate-fadeUp my-8 w-full max-w-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-ink-700 hover:text-fg"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// wraps a useFetch result: shows spinner / error / empty message, otherwise the children
export function Async({ state, empty, children }) {
  if (state.loading && !state.data) return <Loading />;
  if (state.error) return <ErrorBox text={state.error} />;
  if (empty && Array.isArray(state.data) && !state.data.length) return <Empty text={empty} />;
  return children(state.data);
}

// small picture of a team (rounded square) or a player (circle); shows initials when there is no image
export function Thumb({ src, name = '?', size = 36, round = false }) {
  const [bad, setBad] = useState(false);
  const initials = String(name).split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const style = { width: size, height: size, fontSize: size * 0.38 };
  const shape = round ? 'rounded-full' : 'rounded-lg';
  if (src && !bad) return <img src={src} alt={name} style={style} className={`${shape} shrink-0 object-cover`} onError={() => setBad(true)} />;
  return <span style={style} className={`${shape} flex shrink-0 items-center justify-center bg-gradient-to-br from-brand to-violet-600 font-display font-bold text-white`}>{initials}</span>;
}
