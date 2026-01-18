import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600">ProFit</h1>
          <p className="text-gray-600 mt-2">Track your calories with AI</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
