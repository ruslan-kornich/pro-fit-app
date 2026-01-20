import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Loading from '../../components/Loading';

interface OnboardingRouteProps {
  children: React.ReactNode;
}

export default function OnboardingRoute({ children }: OnboardingRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.onboarding?.is_completed) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
