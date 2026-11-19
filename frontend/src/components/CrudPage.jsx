import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { PageHeader, Loading, Empty, Modal } from './ui';
import ImageField from './ImageField';

// turns a database value into something an <input> can show
const toInput = (f, v) => {
  if (v === null || v === undefined) return '';
  if (f.type === 'datetime-local') return String(v).replace(' ', 'T').slice(0, 16);
  if (f.type === 'date') return String(v).slice(0, 10);
  return v;
};

/* A reusable admin table with search, add, edit and delete.
   columns: [{ key, label, render? }]   fields: [{ name, label, type, options, full, required }] */
export default function CrudPage({ title, subtitle, endpoint, columns, fields, canCreate = true, canEdit = true, canDelete = true, rowActions, refreshKey = 0, addLabel = 'Add new', emptyText = 'No records found.', notice }) {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null); // 'new' or the row being edited
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => api.get(`${endpoint}?search=${encodeURIComponent(q)}`).then(setRows).catch((e) => toast.error(e.message));
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q, endpoint, refreshKey]);

  const openNew = () => { setForm(Object.fromEntries(fields.map((f) => [f.name, f.default ?? '']))); setEditing('new'); };
  const openEdit = (row) => { setForm(Object.fromEntries(fields.map((f) => [f.name, toInput(f, row[f.name])]))); setEditing(row); };

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = editing === 'new' ? await api.post(endpoint, form) : await api.put(`${endpoint}/${editing.id}`, form);
      toast.success(res.message); setEditing(null); load();
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };
  const remove = async (row) => {
    if (!window.confirm('Delete this record? This cannot be undone.')) return;
    try { const res = await api.del(`${endpoint}/${row.id}`); toast.success(res.message); load(); } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle}>
        {canCreate && <button className="btn-primary" onClick={openNew}><Plus size={16} /> {addLabel}</button>}
      </PageHeader>
      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className="input pl-9" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {notice}
      {!rows ? <Loading /> : !rows.length ? <Empty title={q ? 'No results' : 'No records yet'} text={q ? 'Nothing matches your search.' : emptyText} /> : (
        <div className="card overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/[0.06] bg-white/[0.03] text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>{columns.map((c) => <th key={c.key} className="px-4 py-3">{c.label}</th>)}<th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-white/[0.05] transition last:border-0 hover:bg-white/[0.04]">
                  {columns.map((c) => <td key={c.key} className="px-4 py-3">{c.render ? c.render(row) : row[c.key] ?? '-'}</td>)}
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {rowActions && rowActions(row, load)}
                      {canEdit && <button title="Edit" onClick={() => openEdit(row)} className="rounded p-2 text-slate-300 hover:bg-ink-600"><Pencil size={15} /></button>}
                      {canDelete && <button title="Delete" onClick={() => remove(row)} className="rounded p-2 text-red-400 hover:bg-red-500/10"><Trash2 size={15} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <Modal title={editing === 'new' ? addLabel : 'Edit record'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.full ? 'sm:col-span-2' : ''}>
                <label className="label">{f.label}</label>
                {f.type === 'image' ? (
                  <ImageField value={form[f.name]} uploadUrl="/admin/upload" round={f.round} onChange={(url) => setForm({ ...form, [f.name]: url })} />
                ) : f.type === 'textarea' ? (
                  <textarea rows={3} className="input" value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
                ) : f.type === 'select' ? (
                  <select className="input" required={f.required} value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}>
                    <option value="">Select...</option>
                    {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input className="input" type={f.type || 'text'} required={f.required} min={f.type === 'number' ? 0 : undefined}
                    value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
                )}
              </div>
            ))}
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
