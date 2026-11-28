import { Link } from 'react-router-dom';
import { Brand } from './Navbar';
import { useLive } from '../context/LiveContext';

export default function Footer() {
  const { count } = useLive();
  return (
    <footer className="mt-20 border-t border-fg/[0.06] bg-ink-900/70 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
        <div className="space-y-3">
          <Brand />
          <p className="text-sm text-slate-400">One platform for players, teams, tournaments, match schedules, results and leaderboards.</p>
        </div>
        <div className="text-sm">
          <h4 className="mb-3 text-lg font-bold uppercase">Explore</h4>
          <div className="grid grid-cols-2 gap-2 text-slate-400">
            <Link to="/tournaments" className="hover:text-fg">Tournaments</Link><Link to="/teams" className="hover:text-fg">Teams</Link>
            <Link to="/matches" className="hover:text-fg">Matches</Link>{count > 0 && <Link to="/live" className="flex items-center gap-2 hover:text-fg"><span className="live-dot" aria-hidden /> Live games</Link>}
            <Link to="/leaderboard" className="hover:text-fg">Leaderboard</Link>
            <Link to="/games" className="hover:text-fg">Games</Link><Link to="/about" className="hover:text-fg">About</Link>
          </div>
        </div>
        <div className="text-sm text-slate-400">
          <h4 className="mb-3 text-lg font-bold uppercase text-fg">Project</h4>
          <p>Mini project by Ashok Acharya, Kanjur Wangmo and Kezang Sherab.</p>
          <p className="mt-1">Jigme Namgyal Engineering College, Bhutan.</p>
        </div>
      </div>
      <p className="border-t border-ink-600 py-4 text-center text-xs text-slate-500">&copy; 2026 E-Sports Management System</p>
    </footer>
  );
}
