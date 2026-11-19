import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

// LIVE GAMES: one shared, auto-refreshing list of the matches being played right now.
// The navbar LIVE button, the home page and the Live Games page all read from here, so the site only asks the server once per refresh.
const LiveContext = createContext({ matches: [], count: 0, loading: true, error: '' });
export const useLive = () => useContext(LiveContext);

const REFRESH_MS = 15000;

export function LiveProvider({ children }) {
  const [state, setState] = useState({ matches: [], loading: true, error: '' });

  useEffect(() => {
    let alive = true;
    const pull = async () => {
      if (document.hidden) return; // don't poll in a background tab
      try {
        const matches = await api.get('/matches?status=live');
        if (alive) setState({ matches, loading: false, error: '' });
      } catch (e) {
        if (alive) setState((s) => ({ ...s, loading: false, error: e.message }));
      }
    };
    pull();
    const timer = setInterval(pull, REFRESH_MS);
    const onVisible = () => { if (!document.hidden) pull(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('esms-changed', pull); // fired by api.js after any admin change, so a new live match shows up straight away
    return () => { alive = false; clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); window.removeEventListener('esms-changed', pull); };
  }, []);

  return <LiveContext.Provider value={{ ...state, count: state.matches.length }}>{children}</LiveContext.Provider>;
}
