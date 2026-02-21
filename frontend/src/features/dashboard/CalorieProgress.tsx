import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

interface CalorieProgressProps {
  consumed: number;
  goal: number;
  className?: string;
}

export default function CalorieProgress({ consumed, goal, className }: CalorieProgressProps) {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const percentage = Math.min((consumed / goal) * 100, 100);
  const remaining = Math.max(goal - consumed, 0);
  const isOverLimit = consumed > goal;

  const circumference = 2 * Math.PI * 88;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn(
      'bg-white rounded-card shadow-card border border-surface-100/60 p-5 transition-all duration-250',
      className
    )}>
      <div className="flex items-center gap-5">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="calorieRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={isOverLimit ? '#EF4444' : '#2563EB'} />
                <stop offset="50%" stopColor={isOverLimit ? '#F87171' : '#3B82F6'} />
                <stop offset="100%" stopColor={isOverLimit ? '#EF4444' : '#06B6D4'} />
              </linearGradient>
            </defs>
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="#F1F5F9"
              strokeWidth="12"
            />
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="url(#calorieRingGrad)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-spring"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-surface-900 tracking-tight">{consumed}</span>
            <span className="text-xs text-surface-400 font-medium">{tCommon('units.kcal')}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-3">
            <p className="text-sm text-surface-500 font-medium">{t('calories.of')} {goal} {tCommon('units.kcal')}</p>
          </div>
          {isOverLimit ? (
            <div className="flex items-center gap-2 bg-red-50 rounded-[12px] px-3 py-2">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-red-600 font-semibold text-sm">
                +{consumed - goal} {tCommon('units.kcal')} {t('calories.overLimit')}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-primary-50 rounded-[12px] px-3 py-2">
              <svg className="w-5 h-5 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
              </svg>
              <p className="text-primary-700 font-semibold text-sm">
                {remaining} {tCommon('units.kcal')} {t('calories.remaining')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
