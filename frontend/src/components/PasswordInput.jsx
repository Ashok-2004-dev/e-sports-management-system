import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// a password box with an eye button that shows / hides what is typed
export default function PasswordInput({ value, onChange, className = '', ...rest }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...rest} type={show ? 'text' : 'password'} value={value} onChange={onChange} className={`input pr-11 ${className}`} />
      <button type="button" onClick={() => setShow((s) => !s)} tabIndex={-1}
        title={show ? 'Hide password' : 'Show password'} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-ink-700 hover:text-cyan-300">
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
