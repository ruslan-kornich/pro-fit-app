import { Outlet } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="max-w-lg mx-auto">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
