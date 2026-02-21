import React from 'react';
import { cn } from '../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-surface-600">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-4 py-3 bg-surface-50 border rounded-input transition-all duration-200 ease-spring focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent focus:bg-white focus:shadow-glow',
          error ? 'border-red-400 bg-red-50/30' : 'border-surface-200',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
    </div>
  );
}
