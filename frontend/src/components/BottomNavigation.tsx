import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../utils/cn';

interface NavItem {
  path: string;
  labelKey: string;
  icon: (active: boolean) => React.ReactNode;
}

const navItems: NavItem[] = [
  {
    path: '/',
    labelKey: 'nav.home',
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 0 : 1.8}>
        {active ? (
          <path d="M11.47 3.841a.75.75 0 011.06 0l8.69 8.69a.75.75 0 01-.53 1.28h-1.44v7.44a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75v-7.44H4.31a.75.75 0 01-.53-1.28l8.69-8.69z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        )}
      </svg>
    ),
  },
  {
    path: '/history',
    labelKey: 'nav.history',
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} viewBox="0 0 24 24" strokeWidth={1.8}>
        {active ? (
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        )}
      </svg>
    ),
  },
  {
    path: '/add',
    labelKey: 'nav.add',
    icon: () => (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    path: '/statistics',
    labelKey: 'nav.statistics',
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} viewBox="0 0 24 24" strokeWidth={1.8}>
        {active ? (
          <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z M13.5 3.75a7.5 7.5 0 017.5 7.5h-7.5V3.75z" />
        )}
      </svg>
    ),
  },
  {
    path: '/profile',
    labelKey: 'nav.profile',
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} viewBox="0 0 24 24" strokeWidth={1.8}>
        {active ? (
          <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        )}
      </svg>
    ),
  },
];

export default function BottomNavigation() {
  const { t } = useTranslation('common');
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div className="bg-white/80 backdrop-blur-xl border-t border-surface-100/80 shadow-nav pb-safe-bottom">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto relative">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isAddButton = item.path === '/add';

            if (isAddButton) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center justify-center -mt-6"
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-float transition-all duration-200 ease-spring active:scale-90 hover:shadow-xl gradient-primary">
                    {item.icon(false)}
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ease-spring relative',
                  isActive ? 'text-primary-600' : 'text-surface-400'
                )}
              >
                <div className="relative">
                  {item.icon(isActive)}
                  {isActive && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
                  )}
                </div>
                <span className={cn(
                  'text-[10px] mt-1 font-medium transition-colors',
                  isActive ? 'text-primary-600' : 'text-surface-400'
                )}>
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
