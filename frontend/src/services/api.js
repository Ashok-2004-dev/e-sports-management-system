const TOKEN_KEY = 'esms_token';
const USER_KEY = 'esms_user';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const saveSession = (token, user) => { localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(USER_KEY, JSON.stringify(user)); };
export const clearSession = () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); };
export const savedUser = () => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } };

async function request(method, url, body) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body && !isForm) headers['Content-Type'] = 'application/json';
  let res;
  try {
    res = await fetch(`/api${url}`, { method, headers, body: body ? (isForm ? body : JSON.stringify(body)) : undefined });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token) window.dispatchEvent(new Event('esms-logout'));
  if (!res.ok) throw new Error(data.message || 'Something went wrong.');
  // any successful change tells the notification bell to look for new messages straight away
  if (method !== 'GET' && !url.startsWith('/notifications')) window.dispatchEvent(new Event('esms-changed'));
  return data;
}

export const api = {
  get: (u) => request('GET', u),
  post: (u, b) => request('POST', u, b || {}),
  upload: (u, file) => { const fd = new FormData(); fd.append('image', file); return request('POST', u, fd); },
  put: (u, b) => request('PUT', u, b || {}),
  del: (u) => request('DELETE', u),
};
