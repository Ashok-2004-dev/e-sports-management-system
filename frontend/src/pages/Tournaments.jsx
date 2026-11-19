import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { Async, PageHeader } from '../components/ui';
import { TournamentCard } from '../components/Cards';
import useBase from '../hooks/useBase';

export default function Tournaments() {
  const base = useBase();
  const [params] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [game, setGame] = useState(params.get('game') || '');
  const games = useFetch('/games');
  const list = useFetch(`/tournaments?search=${encodeURIComponent(search)}&status=${status}&game_id=${game}`);

  return (
    <div>
      <PageHeader title="Tournaments" subtitle="Find an event and register to compete." />
      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-9" placeholder="Search tournaments..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option><option value="upcoming">Upcoming</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option>
        </select>
        <select className="input" value={game} onChange={(e) => setGame(e.target.value)}>
          <option value="">All games</option>{(games.data || []).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>
      <Async state={list} empty="No tournaments match your search.">{(d) => <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{d.map((t, i) => <TournamentCard key={t.id} index={i} t={t} base={base} />)}</div>}</Async>
    </div>
  );
}
