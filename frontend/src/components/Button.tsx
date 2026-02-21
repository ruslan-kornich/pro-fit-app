import React from 'react';
import { cn } from '../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-button transition-all duration-200 ease-spring focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]';

  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-button hover:shadow-button-hover focus:ring-primary-500',
    gradient: 'text-white shadow-button hover:shadow-button-hover focus:ring-primary-500 bg-gradient-to-r from-primary-700 via-primary-500 to-primary-400',
    secondary: 'bg-surface-100 text-surface-800 hover:bg-surface-200 focus:ring-surface-400',
    outline: 'border-2 border-primary-400 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'text-surface-600 hover:bg-surface-100 focus:ring-surface-400',
    accent: 'bg-gradient-to-r from-accent-500 to-accent-400 text-white shadow-lg hover:shadow-xl focus:ring-accent-500',
    danger: 'bg-gradient-to-r from-red-500 to-red-400 text-white shadow-lg focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-sm rounded-[12px]',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
