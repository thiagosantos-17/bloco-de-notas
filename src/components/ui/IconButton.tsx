import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'ghost', size = 'md', 'aria-label': ariaLabel, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      ghost: 'bg-transparent hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700 text-slate-600 dark:text-slate-400',
      outline: 'border border-slate-300 bg-transparent hover:bg-slate-100 active:bg-slate-200 dark:border-slate-600 dark:hover:bg-slate-800 dark:active:bg-slate-700 text-slate-600 dark:text-slate-400',
      solid: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm',
    };

    const sizes = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';