import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, ClipboardList, Users, Trophy, Swords, Medal, Menu, X, LogOut, Gamepad2, Shield, Calendar, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Brand } from '../components/Navbar';
import NotificationBell from '../components/NotificationBell';
import { useNotifications } from '../context/NotificationContext';
import LiveButton from '../components/LiveButton';
import ThemeToggle from '../components/ThemeToggle';
import BackButton from '../components/BackButton';

const PLAYER_LINKS = [
  { to: '/player', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/player/profile', label: 'My Profile', icon: User },
  { to: '/player/tournaments', label: 'Tournaments', icon: Trophy },
  { to: '/player/registrations', label: 'My Registrations', icon: ClipboardList },
  { to: '/player/team', label: 'My Team', icon: Shield },
  { to: '/player/teams', label: 'Join a Team', icon: Users },
  { to: '/player/matches', label: 'Matches', icon: Swords },
  { to: '/player/leaderboard', label: 'Leaderboard', icon: Medal },
  { to: '/player/games', label: 'Games', icon: Gamepad2 },
  { to: '/player/notifications', label: 'Notifications', icon: Bell, badge: true },
];
const ADMIN_LINKS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/players', label: 'Players', icon: User },
  { to: '/admin/teams', label: 'Teams', icon: Users },
  { to: '/admin/games', label: 'Games', icon: Gamepad2 },
  { to: '/admin/tournaments', label: 'Tournaments', icon: Trophy },
  { to: '/admin/registrations', label: 'Registrations', icon: ClipboardList },
  { to: '/admin/matches', label: 'Matches & Results', icon: Calendar },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell, badge: true },
  { to: '/leaderboard', label: 'Public Leaderboard', icon: Medal },
];

function Layout({ links, title }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const { pathname } = useLocation();
  const depth = pathname.split('/').filter(Boolean).length; // /player = 1, /player/teams = 2, /player/teams/3 = 3
  const { unread } = useNotifications();
  const item = ({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-gradient-to-r from-brand/25 to-cyan-400/10 text-fg ring-1 ring-inset ring-fg/10 [&>svg]:text-cyan-300' : 'text-slate-400 hover:bg-fg/5 hover:text-fg'}`;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-ink-600 p-4"><Brand /><p className="mt-2 text-xs uppercase tracking-widest text-slate-500">{title}</p></div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" onClick={() => setOpen(false)}>
        {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={item}><l.icon size={18} /> {l.label}{l.badge && unread > 0 && <span className="ml-auto rounded-full bg-pink-500 px-2 py-0.5 text-[11px] font-bold text-white">{unread}</span>}</NavLink>)}
      </nav>
      <div className="border-t border-ink-600 p-4">
        <p className="truncate text-sm font-semibold text-fg">{user.name}</p>
        <p className="mb-3 truncate text-xs text-slate-500">{user.email}</p>
        <button onClick={() => { logout(); nav('/'); }} className="btn-ghost w-full"><LogOut size={16} /> Log out</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-fg/[0.06] bg-ink-900/80 backdrop-blur-xl lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-ink-900">{sidebar}</aside>
        </div>
      )}
      <div className="flex-1 lg:ml-64">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-fg/[0.06] bg-ink-950/70 px-4 py-3 backdrop-blur-xl">
          <button onClick={() => setOpen(!open)} className="text-fg lg:hidden">{open ? <X /> : <Menu />}</button>
          <Gamepad2 className="text-cyan-300 lg:hidden" size={20} />
          <span className="min-w-0 truncate font-display text-lg font-bold tracking-wide text-fg">{title}</span>
          <div className="ml-auto flex shrink-0 items-center gap-3">
            {/* NEW: LIVE button in the dashboard top bar too */}
            <LiveButton />
            <span className="hidden text-sm text-slate-400 sm:block">Hi, <b className="text-fg">{user.name.split(' ')[0]}</b></span>
            <ThemeToggle />
            <NotificationBell />
          </div>
        </div>
        <main className="mx-auto max-w-6xl p-4 md:p-8">
          {/* NEW: Back button on dashboard detail pages (e.g. /player/teams/3); returns to the previous screen */}
          {depth > 1 && <div className="mb-5"><BackButton fallback={`/${pathname.split('/').slice(1, 3).join('/')}`} /></div>}
          {/* NEW: page transition (re-keyed on every navigation) */}
          <div key={pathname} className="animate-pageIn"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}

export const PlayerLayout = () => <Layout links={PLAYER_LINKS} title="Player Dashboard" />;
export const AdminLayout = () => <Layout links={ADMIN_LINKS} title="Admin Dashboard" />;
