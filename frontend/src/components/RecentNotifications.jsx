import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { kindOf, timeAgo } from '../services/notificationUi.jsx';

// panel for the dashboard home pages: the latest changes at a glance
export default function RecentNotifications({ title = 'Latest notifications' }) {
  const { user } = useAuth();
  const { items, unread, loaded } = useNotifications();
  const page = user.role === 'admin' ? '/admin/notifications' : '/player/notifications';
  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-2xl font-bold uppercase"><Bell size={22} className="text-cyan-300" /> {title} {unread > 0 && <span className="rounded-full bg-pink-500 px-2 py-0.5 text-xs font-bold text-white">{unread} new</span>}</h3>
        <Link to={page} className="text-sm font-semibold text-brand-400 hover:text-white">View all</Link>
      </div>
      {!loaded ? <p className="text-sm text-slate-500">Loading...</p> : !items.length ? <p className="text-sm text-slate-400">No notifications yet. Changes made on the platform will appear here.</p> : (
        <ul className="divide-y divide-ink-700">
          {items.slice(0, 5).map((n) => {
            const k = kindOf(n.type);
            return (
              <li key={n.id}>
                <Link to={n.link || page} className="flex items-center gap-3 py-3 hover:opacity-90">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${k.cls}`}><k.icon size={17} /></span>
                  <span className="min-w-0 flex-1"><span className={`block truncate text-sm ${n.is_read ? 'text-slate-300' : 'font-bold text-white'}`}>{n.title}</span><span className="block truncate text-xs text-slate-400">{n.message}</span></span>
                  <span className="shrink-0 text-xs text-slate-500">{timeAgo(n.created_at)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
