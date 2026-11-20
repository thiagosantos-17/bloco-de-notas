import { useState, useRef, useEffect, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const arrowPositions = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-900 dark:border-t-slate-100',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 dark:border-b-slate-100',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-900 dark:border-l-slate-100',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-900 dark:border-r-slate-100',
  };

  const tooltipStyles = {
    top: { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    bottom: { top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    left: { right: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
    right: { left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
  };

  return (
    <div
      ref={triggerRef}
      className="inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            'fixed z-50 px-2.5 py-1.5 text-xs font-medium text-white',
            'rounded bg-slate-900 dark:bg-slate-100',
            'shadow-lg pointer-events-none animate-in',
            'whitespace-nowrap'
          )}
          style={tooltipStyles[position]}
          role="tooltip"
        >
          {content}
          <div
            className={cn(
              'absolute w-0 h-0 border-4 border-transparent',
              arrowPositions[position]
            )}
          />
        </div>
      )}
    </div>
  );
}