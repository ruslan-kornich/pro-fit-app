import { cn } from '../utils/cn';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  emoji?: string;
  showValue?: boolean;
  color?: 'primary' | 'green' | 'yellow' | 'red' | 'blue' | 'gradient';
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
    primary: 'bg-primary-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    gradient: 'bg-gradient-to-r from-primary-400 to-primary-600',
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
            <span className="text-sm font-medium text-gray-700">
              {emoji && <span className="mr-1">{emoji}</span>}
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm text-gray-500">
              {value.toFixed(0)} / {max.toFixed(0)}
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-gray-100 rounded-[10px] overflow-hidden', sizes[size])}>
        <div
          className={cn('h-full rounded-[10px] transition-all duration-300', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
