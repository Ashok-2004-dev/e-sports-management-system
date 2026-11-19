import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function SocialAuthButtons() {
  const { socialLogin } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [busy, setBusy] = useState(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const fbAppId = import.meta.env.VITE_FACEBOOK_APP_ID;

  useEffect(() => {
    if (fbAppId && window.FB) {
      window.FB.init({ appId: fbAppId, cookie: true, xfbml: false, version: 'v21.0' });
    }
  }, [fbAppId]);

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

  const loginWithGoogle = () => {
    if (!googleClientId) {
      toast.error('Gmail login requires VITE_GOOGLE_CLIENT_ID in frontend/.env.');
      return;
    }
    if (!window.google?.accounts?.id) {
      toast.error('Google Sign-In is still loading. Please try again in a second.');
      return;
    }
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response) => {
        if (response.credential) handleSuccess('google', { credential: response.credential });
      },
    });
    window.google.accounts.id.prompt();
  };

  const loginWithFacebook = () => {
    if (!fbAppId) {
      toast.error('Facebook login requires VITE_FACEBOOK_APP_ID in frontend/.env.');
      return;
    }
    if (!window.FB) {
      toast.error('Facebook SDK is still loading. Please try again in a second.');
      return;
    }
    window.FB.login(
      (res) => {
        if (res.authResponse?.accessToken) {
          handleSuccess('facebook', { accessToken: res.authResponse.accessToken });
        } else {
          toast.error('Facebook login was cancelled.');
        }
      },
      { scope: 'email,public_profile' }
    );
  };

  return (
    <div className="space-y-3">
      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-white/10" />
        <span className="mx-3 font-game text-xs uppercase tracking-widest text-slate-400">Or continue with</span>
        <div className="flex-grow border-t border-white/10" />
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          onClick={loginWithGoogle}
          disabled={!!busy}
          className="btn-ghost flex w-full items-center justify-center gap-2.5 py-2.5"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z" />
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.5H12v4.8h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
            <path fill="#FBBC05" d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z" />
            <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 21.1 7.4 24 12 24z" />
          </svg>
          <span>{busy === 'google' ? 'Connecting...' : 'Continue with Gmail'}</span>
        </button>

        <button
          type="button"
          onClick={loginWithFacebook}
          disabled={!!busy}
          className="btn-ghost flex w-full items-center justify-center gap-2.5 py-2.5"
        >
          <svg className="h-4 w-4 shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span>{busy === 'facebook' ? 'Connecting...' : 'Continue with Facebook'}</span>
        </button>
      </div>
    </div>
  );
}
