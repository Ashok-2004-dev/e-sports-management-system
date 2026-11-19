import { Link } from 'react-router-dom';
import CrudPage from '../../components/CrudPage';
import useFetch from '../../hooks/useFetch';
import { Loading, StatusBadge } from '../../components/ui';
import { fmtDate, fmtNu } from '../../services/format';

export default function AdminTournaments() {
  const games = useFetch('/games');
  if (!games.data) return <Loading />;
  const fields = [
    { name: 'title', label: 'Title', required: true, full: true },
    { name: 'game_id', label: 'Game type', type: 'select', required: true, options: games.data.map((g) => ({ value: g.id, label: g.name })) },
    { name: 'status', label: 'Status', type: 'select', required: true, default: 'upcoming', options: [{ value: 'upcoming', label: 'Upcoming' }, { value: 'ongoing', label: 'Ongoing' }, { value: 'completed', label: 'Completed' }] },
    { name: 'description', label: 'Description', type: 'textarea', full: true },
    { name: 'banner_url', label: 'Tournament banner image (optional, otherwise the game image is used)', type: 'image', full: true },
    { name: 'location', label: 'Location' }, { name: 'prize_pool', label: 'Prize pool (Nu.)', type: 'number', default: 0 },
    { name: 'registration_deadline', label: 'Registration deadline', type: 'date', required: true },
    { name: 'start_date', label: 'Start date', type: 'date', required: true }, { name: 'end_date', label: 'End date', type: 'date', required: true },
  ];
  const columns = [
    { key: 'title', label: 'Tournament' }, { key: 'game', label: 'Game' }, { key: 'start_date', label: 'Dates', render: (r) => `${fmtDate(r.start_date)} - ${fmtDate(r.end_date)}` },
    { key: 'prize_pool', label: 'Prize', render: (r) => fmtNu(r.prize_pool) }, { key: 'registrations', label: 'Registered' }, { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];
  return <CrudPage title="Tournaments" subtitle="Create and manage tournaments." endpoint="/admin/tournaments" columns={columns} fields={fields} addLabel="Create tournament" canCreate={games.data.length > 0}
    emptyText="No tournaments yet. Create your first tournament." notice={!games.data.length && <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-950/40 p-3 text-sm text-amber-200">You need at least one game first. <Link to="/admin/games" className="font-semibold underline">Add a game</Link></div>} />;
}
