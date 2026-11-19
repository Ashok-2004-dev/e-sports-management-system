import { useEffect, useState } from 'react';
import { Gamepad2, Shield, Zap, Wifi } from 'lucide-react';

const STAGES = [
  'INITIALIZING ARENA ENGINE...',
  'CONNECTING LIVE TELEMETRY...',
  'LOADING TOURNAMENT BRACKETS...',
  'ARENA READY',
];

export default function ArenaBootScreen() {
  const [progress, setProgress] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);
  const [closing, setClosing] = useState(false);
  const [gone, setGone] = useState(() => {
    try {
      return sessionStorage.getItem('esms_boot_shown') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (gone) return;
    const start = performance.now();
    const duration = 1650; // crisp 1.65s AAA esports intro

    let raf;
    const tick = (now) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct < 35) setStageIdx(0);
      else if (pct < 70) setStageIdx(1);
      else if (pct < 96) setStageIdx(2);
      else setStageIdx(3);

      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setClosing(true);
          try { sessionStorage.setItem('esms_boot_shown', '1'); } catch {}
          setTimeout(() => setGone(true), 520);
        }, 180);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gone]);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#06070a] transition-all duration-500 ${
        closing ? 'pointer-events-none scale-105 opacity-0' : 'opacity-100'
      }`}
    >
      {/* Tactical Cyber Grid & Radial Glows */}
      <div className="bg-grid absolute inset-0 opacity-60" />
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-cyan-500/15 blur-[110px]" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-brand/20 blur-[110px]" />
      <div className="boot-scanline pointer-events-none absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent" />

      {/* HUD Corner Reticles */}
      <div className="pointer-events-none absolute left-6 top-6 h-12 w-12 border-l-2 border-t-2 border-cyan-400/70" />
      <div className="pointer-events-none absolute right-6 top-6 h-12 w-12 border-r-2 border-t-2 border-brand/70" />
      <div className="pointer-events-none absolute bottom-6 left-6 h-12 w-12 border-b-2 border-l-2 border-brand/70" />
      <div className="pointer-events-none absolute bottom-6 right-6 h-12 w-12 border-b-2 border-r-2 border-cyan-400/70" />

      {/* Top HUD Telemetry Bar */}
      <div className="absolute top-7 flex items-center gap-6 font-game text-[11px] uppercase tracking-[0.25em] text-slate-400">
        <span className="flex items-center gap-1.5 text-cyan-400"><Wifi size={13} /> SERVER: ONLINE</span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden items-center gap-1.5 sm:flex"><Shield size={13} className="text-brand-400" /> ANTI-CHEAT VERIFIED</span>
      </div>

      {/* Center Emblem + Rotating Tactical Rings */}
      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
          {/* Outer spinning dashed ring */}
          <svg className="absolute inset-0 h-full w-full animate-[spin_7s_linear_infinite]" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="55" fill="none" stroke="rgba(34,211,238,0.35)" strokeWidth="1.5" strokeDasharray="10 6" />
          </svg>
          {/* Inner counter-spinning arc */}
          <svg className="absolute inset-2 h-[calc(100%-16px)] w-[calc(100%-16px)] animate-[spin_4s_linear_infinite_reverse]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="url(#bootGrad)" strokeWidth="2.5" strokeDasharray="70 190" strokeLinecap="round" />
            <defs>
              <linearGradient id="bootGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#7c5cff" />
                <stop offset="100%" stopColor="#ff2e4d" />
              </linearGradient>
            </defs>
          </svg>
          {/* Core Hexagonal / Gaming Badge */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-400/50 bg-gradient-to-br from-cyan-500/20 via-brand/30 to-ink-900 shadow-[0_0_40px_rgba(34,211,238,0.4)]">
            <Gamepad2 size={38} className="text-white drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
          </div>
        </div>

        {/* Brand Glitch/Neon Title */}
        <p className="mb-1 font-game text-xs font-bold uppercase tracking-[0.35em] text-cyan-400">
          COMPETITIVE ARENA PLATFORM
        </p>
        <h1 className="font-game text-4xl font-bold uppercase tracking-[0.14em] text-white sm:text-5xl">
          E-SPORTS <span className="neon-text">MS</span>
        </h1>

        {/* Segmented Tactical Progress Bar */}
        <div className="mt-8 w-72 sm:w-96">
          <div className="mb-2 flex items-center justify-between font-game text-xs font-semibold tracking-widest">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Zap size={13} className="text-cyan-400" />
              {STAGES[stageIdx]}
            </span>
            <span className="tabular-nums text-cyan-300">{progress}%</span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-sm border border-cyan-400/30 bg-ink-900/90 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-brand to-live transition-all duration-75"
              style={{ width: `${progress}%`, boxShadow: '0 0 16px rgba(34,211,238,0.75)' }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Watermark */}
      <p className="absolute bottom-7 font-game text-[11px] uppercase tracking-[0.28em] text-slate-500">
        TOURNAMENTS • LIVE STREAMS • LEADERBOARDS
      </p>
    </div>
  );
}
