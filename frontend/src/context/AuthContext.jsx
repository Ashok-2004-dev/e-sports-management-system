import { createContext, useContext, useEffect, useState } from 'react';
import { api, saveSession, clearSession, savedUser, getToken } from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(savedUser());

  const logout = () => { clearSession(); setUser(null); };

  // confirm the saved token is still valid when the app opens
  useEffect(() => {
    if (getToken()) api.get('/auth/me').catch(() => {});
    window.addEventListener('esms-logout', logout);
    return () => window.removeEventListener('esms-logout', logout);
  }, []);

  const login = async (identifier, password) => {
    const data = await api.post('/auth/login', { identifier, password });
    saveSession(data.token, data.user); setUser(data.user);
    return data.user;
  };
  const register = async (form) => {
    const data = await api.post('/auth/register', form);
    saveSession(data.token, data.user); setUser(data.user);
    return data.user;
  };
  const socialLogin = async (provider, payload) => {
    const data = await api.post('/auth/social', { provider, ...payload });
    saveSession(data.token, data.user); setUser(data.user);
    return data.user;
  };

  return <AuthContext.Provider value={{ user, login, register, socialLogin, logout }}>{children}</AuthContext.Provider>;
}
