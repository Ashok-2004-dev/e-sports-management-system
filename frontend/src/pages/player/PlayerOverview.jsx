import { Link } from 'react-router-dom';
import { ClipboardList, Shield, Swords } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { Async, Empty, PageHeader } from '../../components/ui';
import { MatchRow } from '../../components/Cards';
import { useAuth } from '../../context/AuthContext';
import RecentNotifications from '../../components/RecentNotifications';

export default function PlayerOverview() {
  const { user } = useAuth();
  const state = useFetch('/player/overview');
  return (
    <div>
      <PageHeader title={`Welcome, ${user.name.split(' ')[0]}`} subtitle="Your player dashboard." />
      <Async state={state}>{(d) => (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card card-hover p-5"><ClipboardList className="mb-2 text-brand-400" /><p className="font-display text-3xl font-bold text-white">{d.registrations}</p><p className="text-sm text-slate-400">Tournament registrations</p></div>
            <div className="card card-hover p-5"><Shield className="mb-2 text-violet-400" /><p className="font-display text-2xl font-bold text-white">{d.team || 'No team yet'}</p><p className="text-sm text-slate-400">My team</p></div>
            <div className="card card-hover p-5"><Swords className="mb-2 text-emerald-400" /><p className="font-display text-3xl font-bold text-white">{d.nextMatches.length}</p><p className="text-sm text-slate-400">Upcoming team matches</p></div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/player/tournaments" className="btn-primary">Browse tournaments</Link>
            <Link to="/player/team" className="btn-ghost">Manage my team</Link>
            <Link to="/player/profile" className="btn-ghost">Edit profile</Link>
          </div>
          <RecentNotifications />
          <div>
            <h2 className="mb-4 text-2xl font-bold">My next matches</h2>
            {d.nextMatches.length ? <div className="grid gap-4 md:grid-cols-2">{d.nextMatches.map((m, i) => <MatchRow key={m.id} m={m} index={i} />)}</div>
              : <Empty title="No upcoming matches" text={d.team ? 'Your team has no scheduled matches yet.' : 'Join or create a team to see your match schedule.'} />}
          </div>
        </div>
      )}</Async>
    </div>
  );
}
