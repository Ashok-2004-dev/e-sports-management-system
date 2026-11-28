import CrudPage from '../../components/CrudPage';
import { CATEGORIES, categoryLabel, gameImg, coverFor } from '../../services/categories.jsx';

const fields = [
  { name: 'name', label: 'Game name', required: true },
  { name: 'category', label: 'Category', type: 'select', required: true, default: 'other', options: CATEGORIES.map((c) => ({ value: c.value, label: c.label })) },
  { name: 'team_size', label: 'Players per team (PUBG Mobile = 4)', type: 'number', required: true, default: 5 },
  { name: 'description', label: 'Description', type: 'textarea', full: true },
  { name: 'image_url', label: 'Game image / cover', type: 'image', full: true },
];
const columns = [
  { key: 'cover', label: '', render: (r) => <img src={gameImg(r)} alt="" className="h-10 w-16 rounded object-cover" /> },
  { key: 'name', label: 'Game' },
  {
    key: 'category',
    label: 'Category',
    render: (r) => (
      <span className="inline-flex items-center gap-2">
        <img src={coverFor(r.category)} alt="" className="h-6 w-9 rounded object-cover" />
        <span>{categoryLabel(r.category)}</span>
      </span>
    ),
  },
  { key: 'team_size', label: 'Players per team' },
  { key: 'tournaments', label: 'Tournaments' },
];
export default function AdminGames() {
  return <CrudPage title="Games" subtitle="Add the games that tournaments are played in." endpoint="/admin/games" columns={columns} fields={fields} addLabel="Add game" emptyText="No games yet. Add your first game, then create tournaments for it." />;
}
