'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm active:scale-[0.98]',
      secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100 active:scale-[0.98]',
      outline: 'border-2 border-gray-200 bg-transparent text-gray-700 hover:bg-gray-50 active:scale-[0.98]',
      ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[0.98]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
      md: 'px-5 py-2.5 text-sm font-semibold rounded-xl',
      lg: 'px-6 py-3.5 text-base font-semibold rounded-2xl',
      xl: 'px-8 py-4.5 text-lg font-bold rounded-2xl',
    };

    return (
      <button
        ref={ref}
        disabled={loading || disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
