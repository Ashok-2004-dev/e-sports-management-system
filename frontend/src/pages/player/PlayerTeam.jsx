import { useState } from 'react';
import { Check, X, Crown, LogOut, Plus } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { Async, PageHeader, Thumb } from '../../components/ui';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function PlayerTeam() {
  const toast = useToast();
  const state = useFetch('/player/team');
  const teams = useFetch('/teams');
  const [form, setForm] = useState({ name: '', region: '', coach_name: '' });

  const act = async (fn) => { try { const r = await fn(); toast.success(r.message); state.reload(); teams.reload(); } catch (e) { toast.error(e.message); } };
  const leave = () => window.confirm('Leave this team?') && act(() => api.post('/player/team/leave'));

  return (
    <div>
      <PageHeader title="My team" subtitle="Create a team or join an existing one." />
      <Async state={state}>{(d) => {
        if (!d.team) return (
          <div className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={(e) => { e.preventDefault(); act(() => api.post('/player/teams', form)).then(() => setForm({ name: '', region: '', coach_name: '' })); }} className="card space-y-4 p-6">
              <h3 className="text-2xl font-bold uppercase">Create a team</h3>
              <div><label className="label">Team name</label><input required minLength={3} className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="label">Region</label><input className="input" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} /></div>
              <div><label className="label">Coach (optional)</label><input className="input" value={form.coach_name} onChange={(e) => setForm({ ...form, coach_name: e.target.value })} /></div>
              <button className="btn-primary"><Plus size={16} /> Create team</button>
            </form>
            <div className="card p-6">
              <h3 className="mb-4 text-2xl font-bold uppercase">Join a team</h3>
              <Async state={teams} empty="No teams yet.">{(list) => (
                <div className="max-h-96 space-y-2 overflow-y-auto">{list.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg bg-ink-900 p-3">
                    <div><p className="font-semibold text-white">{t.name}</p><p className="text-xs text-slate-400">{t.region} - {t.members} member(s)</p></div>
                    <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => act(() => api.post(`/player/teams/${t.id}/join`))}>Request to join</button>
                  </div>))}</div>
              )}</Async>
            </div>
          </div>
        );
        if (d.status === 'pending') return (
          <div className="card max-w-xl space-y-3 p-6">
            <h3 className="text-2xl font-bold uppercase">Request pending</h3>
            <p className="text-slate-400">You asked to join <b className="text-white">{d.team.name}</b>. The team captain must approve your request.</p>
            <button className="btn-ghost" onClick={() => act(() => api.post('/player/team/leave'))}>Cancel request</button>
          </div>
        );
        return (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-3xl font-bold uppercase">{d.team.name}</h3>
              <p className="text-sm text-slate-400">{d.team.region || 'Region not set'} - Coach: {d.team.coach_name || 'Not assigned'}</p>
              <p className="mt-2 text-sm text-slate-300">{d.isCaptain ? 'You are the captain.' : 'You are a member.'}</p>
              <button className="btn-ghost mt-4" onClick={leave}><LogOut size={16} /> Leave team</button>
            </div>
            <div className="card p-6">
              <h4 className="mb-3 text-xl font-bold uppercase">Roster</h4>
              <div className="grid gap-2 sm:grid-cols-2">{d.roster.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-ink-900 p-3"><span className="flex items-center gap-2"><Thumb src={p.avatar_url} name={p.name} size={30} round /><b className="text-white">{p.name}</b></span>
                  </div>))}</div>
            </div>
            {d.isCaptain && (
              <div className="card p-6">
                <h4 className="mb-3 text-xl font-bold uppercase">Join requests</h4>
                {d.requests.length ? d.requests.map((p) => (
                  <div key={p.id} className="mb-2 flex items-center justify-between rounded-lg bg-ink-900 p-3">
                    <span className="flex items-center gap-2"><Thumb src={p.avatar_url} name={p.name} size={30} round /><b className="text-white">{p.name}</b></span>
                    <span className="flex gap-2">
                      <button className="btn-primary px-3 py-1.5" onClick={() => act(() => api.put(`/player/team/requests/${p.id}`, { action: 'approve' }))}><Check size={14} /></button>
                      <button className="btn-danger px-3 py-1.5" onClick={() => act(() => api.put(`/player/team/requests/${p.id}`, { action: 'reject' }))}><X size={14} /></button>
                    </span>
                  </div>)) : <p className="text-sm text-slate-400">No pending requests.</p>}
              </div>
            )}
          </div>
        );
      }}</Async>
    </div>
  );
}
