import CrudPage from '../../components/CrudPage';
import { StatusBadge, Thumb } from '../../components/ui';

const columns = [
  { key: 'avatar_url', label: '', render: (r) => <Thumb src={r.avatar_url} name={r.name} size={34} round /> },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'dzongkhag', label: 'Dzongkhag' },
  { key: 'contact_no', label: 'Phone no.' },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];
export default function AdminPlayers() {
  return (
    <CrudPage
      title="Players"
      subtitle="Search or delete player accounts."
      endpoint="/admin/players"
      columns={columns}
      fields={[]}
      canCreate={false}
      canEdit={false}
      emptyText="No players yet. Players appear here when they register on the public site."
    />
  );
}
