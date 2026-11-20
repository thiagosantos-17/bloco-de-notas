import { useState, useRef, useEffect, type ReactNode } from 'react';
import React from 'react';
import { cn } from '../../lib/utils';
import { X, ChevronDown, Check } from 'lucide-react';

interface DropdownItem {
  label: string;
  value: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  onSelect: (value: string) => void;
  selectedValue?: string;
  align?: 'left' | 'right';
  width?: number | 'auto';
}

export function Dropdown({
  trigger,
  items,
  onSelect,
  selectedValue,
  align = 'left',
  width = 200,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleItemClick = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  const styleWidth = width === 'auto' ? 'auto' : `${width}px`;

  const renderTrigger = () => {
    if (typeof trigger === 'object' && trigger !== null && 'props' in trigger) {
      const triggerElement = trigger as React.ReactElement<any>;
      return React.cloneElement(triggerElement, {
        ref: triggerRef,
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          triggerElement.props.onClick?.(e);
        },
        'aria-haspopup': true,
        'aria-expanded': isOpen,
      });
    }

    return (
      <button
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="inline-flex items-center"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </button>
    );
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div>{renderTrigger()}</div>

      {isOpen && (
        <div
          className={cn(
            'fixed z-50 mt-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg',
            'py-1 min-w-[160px] max-h-60 overflow-y-auto',
            align === 'right' ? 'right-0' : 'left-0',
            'animate-in'
          )}
          style={{ width: styleWidth }}
          role="menu"
        >
          {items.map((item, index) => (
            <button
              key={item.value}
              onClick={() => !item.disabled && handleItemClick(item.value)}
              disabled={item.disabled}
              role="menuitem"
              aria-selected={selectedValue === item.value}
              aria-disabled={item.disabled}
              className={cn(
                'w-full px-3 py-2 text-sm flex items-center gap-2',
                'text-slate-900 dark:text-slate-100',
                'hover:bg-slate-100 dark:hover:bg-slate-700',
                'focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-700',
                item.danger && 'text-red-600 dark:text-red-400',
                item.disabled && 'opacity-50 cursor-not-allowed',
                'transition-colors duration-100'
              )}
              style={{ animationDelay: `${index * 15}ms` }}
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span className="flex-1 text-left">{item.label}</span>
              {selectedValue === item.value && (
                <Check className="h-4 w-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors?: { value: string; label: string; preview: string }[];
  triggerLabel?: string;
}

export function ColorPicker({ value, onChange, colors, triggerLabel = 'Cor' }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const defaultColors = colors || [
    { value: 'default', label: 'Padrão', preview: '#ffffff' },
    { value: 'yellow', label: 'Amarelo', preview: '#fef9c3' },
    { value: 'orange', label: 'Laranja', preview: '#ffedd5' },
    { value: 'red', label: 'Vermelho', preview: '#fee2e2' },
    { value: 'pink', label: 'Rosa', preview: '#fce7f3' },
    { value: 'purple', label: 'Roxo', preview: '#f3e8ff' },
    { value: 'blue', label: 'Azul', preview: '#dbeafe' },
    { value: 'cyan', label: 'Ciano', preview: '#cffafe' },
    { value: 'green', label: 'Verde', preview: '#dcfce7' },
    { value: 'gray', label: 'Cinza', preview: '#f1f5f9' },
  ];

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={triggerLabel}
      >
        <span
          className="w-5 h-5 rounded border border-slate-300 dark:border-slate-600 flex-shrink-0"
          style={{
            backgroundColor: value === 'default' ? 'transparent' : defaultColors.find(c => c.value === value)?.preview,
          }}
        >
          {value === 'default' && (
            <X className="w-3 h-3 text-slate-400 mx-auto my-1" />
          )}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
      </button>

      {isOpen && (
        <div
          className="fixed z-50 mt-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg py-1 min-w-[140px] animate-in"
          role="menu"
        >
          {defaultColors.map((color, index) => (
            <button
              key={color.value}
              onClick={() => {
                onChange(color.value);
                setIsOpen(false);
              }}
              role="menuitem"
              aria-selected={value === color.value}
              className={cn(
                'w-full px-3 py-2 flex items-center gap-2',
                'text-slate-900 dark:text-slate-100',
                'hover:bg-slate-100 dark:hover:bg-slate-700',
                'focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-700',
                'transition-colors duration-100'
              )}
              style={{ animationDelay: `${index * 10}ms` }}
            >
              <span
                className="w-5 h-5 rounded border border-slate-300 dark:border-slate-600 flex-shrink-0"
                style={{ backgroundColor: color.preview }}
              >
                {color.value === 'default' && (
                  <X className="w-3 h-3 text-slate-400 mx-auto my-1" />
                )}
              </span>
              <span className="flex-1 text-left capitalize">{color.label}</span>
              {value === color.value && (
                <Check className="h-4 w-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}