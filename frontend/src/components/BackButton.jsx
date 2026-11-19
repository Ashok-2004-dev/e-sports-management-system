import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// NEW: accessible "Back" button so nobody depends on the browser's back button.
//   <BackButton to="/" label="Back to Home" />   always goes to that page
//   <BackButton fallback="/teams" />             goes to the previous screen; if the page was opened directly
//                                                (no history, e.g. a shared link) it goes to `fallback` instead
export default function BackButton({ to, fallback = '/', label = 'Back' }) {
  const nav = useNavigate();
  const go = () => {
    if (to) nav(to);
    else if (window.history.state && window.history.state.idx > 0) nav(-1); // react-router keeps the position in history.state.idx
    else nav(fallback, { replace: true });
  };
  return (
    <button type="button" onClick={go} className="btn-back group">
      <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" aria-hidden /> {label}
    </button>
  );
}
