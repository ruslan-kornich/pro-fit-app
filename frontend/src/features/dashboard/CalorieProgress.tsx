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

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="14"
          />
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={isOverLimit ? '#ef4444' : '#22c55e'}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{consumed}</span>
          <span className="text-xs text-gray-500">{t('calories.of')} {goal} {tCommon('units.kcal')}</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        {isOverLimit ? (
          <p className="text-red-500 font-medium">
            {consumed - goal} {tCommon('units.kcal')} {t('calories.overLimit')}
          </p>
        ) : (
          <p className="text-gray-600">
            <span className="text-primary-500 font-medium">{remaining}</span> {tCommon('units.kcal')} {t('calories.remaining')}
          </p>
        )}
      </div>
    </div>
  );
}
