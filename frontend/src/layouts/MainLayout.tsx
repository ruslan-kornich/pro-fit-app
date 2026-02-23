import { Outlet } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import InstallPrompt from '../components/InstallPrompt';

export default function MainLayout() {
  return (
    <div className="h-full flex flex-col bg-gradient-warm pt-safe-top">
      <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-lg mx-auto">
          <Outlet />
        </div>
      </main>
      <InstallPrompt />
      <BottomNavigation />
    </div>
  );
}
