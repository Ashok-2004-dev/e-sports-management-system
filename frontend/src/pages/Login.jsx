import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import PasswordInput from '../components/PasswordInput';
import AuthShell from '../components/AuthShell';
import SocialAuthButtons from '../components/SocialAuthButtons';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  useEffect(() => { api.get('/auth/setup-status').then((r) => setNeedsSetup(r.needsSetup)).catch(() => {}); }, []);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const u = await login(form.identifier, form.password); toast.success(`Welcome back, ${u.name}!`); nav(u.role === 'admin' ? '/admin' : '/player'); }
    catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  return (
    <AuthShell
      variant="player"
      tagline="Welcome back, gamer"
      subtitle="Compete in Bhutan's premier esports tournaments and climb the leaderboard."
    >
      <form onSubmit={submit} className="card-neon animate-fadeUp space-y-4 border-fuchsia-500/35 p-8">
        <div className="text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-fuchsia-400/30 bg-gradient-to-br from-fuchsia-600/30 to-violet-700/30 text-fuchsia-300 shadow-lg shadow-fuchsia-600/20">
            <Trophy size={24} />
          </span>
          <h1 className="font-game text-2xl font-bold uppercase tracking-wider">Player log in</h1>
          <p className="mt-1 text-xs text-slate-400">Enter your credentials to enter the arena</p>
        </div>
        <div>
          <label className="label">Username or email</label>
          <input
            required
            autoComplete="username"
            placeholder="e.g. sonam or player@arena.bt"
            className="input focus:border-fuchsia-400 focus:ring-fuchsia-400/15"
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <PasswordInput
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <Link to="/admin-login" className="text-xs font-medium text-slate-400 transition hover:text-fuchsia-300">
            Admin portal →
          </Link>
          <Link to="/forgot-password" className="font-semibold text-fuchsia-400 transition hover:text-fuchsia-300">
            Forgot password?
          </Link>
        </div>
        <button className="btn-primary w-full bg-gradient-to-r from-fuchsia-600 via-brand to-violet-700 py-2.5 shadow-fuchsia-600/25 hover:shadow-[0_8px_26px_rgba(192,38,211,.45)]" disabled={busy}>
          <LogIn size={16} /> {busy ? 'Signing in...' : 'Log in'}
        </button>
        <SocialAuthButtons />
        {needsSetup && <p className="rounded-lg border border-amber-500/40 bg-amber-950/40 p-3 text-center text-sm text-amber-200">No administrator exists yet. <Link to="/setup-admin" className="font-semibold underline">Run first-time admin setup</Link></p>}
        <p className="text-center text-sm text-slate-400">New here? <Link to="/signup" className="font-semibold text-fuchsia-400 hover:text-fuchsia-300">Create an account</Link></p>
      </form>
    </AuthShell>
  );
}
