import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { Async, PageHeader, StatusBadge } from '../../components/ui';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { fmtDate } from '../../services/format';

export default function PlayerRegistrations() {
  const toast = useToast();
  const state = useFetch('/player/registrations');
  const cancel = async (id) => {
    if (!window.confirm('Cancel this registration?')) return;
    try { const r = await api.del(`/player/registrations/${id}`); toast.success(r.message); state.reload(); } catch (e) { toast.error(e.message); }
  };
  return (
    <div>
      <PageHeader title="My registrations" subtitle="Tournaments you have registered for." />
      <Async state={state} empty="You have not registered for any tournament yet.">{(d) => (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-600 text-xs uppercase text-slate-400"><tr><th className="px-4 py-3">Tournament</th><th className="px-4 py-3">Game</th><th className="px-4 py-3">Starts</th><th className="px-4 py-3">Team</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead>
            <tbody>{d.map((r) => (
              <tr key={r.id} className="border-b border-ink-700 last:border-0">
                <td className="px-4 py-3 font-semibold"><Link className="text-white hover:text-brand-400" to={`/player/tournaments/${r.tournament_id}`}>{r.title}</Link></td>
                <td className="px-4 py-3">{r.game}</td><td className="px-4 py-3">{fmtDate(r.start_date)}</td><td className="px-4 py-3">{r.team || '-'}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-right">{r.tournament_status === 'upcoming' && <button onClick={() => cancel(r.id)} className="btn-ghost px-2 py-1 text-xs"><XCircle size={14} /> Cancel</button>}</td>
              </tr>))}</tbody>
          </table>
        </div>
      )}</Async>
    </div>
  );
}
