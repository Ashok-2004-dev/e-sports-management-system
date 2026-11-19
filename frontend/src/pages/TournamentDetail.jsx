import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, MapPin, Coins, Clock, Users } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { Async, StatusBadge, Empty } from '../components/ui';
import { MatchRow } from '../components/Cards';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fmtDate, fmtNu } from '../services/format';
import { tournamentImg } from '../services/categories.jsx';

export default function TournamentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const state = useFetch(`/tournaments/${id}`);
  const [busy, setBusy] = useState(false);

  const register = async () => {
    setBusy(true);
    try { const r = await api.post('/player/registrations', { tournament_id: id }); toast.success(r.message); state.reload(); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <Async state={state}>{(t) => (
      <div className="space-y-8">
        <div className="card overflow-hidden">
          <div className="relative h-44 md:h-56"><img src={tournamentImg(t)} alt={t.game} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-ink-800 to-transparent" /></div>
          <div className="p-6 md:p-8">
          <div className="mb-3 flex flex-wrap items-center gap-3"><StatusBadge status={t.status} /><span className="text-sm font-semibold uppercase tracking-wider text-brand-400">{t.game}</span></div>
          <h1 className="text-4xl font-bold uppercase">{t.title}</h1>
          <p className="mt-3 max-w-3xl text-slate-400">{t.description || 'No description provided.'}</p>
          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <p className="flex items-center gap-2"><Calendar size={16} className="text-brand-400" /> {fmtDate(t.start_date)} - {fmtDate(t.end_date)}</p>
            <p className="flex items-center gap-2"><Clock size={16} className="text-brand-400" /> Register by {fmtDate(t.registration_deadline)}</p>
            <p className="flex items-center gap-2"><MapPin size={16} className="text-brand-400" /> {t.location || 'To be announced'}</p>
            <p className="flex items-center gap-2 text-amber-300"><Coins size={16} /> Prize pool {fmtNu(t.prize_pool)}</p>
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-400"><Users size={16} /> {t.registrations} registered player(s)</p>
          <div className="mt-6">
            {t.status !== 'upcoming' ? <p className="text-sm text-slate-400">Registration is closed for this tournament.</p>
              : user?.role === 'player' ? <button className="btn-primary px-6 py-3" disabled={busy} onClick={register}>{busy ? 'Submitting...' : 'Register for this tournament'}</button>
              : user?.role === 'admin' ? <p className="text-sm text-slate-400">Admins manage registrations from the admin dashboard.</p>
              : <Link to="/login" className="btn-primary px-6 py-3">Log in to register</Link>}
          </div>
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-bold uppercase">Matches</h2>
          {t.matches.length ? <div className="grid gap-4 md:grid-cols-2">{t.matches.map((m, i) => <MatchRow key={m.id} m={m} index={i} />)}</div>
            : <Empty title="No matches yet" text="The admin has not scheduled matches for this tournament." />}
        </div>
      </div>
    )}</Async>
  );
}
