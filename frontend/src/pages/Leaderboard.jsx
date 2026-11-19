import { useState } from 'react';
import { Crown } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { Async, PageHeader, Thumb } from '../components/ui';

export default function Leaderboard() {
  const [tab, setTab] = useState('teams');
  const state = useFetch(`/leaderboard/${tab}`);
  const medal = (i) => (i === 0 ? 'text-amber-300' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-slate-500');
  return (
    <div>
      <PageHeader title="Leaderboard" subtitle="Rankings calculated from published match results (3 points per win)." />
      <div className="mb-6 inline-flex rounded-lg border border-ink-600 bg-ink-900 p-1">
        {[['teams', 'Teams'], ['players', 'Players']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-md px-4 py-2 text-sm font-semibold transition ${tab === k ? 'bg-gradient-to-r from-brand to-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>{l}</button>
        ))}
      </div>
      <Async state={state} empty="No data yet.">{(d) => (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-600 text-xs uppercase text-slate-400">
              <tr><th className="px-4 py-3">Rank</th><th className="px-4 py-3">{tab === 'teams' ? 'Team' : 'Player'}</th><th className="px-4 py-3">{tab === 'teams' ? 'Region' : 'Team'}</th>
                <th className="px-4 py-3 text-center">Played</th><th className="px-4 py-3 text-center">Wins</th><th className="px-4 py-3 text-center">Losses</th><th className="px-4 py-3 text-center">Points</th></tr>
            </thead>
            <tbody>
              {d.map((r, i) => (
                <tr key={r.id} className="border-b border-ink-700 last:border-0 hover:bg-ink-700/40">
                  <td className={`px-4 py-3 font-display text-xl font-bold ${medal(i)}`}>{i === 0 ? <Crown size={20} /> : i + 1}</td>
                  <td className="px-4 py-3 font-semibold text-white"><span className="flex items-center gap-3"><Thumb src={tab === 'teams' ? r.logo_url : r.avatar_url} name={r.name} size={30} round={tab !== 'teams'} />{r.name}</span></td>
                  <td className="px-4 py-3 text-slate-400">{tab === 'teams' ? r.region : r.team}</td>
                  <td className="px-4 py-3 text-center">{r.played}</td><td className="px-4 py-3 text-center text-emerald-300">{r.wins}</td>
                  <td className="px-4 py-3 text-center text-red-300">{r.played - r.wins}</td><td className="px-4 py-3 text-center font-bold text-white">{r.wins * 3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}</Async>
    </div>
  );
}
