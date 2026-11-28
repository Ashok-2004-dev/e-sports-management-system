import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { Empty, Loading, PageHeader } from '../components/ui';
import { kindOf, timeAgo } from '../services/notificationUi.jsx';
import { fmtDateTime } from '../services/format';

// full notification list, shared by the Admin and the Player dashboard
export default function Notifications() {
  const { items, unread, loaded, markRead, markAll, remove, clear } = useNotifications();
  const [tab, setTab] = useState('all');
  const nav = useNavigate();
  if (!loaded) return <Loading />;
  const list = tab === 'unread' ? items.filter((n) => !n.is_read) : items;
  const pill = (on) => `rounded-md px-4 py-2 text-sm font-semibold transition ${on ? 'bg-gradient-to-r from-brand to-violet-600 text-white' : 'text-slate-400 hover:text-fg'}`;

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Every change made on the platform that concerns you is listed here.">
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" disabled={!unread} onClick={markAll}><CheckCheck size={16} /> Mark all read</button>
          <button className="btn-ghost" disabled={!items.length} onClick={() => window.confirm('Remove all notifications?') && clear()}><Trash2 size={16} /> Clear all</button>
        </div>
      </PageHeader>
      <div className="mb-5 inline-flex rounded-lg border border-ink-600 bg-ink-900 p-1">
        <button className={pill(tab === 'all')} onClick={() => setTab('all')}>All ({items.length})</button>
        <button className={pill(tab === 'unread')} onClick={() => setTab('unread')}>Unread ({unread})</button>
      </div>
      {!list.length ? <Empty title={tab === 'unread' ? 'No unread notifications' : 'No notifications yet'} text="New registrations, approvals, tournaments, matches and results will show up here as they happen." action={<Bell className="text-cyan-300" />} /> : (
        <div className="card divide-y divide-ink-700 overflow-hidden">
          {list.map((n) => {
            const k = kindOf(n.type);
            return (
              <div key={n.id} className={`flex items-start gap-4 p-4 transition hover:bg-ink-700/40 ${n.is_read ? '' : 'bg-cyan-500/5'}`}>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${k.cls}`}><k.icon size={20} /></span>
                <button className="min-w-0 flex-1 text-left" onClick={() => { markRead(n.id); if (n.link) nav(n.link); }}>
                  <p className={`flex items-center gap-2 ${n.is_read ? 'font-medium text-slate-300' : 'font-bold text-fg'}`}>{n.title}{!n.is_read && <span className="h-2 w-2 rounded-full bg-cyan-400" />}</p>
                  <p className="text-sm text-slate-400">{n.message}</p>
                  <p className="mt-1 text-xs text-slate-500">{timeAgo(n.created_at)} - {fmtDateTime(n.created_at)}</p>
                </button>
                <button title="Remove" onClick={() => remove(n.id)} className="rounded p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"><X size={16} /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
