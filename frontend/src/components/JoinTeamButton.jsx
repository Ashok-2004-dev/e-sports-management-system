import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from './ui';

// "Join team" for one team. `mine` is the answer of /player/team.
export default function JoinTeamButton({ team, mine, onDone, className = '' }) {
  const { user } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  if (user?.role === 'admin') return null;
  if (!user) return <Link to="/login" className={`btn-ghost ${className}`}>Log in to join</Link>;
  if (!mine) return null;

  if (mine.team?.id === team.id) {
    return mine.status === 'pending'
      ? <p className={`flex items-center justify-center gap-2 text-sm ${className}`}>Join request <StatusBadge status="pending" /></p>
      : <Link to="/player/team" className={`btn-ghost ${className}`}>Your team</Link>;
  }

  const full = team.team_size && Number(team.members) >= team.team_size;
  const join = async () => {
    setBusy(true);
    try { const r = await api.post(`/player/teams/${team.id}/join`); toast.success(r.message); onDone?.(); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <button type="button" className={`btn-primary ${className}`} disabled={busy || full || !!mine.team} onClick={join}
      title={mine.team ? 'Leave your current team or cancel your request first' : undefined}>
      <UserPlus size={16} /> {full ? 'Team full' : mine.team ? 'Already in a team' : busy ? 'Sending...' : 'Join team'}
    </button>
  );
}
