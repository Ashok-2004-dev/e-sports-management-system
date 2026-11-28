import { useParams } from 'react-router-dom';
import { MapPin, Crown } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { Async, Empty, Thumb } from '../components/ui';
import { MatchRow } from '../components/Cards';
import useMyPlayer from '../hooks/useMyPlayer';
import JoinTeamButton from '../components/JoinTeamButton';

export default function TeamDetail() {
  const { id } = useParams();
  const state = useFetch(`/teams/${id}`);
  const me = useMyPlayer();
  return (
    <Async state={state}>{(t) => (
      <div className="space-y-8">
        <div className="card p-6 md:p-8">
          <div className="flex items-center gap-4"><Thumb src={t.logo_url} name={t.name} size={72} /><h1 className="text-4xl font-bold uppercase">{t.name}</h1></div>
          <p className="mt-2 flex items-center gap-2 text-slate-400"><MapPin size={16} /> {t.region || 'Region not set'}</p>
          <p className="mt-1 text-sm text-slate-400">Coach: {t.coach_name || 'Not assigned'}</p>
          <p className="mt-1 text-sm text-slate-400">{t.game || 'Game not set'} - {t.roster.length}{t.team_size ? ` / ${t.team_size}` : ''} players</p>
          <div className="mt-4 max-w-xs"><JoinTeamButton team={t} mine={me.team} onDone={() => { me.reload(); state.reload(); }} className="w-full" /></div>
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-bold uppercase">Roster</h2>
          {t.roster.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {t.roster.map((p) => (
                <div key={p.id} className="card flex items-center justify-between p-4">
                  <div className="flex items-center gap-3"><Thumb src={p.avatar_url} name={p.name} size={40} round /><div><p className="font-semibold text-fg">{p.name}</p><p className="text-xs text-slate-400">{p.dzongkhag || 'Player'}</p></div></div>
                  {t.captain_id === p.id && <Crown size={18} className="text-amber-300" />}
                </div>
              ))}
            </div>
          ) : <Empty title="No players yet" text="Players will appear here once they join this team." />}
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-bold uppercase">Recent matches</h2>
          {t.matches.length ? <div className="grid gap-4 md:grid-cols-2">{t.matches.map((m, i) => <MatchRow key={m.id} m={m} index={i} />)}</div>
            : <Empty title="No matches yet" text="This team has no scheduled or completed matches." />}
        </div>
      </div>
    )}</Async>
  );
}
