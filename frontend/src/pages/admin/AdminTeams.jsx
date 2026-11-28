import CrudPage from '../../components/CrudPage';
import { Thumb } from '../../components/ui';
import useFetch from '../../hooks/useFetch';

const fields = [{ name: 'name', label: 'Team name', required: true, full: true }, { name: 'region', label: 'Region' }, { name: 'coach_name', label: 'Coach' }, { name: 'logo_url', label: 'Team logo', type: 'image', full: true }];
const baseColumns = [{ key: 'logo_url', label: '', render: (r) => <Thumb src={r.logo_url} name={r.name} size={36} /> }, { key: 'name', label: 'Team' }, { key: 'region', label: 'Region' }, { key: 'coach_name', label: 'Coach' }, { key: 'captain', label: 'Captain' }, { key: 'game', label: 'Game' }, { key: 'members', label: 'Members', render: (r) => (r.team_size ? `${r.members} / ${r.team_size}` : r.members) }];
export default function AdminTeams() {
  const games = useFetch('/games');
  const allFields = [...fields, { name: 'game_id', label: 'Game', type: 'select', required: true, options: (games.data || []).map((g) => ({ value: g.id, label: `${g.name} (${g.team_size} per team)` })) }];
  return <CrudPage title="Teams" subtitle="Create, edit and delete teams." endpoint="/admin/teams" columns={baseColumns} fields={allFields} addLabel="Add team" emptyText="No teams yet. Add a team here, or players can create their own." />;
}
