import { useState } from 'react';
import { Upload, Trash2, ImageIcon, Link2 } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

// choose a picture -> it is uploaded to the server and the saved path is returned through onChange
export default function ImageField({ value, onChange, uploadUrl, round = false }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [link, setLink] = useState('');
  const pick = async (e) => {
    const file = e.target.files[0]; e.target.value = '';
    if (!file) return;
    setBusy(true);
    try { const r = await api.upload(uploadUrl, file); onChange(r.url); } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  const applyLink = () => {
    const v = link.trim();
    if (!/^https?:\/\/[^\s"'<>]+$/i.test(v) || v.length > 500) return toast.error('Paste a full image link that starts with https://');
    onChange(v); setLink(''); setLinkOpen(false);
  };
  return (
    <div className="space-y-2">
    <div className="flex flex-wrap items-center gap-3">
      {value ? <img src={value} alt="" className={`h-16 w-16 object-cover ${round ? 'rounded-full' : 'rounded-lg'}`} />
        : <span className={`flex h-16 w-16 items-center justify-center border border-dashed border-ink-600 text-slate-500 ${round ? 'rounded-full' : 'rounded-lg'}`}><ImageIcon size={22} /></span>}
      <div className="flex flex-wrap gap-2">
        <label className="btn-ghost cursor-pointer text-xs"><Upload size={14} /> {busy ? 'Uploading...' : value ? 'Change image' : 'Choose image'}
          <input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={pick} disabled={busy} /></label>
        <button type="button" className="btn-ghost text-xs" onClick={() => setLinkOpen(!linkOpen)}><Link2 size={14} /> Use image link</button>
        {value && <button type="button" className="btn-ghost text-xs" onClick={() => onChange('')}><Trash2 size={14} /> Remove</button>}
      </div>
      <p className="text-xs text-slate-500">JPG, PNG or WEBP, max 3 MB</p>
    </div>
    {linkOpen && (
      <div className="flex gap-2">
        <input className="input" placeholder="https://example.com/game-photo.jpg" value={link} onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyLink(); } }} />
        <button type="button" className="btn-primary shrink-0" onClick={applyLink}>Use</button>
      </div>
    )}
    </div>
  );
}
