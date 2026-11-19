import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import PasswordInput from '../components/PasswordInput';
import AuthShell from '../components/AuthShell';

// Used for both accounts: <ForgotPassword scope="player" /> and <ForgotPassword scope="admin" />
export default function ForgotPassword({ scope = 'player' }) {
  const admin = scope === 'admin';
  const toast = useToast();
  const nav = useNavigate();
  const loginPath = admin ? '/admin-login' : '/login';
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ identifier: '', code: '', password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const sendCode = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const r = await api.post('/auth/forgot-password', { identifier: form.identifier, scope }); toast.success(r.message); if (r.devCode) setForm((prev) => ({ ...prev, code: r.devCode })); setStep(2); }
    catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  const reset = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('The two passwords do not match.');
    setBusy(true);
    try { const r = await api.post('/auth/reset-password', { identifier: form.identifier, scope, code: form.code, password: form.password }); toast.success(r.message); nav(loginPath); }
    catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  return (
    <AuthShell variant={admin ? 'admin' : 'player'} tagline={admin ? 'Command centre' : 'Back in the game'}>
      <form onSubmit={step === 1 ? sendCode : reset} className={`card-neon animate-fadeUp space-y-4 p-8 ${admin ? 'border-violet-500/50' : ''}`}>
        <div className="text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-violet-600 text-white">{admin ? <ShieldCheck size={28} /> : <KeyRound size={28} />}</span>
          <h1 className="font-game text-2xl font-bold uppercase tracking-wider">{admin ? 'Admin password reset' : 'Forgot password'}</h1>
          <p className="mt-1 text-sm text-slate-400">{step === 1 ? 'Enter your username or email and we will send a 6-digit code.' : 'Enter the code and choose a new password.'}</p>
        </div>
        <div><label className="label">{admin ? 'Username or email' : 'Username or email'}</label>
          <input required autoFocus={step === 1} readOnly={step === 2} className="input" value={form.identifier} onChange={set('identifier')} /></div>
        {step === 2 && (<>
          <div><label className="label">6-digit code</label><input required autoFocus inputMode="numeric" maxLength={6} pattern="\d{6}" className="input tracking-[0.5em]" value={form.code} onChange={set('code')} /></div>
          <div><label className="label">New password</label><PasswordInput required autoComplete="new-password" value={form.password} onChange={set('password')} /></div>
          <div><label className="label">Confirm new password</label><PasswordInput required autoComplete="new-password" value={form.confirm} onChange={set('confirm')} /></div>
          <p className="text-xs text-slate-500">{admin ? 'At least 8 characters, with letters and numbers.' : 'At least 6 characters.'}</p>
        </>)}
        <button className="btn-primary w-full py-2.5" disabled={busy}>{busy ? 'Please wait...' : step === 1 ? 'Send reset code' : 'Reset password'}</button>
        {step === 2 && <button type="button" className="btn-ghost w-full" onClick={() => setStep(1)}>Send a new code</button>}
        <p className="text-center text-sm text-slate-400">Remembered it? <Link to={loginPath} className="font-semibold text-brand-400">Back to log in</Link></p>
      </form>
    </AuthShell>
  );
}
