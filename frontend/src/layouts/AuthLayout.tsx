import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4 pt-safe-top pb-safe-bottom">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl mb-2 block">🥗</span>
          <h1 className="text-4xl font-bold text-primary-600">ProFit</h1>
          <p className="text-gray-600 mt-2">Track your calories with AI ✨</p>
        </div>
        <div className="bg-white rounded-card shadow-card p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
