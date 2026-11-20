import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showStats?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, showStats, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const wordCount = props.value ? props.value.toString().trim().split(/\s+/).filter(Boolean).length : 0;
    const charCount = props.value ? props.value.toString().length : 0;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            className={cn(
              'w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border rounded-lg',
              'text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'border-slate-300 dark:border-slate-600',
              'hover:border-slate-400 dark:hover:border-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors duration-150 resize-none font-mono',
              'leading-relaxed',
              error && 'border-red-500 focus:ring-red-500',
              showStats && 'pb-8',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              [error && `${textareaId}-error`, hint && `${textareaId}-hint`, showStats && `${textareaId}-stats`]
                .filter(Boolean)
                .join(' ') || undefined
            }
            {...props}
          />
          {showStats && (
            <div id={`${textareaId}-stats`} className="absolute bottom-1.5 right-2 text-xs text-slate-400 dark:text-slate-500 pointer-events-none">
              {wordCount} palavras · {charCount} chars
            </div>
          )}
        </div>
        {error && (
          <p id={`${textareaId}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${textareaId}-hint`} className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';