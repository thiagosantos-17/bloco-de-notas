import { useEffect } from 'react';

interface ShortcutHandler {
  (event: KeyboardEvent): void;
}

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: ShortcutHandler;
  description?: string;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isInput = event.target instanceof HTMLInputElement ||
                      event.target instanceof HTMLTextAreaElement ||
                      event.target instanceof HTMLSelectElement ||
                      (event.target as HTMLElement)?.isContentEditable;

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true;
        const shiftMatch = shortcut.shift ? event.shiftKey : true;
        const altMatch = shortcut.alt ? event.altKey : true;
        const metaMatch = shortcut.meta ? event.metaKey : true;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          if (!isInput || shortcut.key === 's' || shortcut.key === 'f' || shortcut.key === 'n') {
            if (shortcut.preventDefault !== false) {
              event.preventDefault();
            }
            shortcut.handler(event);
            break;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export function formatShortcut(shortcut: ShortcutConfig): string {
  const parts: string[] = [];
  if (shortcut.ctrl || shortcut.meta) parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt');
  parts.push(shortcut.key.toUpperCase());
  return parts.join(' + ');
}