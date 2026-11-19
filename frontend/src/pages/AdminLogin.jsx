import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PasswordInput from '../components/PasswordInput';
import AuthShell from '../components/AuthShell';

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const u = await login(form.identifier, form.password);
      if (u.role !== 'admin') { logout(); toast.error('This account is not an administrator. Use the normal Login page.'); return; }
      toast.success('Welcome, Admin!'); nav('/admin');
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  return (
    <AuthShell
      variant="admin"
      tagline="Command centre"
      subtitle="Manage tournaments, live brackets, rosters, and championship operations."
    >
      <form onSubmit={submit} className="card-neon animate-fadeUp space-y-4 border-violet-500/50 p-8">
        <div className="text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 via-brand to-violet-700 text-white shadow-lg shadow-violet-600/30">
            <ShieldCheck size={28} />
          </span>
          <h1 className="font-game text-2xl font-bold uppercase tracking-wider">Admin login</h1>
          <p className="mt-1 text-sm text-slate-400">Authorized tournament administrators only.</p>
        </div>
        <div>
          <label className="label">Username or email</label>
          <input
            required
            autoFocus
            autoComplete="username"
            placeholder="Enter admin username or email"
            className="input focus:border-violet-400 focus:ring-violet-400/15"
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <PasswordInput
            required
            autoComplete="current-password"
            placeholder="Enter admin password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div className="text-right">
          <Link to="/admin-forgot-password" className="text-sm font-semibold text-violet-400 transition hover:text-violet-300">
            Forgot password?
          </Link>
        </div>
        <button className="btn-primary w-full bg-gradient-to-r from-violet-600 via-brand to-fuchsia-700 py-2.5 shadow-violet-600/30 hover:shadow-[0_8px_26px_rgba(124,92,255,.5)]" disabled={busy}>
          <Lock size={16} /> {busy ? 'Signing in...' : 'Log in to admin dashboard'}
        </button>
        <p className="text-center text-sm text-slate-400">Player? <Link to="/login" className="font-semibold text-fuchsia-400 hover:text-fuchsia-300">Player login</Link></p>
      </form>
    </AuthShell>
  );
}
