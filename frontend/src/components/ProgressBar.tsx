import { cn } from '../utils/cn';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showValue?: boolean;
  color?: 'primary' | 'green' | 'yellow' | 'red' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProgressBar({
  value,
  max,
  label,
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
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showValue && (
            <span className="text-sm text-gray-500">
              {value.toFixed(0)} / {max.toFixed(0)}
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-300', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
