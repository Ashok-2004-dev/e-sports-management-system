import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { api, saveSession } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loading } from '../components/ui';
import PasswordInput from '../components/PasswordInput';

export default function SetupAdmin() {
  const toast = useToast();
  const nav = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', setupKey: '' });
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get('/auth/setup-status').then(setStatus).catch((e) => setStatus({ error: e.message })); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (!status) return <Loading />;
  if (status.error) return <div className="card mx-auto max-w-md p-8 text-center text-red-300">{status.error}</div>;
  if (!status.needsSetup) return (
    <div className="card mx-auto max-w-md space-y-3 p-8 text-center">
      <ShieldCheck className="mx-auto text-emerald-400" size={36} />
      <h1 className="text-2xl font-bold uppercase">Setup already complete</h1>
      <p className="text-sm text-slate-400">An administrator account already exists, so this page is closed.</p>
      <Link to="/login" className="btn-primary">Go to login</Link>
    </div>
  );

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match.');
    setBusy(true);
    try {
      const { name, email, password, setupKey } = form;
      await api.post('/auth/setup-admin', { name, email, password, setupKey });
      await login(email, password);
      toast.success('Admin account created. Welcome!'); nav('/admin');
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-md">
      <form onSubmit={submit} className="card-neon animate-fadeUp space-y-4 p-8">
        <div className="text-center"><ShieldCheck className="mx-auto mb-2 text-brand-400" size={36} /><h1 className="text-3xl font-bold uppercase">First-time admin setup</h1>
          <p className="mt-1 text-sm text-slate-400">Create the one and only first administrator. This page closes automatically afterwards.</p></div>
        {!status.keyConfigured && <p className="rounded-lg border border-amber-500/40 bg-amber-950/50 p-3 text-xs text-amber-200">ADMIN_SETUP_KEY is missing in backend/.env. Add it and restart the backend.</p>}
        <div><label className="label">Full name</label><input required className="input" value={form.name} onChange={set('name')} /></div>
        <div><label className="label">Email</label><input type="email" required className="input" value={form.email} onChange={set('email')} /></div>
        <div><label className="label">Password (min 8, letters and numbers)</label><PasswordInput required minLength={8} autoComplete="new-password" value={form.password} onChange={set('password')} /></div>
        <div><label className="label">Confirm password</label><PasswordInput required autoComplete="new-password" value={form.confirm} onChange={set('confirm')} /></div>
        <div><label className="label">Setup code (ADMIN_SETUP_KEY from backend/.env)</label><PasswordInput required value={form.setupKey} onChange={set('setupKey')} /></div>
        <button className="btn-primary w-full py-2.5" disabled={busy}>{busy ? 'Creating...' : 'Create admin account'}</button>
      </form>
    </div>
  );
}
