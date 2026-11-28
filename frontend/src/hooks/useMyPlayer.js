import useFetch from './useFetch';
import { useAuth } from '../context/AuthContext';

// the logged-in player's team and registrations (nothing is loaded for guests and admins)
export default function useMyPlayer() {
  const { user } = useAuth();
  const isPlayer = user?.role === 'player';
  const team = useFetch(isPlayer ? '/player/team' : null);
  const regs = useFetch(isPlayer ? '/player/registrations' : null);
  return {
    isPlayer,
    team: team.data,
    registrations: regs.data,
    registrationFor: (id) => regs.data?.find((r) => String(r.tournament_id) === String(id)),
    reload: () => { team.reload(); regs.reload(); },
  };
}
