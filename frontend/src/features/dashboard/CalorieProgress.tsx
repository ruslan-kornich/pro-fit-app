import { cn } from '../../utils/cn';

interface CalorieProgressProps {
  consumed: number;
  goal: number;
  className?: string;
}

export default function CalorieProgress({ consumed, goal, className }: CalorieProgressProps) {
  const percentage = Math.min((consumed / goal) * 100, 100);
  const remaining = Math.max(goal - consumed, 0);
  const isOverLimit = consumed > goal;

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative w-52 h-52">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={isOverLimit ? '#ef4444' : '#22c55e'}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900">{consumed}</span>
          <span className="text-sm text-gray-500">of {goal} kcal</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        {isOverLimit ? (
          <p className="text-red-500 font-medium">
            {consumed - goal} kcal over limit
          </p>
        ) : (
          <p className="text-gray-600">
            <span className="text-primary-500 font-medium">{remaining}</span> kcal remaining
          </p>
        )}
      </div>
    </div>
  );
}
