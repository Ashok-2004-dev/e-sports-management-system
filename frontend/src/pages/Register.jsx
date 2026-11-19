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
  const { register } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', dzongkhag: '', contact_no: '' });
  const [busy, setBusy] = useState(false);
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
      await register({ ...form, contact_no: cleanedPhone });
      toast.success('Account created. Welcome!');
      nav('/player');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <form onSubmit={submit} className="card-neon animate-fadeUp grid gap-4 p-8 sm:grid-cols-2">
        <h1 className="text-center font-game text-2xl font-bold uppercase tracking-wider sm:col-span-2">Sign up as a player</h1>
        <div><label className="label">Full name</label><input required className="input" value={form.name} onChange={set('name')} /></div>
        <div><label className="label">Email</label><input type="email" required className="input" value={form.email} onChange={set('email')} /></div>
        <div><label className="label">Password (min 6 characters)</label><PasswordInput required minLength={6} autoComplete="new-password" value={form.password} onChange={set('password')} /></div>
        <div><label className="label">Dzongkhag</label>
          <select className="input" value={form.dzongkhag} onChange={set('dzongkhag')}><option value="">Select...</option>{DZONGKHAGS.map((d) => <option key={d}>{d}</option>)}</select></div>
        <div className="sm:col-span-2">
          <label className="label">Phone number</label>
          <input type="tel" required placeholder="e.g. 17123456" className="input" value={form.contact_no} onChange={set('contact_no')} />
        </div>
        <button className="btn-primary w-full py-2.5 sm:col-span-2" disabled={busy}><UserPlus size={16} /> {busy ? 'Creating...' : 'Sign up'}</button>
        <div className="sm:col-span-2"><SocialAuthButtons /></div>
        <p className="text-center text-sm text-slate-400 sm:col-span-2">Already have an account? <Link to="/login" className="font-semibold text-brand-400">Log in</Link></p>
      </form>
    </div>
  );
}
