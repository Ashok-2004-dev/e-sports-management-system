import CrudPage from '../../components/CrudPage';
import { Thumb } from '../../components/ui';

const fields = [{ name: 'name', label: 'Team name', required: true, full: true }, { name: 'region', label: 'Region' }, { name: 'coach_name', label: 'Coach' }, { name: 'logo_url', label: 'Team logo', type: 'image', full: true }];
const columns = [{ key: 'logo_url', label: '', render: (r) => <Thumb src={r.logo_url} name={r.name} size={36} /> }, { key: 'name', label: 'Team' }, { key: 'region', label: 'Region' }, { key: 'coach_name', label: 'Coach' }, { key: 'captain', label: 'Captain' }, { key: 'members', label: 'Members' }];
export default function AdminTeams() {
  return <CrudPage title="Teams" subtitle="Create, edit and delete teams." endpoint="/admin/teams" columns={columns} fields={fields} addLabel="Add team" emptyText="No teams yet. Add a team here, or players can create their own." />;
}
