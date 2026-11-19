import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PasswordInput from '../components/PasswordInput';
import SocialAuthButtons from '../components/SocialAuthButtons';

const DZONGKHAGS = ['Bumthang', 'Chukha', 'Dagana', 'Gasa', 'Haa', 'Lhuentse', 'Mongar', 'Paro', 'Pemagatshel', 'Punakha', 'Samdrup Jongkhar', 'Samtse', 'Sarpang', 'Thimphu', 'Trashigang', 'Trashiyangtse', 'Trongsa', 'Tsirang', 'Wangdue Phodrang', 'Zhemgang'];
const PHONE_RE = /^(?:\+?975)?(?:17|77)\d{6}$|^\+?[0-9]{7,15}$/;

export default function Register() {
  const { register, verifyRegistration } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', dzongkhag: '', contact_no: '' });
  const [busy, setBusy] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState('register');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const cleanedPhone = form.contact_no.replace(/[\s-]/g, '');
    if (!PHONE_RE.test(cleanedPhone)) {
      toast.error('Please enter a valid phone number (e.g., 17XXXXXX or 77XXXXXX).');
      return;
    }
    setBusy(true);
    try {
      const result = await register({ ...form, contact_no: cleanedPhone });
      setPendingEmail(result.email || form.email.trim().toLowerCase());
      setStage('otp');
      toast.success(result.message || 'Verification code sent.');
      if (result.devCode) toast.info(`Development OTP: ${result.devCode}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) { toast.error('Enter the six-digit code.'); return; }
    setBusy(true);
    try {
      await verifyRegistration(pendingEmail, otp);
      toast.success('Email verified. Welcome!');
      nav('/player');
    } catch (err) {
      toast.error(err.message);
    } finally { setBusy(false); }
  };

  const resend = async () => {
    setBusy(true);
    try {
      const result = await (await import('../services/api')).api.post('/auth/resend-registration-otp', { email: pendingEmail });
      toast.success(result.message);
      if (result.devCode) toast.info(`Development OTP: ${result.devCode}`);
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-xl">
      {stage === 'register' ? (
        <form onSubmit={submit} className="card-neon animate-fadeUp grid gap-4 p-8 sm:grid-cols-2">
          <h1 className="text-center font-game text-2xl font-bold uppercase tracking-wider sm:col-span-2">Sign up as a player</h1>
          <div><label className="label">Full name</label><input required minLength={2} className="input" value={form.name} onChange={set('name')} /></div>
          <div><label className="label">Email</label><input type="email" required className="input" value={form.email} onChange={set('email')} /></div>
          <div><label className="label">Password (min 6 characters)</label><PasswordInput required minLength={6} autoComplete="new-password" value={form.password} onChange={set('password')} /></div>
          <div><label className="label">Dzongkhag</label>
            <select className="input" value={form.dzongkhag} onChange={set('dzongkhag')}><option value="">Select...</option>{DZONGKHAGS.map((d) => <option key={d}>{d}</option>)}</select></div>
          <div className="sm:col-span-2">
            <label className="label">Phone number</label>
            <input type="tel" required placeholder="e.g. 17123456" className="input" value={form.contact_no} onChange={set('contact_no')} />
          </div>
          <button className="btn-primary w-full py-2.5 sm:col-span-2" disabled={busy}><UserPlus size={16} /> {busy ? 'Sending code...' : 'Continue with email verification'}</button>
          <div className="sm:col-span-2"><SocialAuthButtons /></div>
          <p className="text-center text-sm text-slate-400 sm:col-span-2">Already have an account? <Link to="/login" className="font-semibold text-brand-400">Log in</Link></p>
        </form>
      ) : (
        <form onSubmit={verify} className="card-neon animate-fadeUp grid gap-4 p-8">
          <h1 className="text-center font-game text-2xl font-bold uppercase tracking-wider">Verify your email</h1>
          <p className="text-center text-sm text-slate-400">We sent a six-digit code to <strong>{pendingEmail}</strong>. The code expires in five minutes.</p>
          <div><label className="label">Six-digit OTP</label><input required inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" className="input text-center text-2xl tracking-[0.5em]" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} /></div>
          <button className="btn-primary w-full py-2.5" disabled={busy}>{busy ? 'Verifying...' : 'Verify and create account'}</button>
          <button type="button" className="w-full text-sm font-semibold text-brand-400" disabled={busy} onClick={resend}>Resend verification code</button>
          <button type="button" className="w-full text-sm text-slate-400" disabled={busy} onClick={() => { setStage('register'); setOtp(''); }}>Back to registration</button>
        </form>
      )}
    </div>
  );
}
