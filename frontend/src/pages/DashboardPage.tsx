import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useDailyStats } from '../hooks/useDailyStats';
import CalorieProgress from '../features/dashboard/CalorieProgress';
import MacroCard from '../features/dashboard/MacroCard';
import Card from '../components/Card';
import Loading from '../components/Loading';
import { getFoodEntries } from '../api/food';
import type { FoodEntry } from '../types/food';
import { formatTime } from '../utils/formatters';

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, loading: statsLoading } = useDailyStats();
  const [lastEntry, setLastEntry] = useState<FoodEntry | null>(null);

  useEffect(() => {
    const loadLastEntry = async () => {
      try {
        const response = await getFoodEntries({ page_size: 1 });
        if (response.entries.length > 0) {
          setLastEntry(response.entries[0]);
        }
      } catch {
        // Silently fail
      }
    };
    loadLastEntry();
  }, []);

  const calorieGoal = user?.daily_calorie_norm || 2000;

  if (statsLoading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.name || 'User'}
          </h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Today</p>
          <p className="font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
        </div>
      </header>

      {!user?.daily_calorie_norm && (
        <Card className="bg-yellow-50 border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            Complete your profile to get personalized calorie recommendations.{' '}
            <Link to="/profile" className="font-medium underline">
              Set up profile
            </Link>
          </p>
        </Card>
      )}

      <CalorieProgress
        consumed={stats?.total_calories || 0}
        goal={calorieGoal}
      />

      <MacroCard
        protein={stats?.total_protein || 0}
        fat={stats?.total_fat || 0}
        carbs={stats?.total_carbs || 0}
      />

      {lastEntry && (
        <Card>
          <div className="flex items-center gap-3">
            {lastEntry.photo_url ? (
              <img
                src={lastEntry.photo_url.startsWith('/') ? lastEntry.photo_url : `/${lastEntry.photo_url}`}
                alt={lastEntry.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-500">Last meal</p>
              <p className="font-medium text-gray-900">{lastEntry.name}</p>
              <p className="text-sm text-gray-600">
                {lastEntry.calories} kcal • {formatTime(lastEntry.created_at)}
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link to="/add">
          <Card className="text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <p className="font-medium text-gray-900">Scan Food</p>
          </Card>
        </Link>
        <Link to="/recommendations">
          <Card className="text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="font-medium text-gray-900">AI Tips</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
