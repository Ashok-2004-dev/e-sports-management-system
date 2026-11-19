import { useState } from 'react';
import { Medal, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import CrudPage from '../../components/CrudPage';
import useFetch from '../../hooks/useFetch';
import { Loading, Modal, StatusBadge } from '../../components/ui';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { fmtDateTime } from '../../services/format';

export default function AdminMatches() {
  const toast = useToast();
  const tournaments = useFetch('/tournaments');
  const teams = useFetch('/teams');
  const [resultFor, setResultFor] = useState(null);
  // LIVE GAMES: modal state for "Go live" / "Update live score"
  const [liveFor, setLiveFor] = useState(null);
  const [liveForm, setLiveForm] = useState({ is_live: true, score1: 0, score2: 0 });
  const [scores, setScores] = useState({ score1: '', score2: '' });
  const [refreshKey, setRefreshKey] = useState(0);
  if (!tournaments.data || !teams.data) return <Loading />;

  const ready = tournaments.data.length > 0 && teams.data.length > 1;
  const teamOpts = teams.data.map((t) => ({ value: t.id, label: t.name }));
  const fields = [
    { name: 'tournament_id', label: 'Tournament', type: 'select', required: true, full: true, options: tournaments.data.map((t) => ({ value: t.id, label: t.title })) },
    { name: 'team1_id', label: 'Team 1', type: 'select', required: true, options: teamOpts },
    { name: 'team2_id', label: 'Team 2', type: 'select', required: true, options: teamOpts },
    { name: 'stage', label: 'Stage', default: 'Group Stage' }, { name: 'match_date', label: 'Date and time', type: 'datetime-local', required: true },
    // LIVE GAMES: optional. YouTube and Twitch play inside the site; TikTok Live and other links open in a new tab.
    { name: 'stream_url', label: 'Stream link (TikTok Live, YouTube, or Twitch — optional)', placeholder: 'https://www.tiktok.com/@yourusername/live', type: 'url', full: true },
  ];
  const columns = [
    { key: 'tournament', label: 'Tournament' }, { key: 'team1', label: 'Match', render: (r) => `${r.team1} vs ${r.team2}` },
    { key: 'match_date', label: 'When', render: (r) => fmtDateTime(r.match_date) }, { key: 'stage', label: 'Stage' },
    { key: 'score1', label: 'Score', render: (r) => (r.status === 'completed' ? `${r.score1} - ${r.score2}` : r.status === 'live' ? `${r.live_score1} - ${r.live_score2}` : '-') },
    { key: 'winner', label: 'Winner', render: (r) => r.winner || '-' }, { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];
  const openResult = (row) => { setResultFor(row); setScores({ score1: row.score1 ?? '', score2: row.score2 ?? '' }); };
  const openLive = (row) => { setLiveFor(row); setLiveForm({ is_live: true, score1: row.live_score1 ?? 0, score2: row.live_score2 ?? 0 }); };
  const saveLive = async (e) => {
    e.preventDefault();
    try { const r = await api.put(`/admin/matches/${liveFor.id}/live`, liveForm); toast.success(r.message); setLiveFor(null); setRefreshKey((k) => k + 1); }
    catch (err) { toast.error(err.message); }
  };
  const saveResult = async (e) => {
    e.preventDefault();
    try { const r = await api.put(`/admin/matches/${resultFor.id}/result`, scores); toast.success(r.message); setResultFor(null); setRefreshKey((k) => k + 1); }
    catch (err) { toast.error(err.message); }
  };

  return (
    <>
      <CrudPage title="Matches & results" subtitle="Schedule matches, enter scores and publish results." endpoint="/admin/matches" columns={columns} fields={fields} addLabel="Schedule match" refreshKey={refreshKey} canCreate={ready} emptyText="No matches yet. Schedule your first match."
        notice={!ready && <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-950/40 p-3 text-sm text-amber-200">To schedule a match you need at least one tournament and two teams. <Link to="/admin/tournaments" className="font-semibold underline">Tournaments</Link> - <Link to="/admin/teams" className="font-semibold underline">Teams</Link></div>}
        rowActions={(row) => (
          <>
            {/* LIVE GAMES: start a match / change its live score. Not offered once a result is published. */}
            {row.status !== 'completed' && <button title={row.status === 'live' ? 'Update live score or end live' : 'Mark this match as live'} onClick={() => openLive(row)} className={`btn-ghost px-2 py-1 text-xs ${row.status === 'live' ? 'border-live/60 text-live-soft' : ''}`}><Radio size={14} /> {row.status === 'live' ? 'Live' : 'Go live'}</button>}
            <button title="Enter / update result" onClick={() => openResult(row)} className="btn-ghost px-2 py-1 text-xs"><Medal size={14} /> Result</button>
          </>
        )} />
      {liveFor && (
        <Modal title={liveFor.status === 'live' ? 'Update live match' : 'Go live'} onClose={() => setLiveFor(null)}>
          <form onSubmit={saveLive} className="space-y-4">
            <p className="text-sm text-slate-400">{liveFor.tournament} - {liveFor.stage}</p>
            <label className="flex items-center gap-3 text-sm text-white"><input type="checkbox" className="h-4 w-4 accent-red-500" checked={liveForm.is_live} onChange={(e) => setLiveForm({ ...liveForm, is_live: e.target.checked })} /> This match is live now</label>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">{liveFor.team1}</label><input type="number" min="0" required className="input" value={liveForm.score1} onChange={(e) => setLiveForm({ ...liveForm, score1: e.target.value })} /></div>
              <div><label className="label">{liveFor.team2}</label><input type="number" min="0" required className="input" value={liveForm.score2} onChange={(e) => setLiveForm({ ...liveForm, score2: e.target.value })} /></div>
            </div>
            <p className="text-xs text-slate-500">Viewers see this score on the Live Games page. Add or change the stream link with Edit. To finish the match, publish the final score with the Result button.</p>
            <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setLiveFor(null)}>Cancel</button><button className="btn-primary">{liveForm.is_live ? 'Save live score' : 'Take off live list'}</button></div>
          </form>
        </Modal>
      )}
      {resultFor && (
        <Modal title="Enter result" onClose={() => setResultFor(null)}>
          <form onSubmit={saveResult} className="space-y-4">
            <p className="text-sm text-slate-400">{resultFor.tournament} - {resultFor.stage}</p>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">{resultFor.team1}</label><input type="number" min="0" required className="input" value={scores.score1} onChange={(e) => setScores({ ...scores, score1: e.target.value })} /></div>
              <div><label className="label">{resultFor.team2}</label><input type="number" min="0" required className="input" value={scores.score2} onChange={(e) => setScores({ ...scores, score2: e.target.value })} /></div>
            </div>
            <p className="text-xs text-slate-500">The team with the higher score is declared the winner. Scores cannot be tied.</p>
            <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setResultFor(null)}>Cancel</button><button className="btn-primary">Publish result</button></div>
          </form>
        </Modal>
      )}
    </>
  );
}
