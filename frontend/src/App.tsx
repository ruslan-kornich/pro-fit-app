import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './features/auth/AuthContext';
import { useLanguageSync } from './i18n/useLanguageSync';
import ProtectedRoute from './features/auth/ProtectedRoute';
import OnboardingRoute from './features/auth/OnboardingRoute';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import AddFoodPage from './pages/AddFoodPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import RecommendationsPage from './pages/RecommendationsPage';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  useLanguageSync();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
        />
      </Route>

      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <OnboardingPage />
          </OnboardingRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/add" element={<AddFoodPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
