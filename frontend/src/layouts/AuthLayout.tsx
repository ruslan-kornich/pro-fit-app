import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="h-full overflow-y-auto flex items-center justify-center p-4 pt-safe-top pb-safe-bottom relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-[20px] flex items-center justify-center shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">ProFit</h1>
          <p className="text-primary-100 mt-2 text-sm font-medium">Track your calories with AI</p>
        </div>
        <div className="bg-white rounded-[24px] shadow-float p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
