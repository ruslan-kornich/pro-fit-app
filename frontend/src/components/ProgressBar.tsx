import { cn } from '../utils/cn';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  emoji?: string;
  showValue?: boolean;
  color?: 'primary' | 'green' | 'yellow' | 'red' | 'blue' | 'indigo' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProgressBar({
  value,
  max,
  label,
  emoji,
  showValue = true,
  color = 'primary',
  size = 'md',
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-400',
    green: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    yellow: 'bg-gradient-to-r from-amber-500 to-amber-400',
    red: 'bg-gradient-to-r from-red-500 to-red-400',
    blue: 'bg-gradient-to-r from-blue-500 to-blue-400',
    indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-400',
    gradient: 'bg-gradient-to-r from-primary-600 via-primary-400 to-primary-300',
  };

  const sizes = {
    sm: 'h-2',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-sm font-medium text-surface-700">
              {emoji && <span className="mr-1.5">{emoji}</span>}
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm font-medium text-surface-500">
              {value.toFixed(0)}<span className="text-surface-300 mx-0.5">/</span>{max.toFixed(0)}
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-surface-100 rounded-pill overflow-hidden', sizes[size])}>
        <div
          className={cn('h-full rounded-pill transition-all duration-500 ease-spring', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
