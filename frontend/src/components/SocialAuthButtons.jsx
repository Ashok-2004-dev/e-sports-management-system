import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const fbAppId = import.meta.env.VITE_FACEBOOK_APP_ID;

// adds an external script once and resolves when it has loaded
const loaded = {};
const loadScript = (src) => {
  loaded[src] ||= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = resolve;
    s.onerror = () => { delete loaded[src]; s.remove(); reject(new Error('Could not load ' + src)); };
    document.head.appendChild(s);
  });
  return loaded[src];
};

export default function SocialAuthButtons() {
  const { socialLogin } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [busy, setBusy] = useState(null);
  const [fbReady, setFbReady] = useState(false);
  const googleBox = useRef(null);
  const [light, setLight] = useState(() => document.documentElement.classList.contains('light'));
  useEffect(() => {
    const sync = () => setLight(document.documentElement.classList.contains('light'));
    window.addEventListener('esms-theme', sync);
    return () => window.removeEventListener('esms-theme', sync);
  }, []);

  const handleSuccess = async (provider, payload) => {
    setBusy(provider);
    try {
      const u = await socialLogin(provider, payload);
      toast.success(`Welcome, ${u.name}!`);
      nav('/player');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  };
  const latest = useRef(handleSuccess);
  latest.current = handleSuccess;

  // Google draws its own official button (more reliable than the One Tap pop-up)
  useEffect(() => {
    if (!googleClientId) return undefined;
    let alive = true;
    loadScript('https://accounts.google.com/gsi/client').then(() => {
      if (!alive || !googleBox.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (r) => r.credential && latest.current('google', { credential: r.credential }),
      });
      googleBox.current.replaceChildren(); // redraw after a theme change
      window.google.accounts.id.renderButton(googleBox.current, {
        theme: light ? 'outline' : 'filled_black', size: 'large', text: 'continue_with', width: Math.min(googleBox.current.offsetWidth || 300, 400),
      });
    }).catch(() => toast.error('Google Sign-In could not load. Check your internet connection or ad blocker.'));
    return () => { alive = false; };
  }, [light]);

  // Facebook: load and initialise the SDK before the button is clicked, so the pop-up is not blocked
  useEffect(() => {
    if (!fbAppId) return undefined;
    let alive = true;
    loadScript('https://connect.facebook.net/en_US/sdk.js').then(() => {
      window.FB.init({ appId: fbAppId, cookie: true, xfbml: false, version: 'v22.0' });
      if (alive) setFbReady(true);
    }).catch(() => toast.error('Facebook login could not load. Check your internet connection or ad blocker.'));
    return () => { alive = false; };
  }, []);

  const loginWithFacebook = () => {
    if (!fbAppId) { toast.error('Facebook login requires VITE_FACEBOOK_APP_ID in frontend/.env.'); return; }
    if (!fbReady) { toast.error('Facebook is still loading. Please try again in a second.'); return; }
    window.FB.login(
      (res) => {
        if (res.authResponse?.accessToken) handleSuccess('facebook', { accessToken: res.authResponse.accessToken });
        else toast.error('Facebook login was cancelled.');
      },
      { scope: 'email,public_profile' }
    );
  };

  return (
    <div className="space-y-3">
      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-fg/10" />
        <span className="mx-3 font-game text-xs uppercase tracking-widest text-slate-400">Or continue with</span>
        <div className="flex-grow border-t border-fg/10" />
      </div>

      {googleClientId ? (
        <div ref={googleBox} className="flex min-h-[44px] w-full justify-center" />
      ) : (
        <button type="button" className="btn-ghost w-full py-2.5" onClick={() => toast.error('Google login requires VITE_GOOGLE_CLIENT_ID in frontend/.env.')}>
          Continue with Google
        </button>
      )}

      <button type="button" onClick={loginWithFacebook} disabled={!!busy} className="btn-ghost w-full py-2.5">
        <svg className="h-4 w-4 shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        <span>{busy === 'facebook' ? 'Connecting...' : 'Continue with Facebook'}</span>
      </button>
      {busy === 'google' && <p className="text-center text-sm text-slate-400" role="status">Connecting to Google...</p>}
    </div>
  );
}
