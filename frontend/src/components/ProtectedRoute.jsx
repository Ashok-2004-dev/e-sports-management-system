import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// only lets the given role in; everyone else is redirected
export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/player'} replace />;
  return children;
}
