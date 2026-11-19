import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';

export default function PublicLayout() {
  const { pathname } = useLocation();
  const wide = pathname === '/'; // the home page draws its own full-width sections
  const depth = pathname.split('/').filter(Boolean).length; // 0 = home, 1 = /teams, 2 = /teams/3

  // NEW: every page change starts at the top (smooth, see html { scroll-behavior } in index.css)
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className={`flex-1 ${wide ? '' : 'mx-auto w-full max-w-7xl px-4 py-8 md:py-10'}`}>
        {/* NEW: automatic Back button on every page except Home.
            Top-level pages (/live, /teams ...) go straight to Home; detail pages (/live/3, /teams/3) go to the previous screen. */}
        {!wide && (
          <div className="mb-5">
            {depth <= 1 ? <BackButton to="/" label="Back to Home" /> : <BackButton fallback={`/${pathname.split('/')[1]}`} label="Back" />}
          </div>
        )}
        {/* NEW: page transition. Keying by pathname re-mounts this wrapper on navigation, which replays the fade-in. */}
        <div key={pathname} className="animate-pageIn"><Outlet /></div>
      </main>
      <Footer />
    </div>
  );
}
