import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const Ctx = createContext({ items: [], unread: 0, loaded: false, refresh: () => {}, markRead: () => {}, markAll: () => {}, remove: () => {}, clear: () => {} });
export const useNotifications = () => useContext(Ctx);

const POLL_MS = 15000;

// loads the logged-in user's notifications, keeps them fresh and pops up a toast for messages caused by someone else
export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const [state, setState] = useState({ items: [], unread: 0, loaded: false });
  const lastId = useRef(null);

  const refresh = useCallback(async (silent = true) => {
    if (!user) return;
    try {
      const d = await api.get('/notifications');
      if (lastId.current !== null && !silent) {
        d.items.filter((n) => n.id > lastId.current && !n.is_read).slice(0, 3).forEach((n) => toast.info(`${n.title}: ${n.message}`));
      }
      if (d.items.length) lastId.current = Math.max(lastId.current ?? 0, d.items[0].id); else if (lastId.current === null) lastId.current = 0;
      setState({ items: d.items, unread: d.unread, loaded: true });
    } catch { /* the bell just keeps its old content if the server is unreachable */ }
  }, [user]);

  useEffect(() => {
    lastId.current = null;
    setState({ items: [], unread: 0, loaded: false });
    if (!user) return undefined;
    refresh(true);
    const poll = setInterval(() => { if (!document.hidden) refresh(false); }, POLL_MS);
    const onFocus = () => refresh(false);
    const onChange = () => setTimeout(() => refresh(true), 500); // after the user's own change: update quietly
    window.addEventListener('focus', onFocus);
    window.addEventListener('esms-changed', onChange);
    return () => { clearInterval(poll); window.removeEventListener('focus', onFocus); window.removeEventListener('esms-changed', onChange); };
  }, [user && user.id]);

  const markRead = async (id) => {
    setState((s) => ({ ...s, items: s.items.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)), unread: Math.max(0, s.unread - (s.items.find((n) => n.id === id && !n.is_read) ? 1 : 0)) }));
    try { await api.put(`/notifications/${id}/read`); } catch { refresh(); }
  };
  const markAll = async () => {
    setState((s) => ({ ...s, items: s.items.map((n) => ({ ...n, is_read: 1 })), unread: 0 }));
    try { await api.put('/notifications/read-all'); } catch { refresh(); }
  };
  const remove = async (id) => {
    setState((s) => { const was = s.items.find((n) => n.id === id); return { ...s, items: s.items.filter((n) => n.id !== id), unread: Math.max(0, s.unread - (was && !was.is_read ? 1 : 0)) }; });
    try { await api.del(`/notifications/${id}`); } catch { refresh(); }
  };
  const clear = async () => {
    setState((s) => ({ ...s, items: [], unread: 0 }));
    try { await api.del('/notifications'); } catch { refresh(); }
  };

  return <Ctx.Provider value={{ ...state, refresh, markRead, markAll, remove, clear }}>{children}</Ctx.Provider>;
}
