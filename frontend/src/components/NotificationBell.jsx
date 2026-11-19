import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { kindOf, timeAgo } from '../services/notificationUi.jsx';

// bell with unread badge and a drop-down list of the latest messages
export default function NotificationBell() {
  const { user } = useAuth();
  const { items, unread, markRead, markAll, remove } = useNotifications();
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const nav = useNavigate();
  const page = user.role === 'admin' ? '/admin/notifications' : '/player/notifications';

  useEffect(() => {
    const close = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, []);

  const go = (n) => { markRead(n.id); setOpen(false); if (n.link) nav(n.link); };

  return (
    <div className="relative" ref={box}>
      <button onClick={() => setOpen(!open)} aria-label="Notifications" title="Notifications"
        className={`relative rounded-xl border border-ink-600 bg-ink-800/80 p-2.5 text-slate-200 transition hover:border-cyan-400/60 hover:text-cyan-300 ${unread ? 'shadow-[0_0_14px_rgba(34,211,238,.35)]' : ''}`}>
        <Bell size={20} className={unread ? 'animate-ring' : ''} />
        {unread > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-1 text-[11px] font-bold text-white shadow-lg">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="animate-fadeUp absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-cyan-400/30 bg-ink-900 shadow-2xl shadow-black/60 backdrop-blur">
          <div className="flex items-center justify-between border-b border-ink-600 px-4 py-3">
            <p className="font-display text-lg font-bold uppercase tracking-wider text-white">Notifications {unread > 0 && <span className="ml-1 text-sm text-cyan-300">({unread} new)</span>}</p>
            {unread > 0 && <button onClick={markAll} className="flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-white"><CheckCheck size={14} /> Mark all read</button>}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {!items.length && <p className="px-4 py-10 text-center text-sm text-slate-400">You are all caught up. Changes will appear here.</p>}
            {items.slice(0, 8).map((n) => {
              const k = kindOf(n.type);
              return (
                <div key={n.id} className={`group flex gap-3 border-b border-ink-700 px-4 py-3 last:border-0 hover:bg-ink-700/50 ${n.is_read ? '' : 'bg-cyan-500/5'}`}>
                  <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${k.cls}`}><k.icon size={17} /></span>
                  <button onClick={() => go(n)} className="min-w-0 flex-1 text-left">
                    <p className={`truncate text-sm ${n.is_read ? 'font-medium text-slate-300' : 'font-bold text-white'}`}>{n.title}</p>
                    <p className="line-clamp-2 text-xs text-slate-400">{n.message}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{timeAgo(n.created_at)}</p>
                  </button>
                  {!n.is_read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />}
                  <button onClick={() => remove(n.id)} title="Remove" className="shrink-0 self-start rounded p-1 text-slate-500 opacity-0 transition hover:text-red-400 group-hover:opacity-100"><X size={14} /></button>
                </div>
              );
            })}
          </div>
          <Link to={page} onClick={() => setOpen(false)} className="block border-t border-ink-600 py-3 text-center text-sm font-semibold text-cyan-300 hover:bg-ink-700/60 hover:text-white">View all notifications</Link>
        </div>
      )}
    </div>
  );
}
