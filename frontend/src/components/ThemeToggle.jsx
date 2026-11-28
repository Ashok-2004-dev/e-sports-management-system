import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

// dark / light switch. The choice is remembered in this browser.
export default function ThemeToggle({ className = '' }) {
  const [light, setLight] = useState(() => document.documentElement.classList.contains('light'));
  useEffect(() => {
    const sync = () => setLight(document.documentElement.classList.contains('light'));
    window.addEventListener('esms-theme', sync); // keeps two toggles on screen in step
    return () => window.removeEventListener('esms-theme', sync);
  }, []);

  const toggle = () => {
    document.documentElement.classList.toggle('light', !light);
    try { localStorage.setItem('esms_theme', light ? 'dark' : 'light'); } catch { /* storage blocked: theme still changes */ }
    window.dispatchEvent(new Event('esms-theme'));
  };
  const label = light ? 'Switch to dark mode' : 'Switch to light mode';
  return (
    <button type="button" onClick={toggle} aria-label={label} title={label}
      className={`shrink-0 rounded border border-ink-600 bg-ink-800/80 p-2.5 text-slate-200 transition hover:border-cyan-400/60 ${className}`}>
      {light ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
