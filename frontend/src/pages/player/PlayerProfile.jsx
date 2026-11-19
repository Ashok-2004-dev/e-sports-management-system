import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Loading, PageHeader } from '../../components/ui';
import ImageField from '../../components/ImageField';

const PHONE_RE = /^(?:\+?975)?(?:17|77)\d{6}$|^\+?[0-9]{7,15}$/;

export default function PlayerProfile() {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get('/player/profile').then((p) => setForm(Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v ?? ''])))).catch((e) => toast.error(e.message)); }, []);
  if (!form) return <Loading />;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const cleanedPhone = String(form.contact_no || '').replace(/[\s-]/g, '');
    if (cleanedPhone && !PHONE_RE.test(cleanedPhone)) {
      toast.error('Please enter a valid phone number.');
      return;
    }
    setBusy(true);
    try {
      const r = await api.put('/player/profile', { ...form, contact_no: cleanedPhone });
      const u = JSON.parse(localStorage.getItem('esms_user')); u.name = form.name; localStorage.setItem('esms_user', JSON.stringify(u));
      toast.success(r.message);
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader title="My profile" subtitle="Keep your player details up to date." />
      <form onSubmit={save} className="card grid max-w-2xl gap-4 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="label">Profile photo</label><ImageField value={form.avatar_url} uploadUrl="/player/upload" round onChange={(url) => setForm({ ...form, avatar_url: url })} /></div>
        <div><label className="label">Full name</label><input required className="input" value={form.name} onChange={set('name')} /></div>
        <div><label className="label">Email (cannot be changed)</label><input disabled className="input opacity-60" value={form.email} /></div>
        <div><label className="label">Dzongkhag</label><input className="input" value={form.dzongkhag} onChange={set('dzongkhag')} /></div>
        <div><label className="label">Phone number</label><input type="tel" className="input" placeholder="e.g. 17123456" value={form.contact_no} onChange={set('contact_no')} /></div>
        <div className="sm:col-span-2"><button className="btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save changes'}</button></div>
      </form>
    </div>
  );
}
