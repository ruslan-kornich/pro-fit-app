import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Loading from '../../components/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.onboarding?.is_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
