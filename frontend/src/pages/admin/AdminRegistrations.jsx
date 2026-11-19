import { Check, X } from 'lucide-react';
import CrudPage from '../../components/CrudPage';
import { StatusBadge } from '../../components/ui';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { fmtDateTime } from '../../services/format';

export default function AdminRegistrations() {
  const toast = useToast();
  const columns = [
    { key: 'name', label: 'Player', render: (r) => <span>{r.name}<span className="block text-xs text-slate-500">{r.email}</span></span> }, { key: 'tournament', label: 'Tournament' }, { key: 'team', label: 'Team' },
    { key: 'registered_at', label: 'Registered', render: (r) => fmtDateTime(r.registered_at) }, { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];
  const actions = (row, reload) => {
    const set = async (status) => { try { const r = await api.put(`/admin/registrations/${row.id}`, { status }); toast.success(r.message); reload(); } catch (e) { toast.error(e.message); } };
    return (<>
      {row.status !== 'approved' && <button title="Approve" onClick={() => set('approved')} className="rounded p-2 text-emerald-400 hover:bg-emerald-500/10"><Check size={16} /></button>}
      {row.status !== 'rejected' && <button title="Reject" onClick={() => set('rejected')} className="rounded p-2 text-red-400 hover:bg-red-500/10"><X size={16} /></button>}
    </>);
  };
  return <CrudPage title="Registrations" subtitle="Approve or reject tournament registrations." endpoint="/admin/registrations" columns={columns} fields={[]} canCreate={false} canEdit={false} canDelete={false} rowActions={actions} />;
}
