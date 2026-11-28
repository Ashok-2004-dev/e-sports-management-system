import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, MapPin } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { Async, PageHeader, Thumb } from '../components/ui';
import useBase from '../hooks/useBase';
import useMyPlayer from '../hooks/useMyPlayer';
import JoinTeamButton from '../components/JoinTeamButton';

export default function Teams() {
  const base = useBase();
  const [q, setQ] = useState('');
  const state = useFetch(`/teams?search=${encodeURIComponent(q)}`);
  const me = useMyPlayer();
  const done = () => { me.reload(); state.reload(); };
  return (
    <div>
      <PageHeader title="Teams" subtitle="Competing teams from across the country." />
      <div className="relative mb-6 max-w-sm"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className="input pl-9" placeholder="Search by name or region..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <Async state={state} empty="No teams found.">{(d) => (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {d.map((t) => (
            <div key={t.id} className="card card-hover flex flex-col p-5">
              <Link to={`${base}/teams/${t.id}`} className="block flex-1">
                <div className="mb-3"><Thumb src={t.logo_url} name={t.name} size={56} /></div>
                <h3 className="text-2xl font-bold">{t.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">{t.game || 'Game not set'}</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-400"><MapPin size={14} /> {t.region || 'Region not set'}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-400"><Users size={14} /> {t.members}{t.team_size ? ` / ${t.team_size}` : ''} player(s){t.captain ? ` - Captain ${t.captain}` : ''}</p>
              </Link>
              <JoinTeamButton team={t} mine={me.team} onDone={done} className="mt-4 w-full" />
            </div>
          ))}
        </div>
      )}</Async>
    </div>
  );
}
