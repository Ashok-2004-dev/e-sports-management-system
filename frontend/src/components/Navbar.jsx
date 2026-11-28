import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Gamepad2, Menu, X, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LiveButton from './LiveButton';
import ThemeToggle from './ThemeToggle';

const LINKS = [['/', 'Home'], ['/about', 'About'], ['/games', 'Games'], ['/tournaments', 'Tournaments'], ['/teams', 'Teams'], ['/matches', 'Matches'], ['/leaderboard', 'Leaderboard']];

export const Brand = () => (
  <Link to="/" className="flex shrink-0 items-center gap-2 whitespace-nowrap">
    <span className="rounded-lg bg-gradient-to-br from-cyan-400 via-brand to-violet-600 p-1.5 text-white shadow-[0_0_16px_rgba(34,211,238,.45)]"><Gamepad2 size={22} /></span>
    <span className="font-game text-base font-bold uppercase tracking-widest text-fg">E-Sports <span className="neon-text">MS</span></span>
  </Link>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const home = user ? (user.role === 'admin' ? '/admin' : '/player') : null;
  const link = ({ isActive }) => `rounded-md px-2 py-2 text-sm font-medium transition ${isActive ? 'bg-cyan-400/10 text-cyan-300' : 'text-slate-300 hover:bg-ink-700/60 hover:text-fg'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-ink-600 bg-ink-950/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Brand />
        {/* NEW: prominent LIVE button (pulsing red dot). Sits right after the logo and stays visible on phones, outside the hamburger menu. */}
        <LiveButton />
        <nav className="hidden items-center gap-1 xl:ml-2 xl:flex">
          {LINKS.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={link}>{label}</NavLink>)}
        </nav>
        <div className="ml-auto hidden items-center gap-2 xl:flex">
          <ThemeToggle />
          {user ? (
            <>
              <Link to={home} className="btn-primary"><LayoutDashboard size={16} /> Dashboard</Link>
              <button onClick={() => { logout(); nav('/'); }} className="btn-ghost"><LogOut size={16} /> Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/signup" className="btn-primary">Sign up</Link>
              <Link to="/admin-login" className="btn-ghost border-violet-500/60 text-violet-300 hover:bg-violet-500/10"><ShieldCheck size={16} /> Admin</Link>
            </>
          )}
        </div>
        <ThemeToggle className="ml-auto xl:hidden" />
        <button className="rounded p-2 text-fg xl:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="space-y-1 border-t border-ink-600 px-4 py-3 xl:hidden" onClick={() => setOpen(false)}>
          {LINKS.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={link}>{label}</NavLink>)}
          <div className="flex gap-2 pt-2">
            {user ? (
              <>
                <Link to={home} className="btn-primary flex-1">Dashboard</Link>
                <button onClick={() => { logout(); nav('/'); }} className="btn-ghost flex-1">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost flex-1">Login</Link>
                <Link to="/signup" className="btn-primary flex-1">Sign up</Link>
                <Link to="/admin-login" className="btn-ghost flex-1 border-violet-500/60 text-violet-300">Admin</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
