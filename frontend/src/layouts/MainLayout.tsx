import { Outlet } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';

export default function MainLayout() {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain pb-20">
        <div className="max-w-lg mx-auto">
          <Outlet />
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
