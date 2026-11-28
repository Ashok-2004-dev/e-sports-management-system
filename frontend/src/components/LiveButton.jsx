import { Link } from 'react-router-dom';
import { useLive } from '../context/LiveContext';

// NEW: the prominent "LIVE" button with the pulsing red recording dot.
// size="sm" is used in the navbar / dashboard top bar, size="lg" in the home page hero.
// A small counter appears when matches are live, so viewers can see at a glance whether anything is on.
export default function LiveButton({ size = 'sm', className = '' }) {
  const { count } = useLive();
  if (!count) return null; // shown only while the admin has a match live
  return (
    <Link to="/live" className={`btn-live ${size === 'lg' ? 'btn-live-lg' : ''} ${className}`} aria-label={`Live matches: ${count} on now`}>
      <span className="live-dot" aria-hidden />
      <span className="font-game" style={{ letterSpacing: '.18em' }}>LIVE</span>
      {<span className="rounded bg-live px-1.5 text-[11px] font-bold leading-5 text-white">{count}</span>}
    </Link>
  );
}
