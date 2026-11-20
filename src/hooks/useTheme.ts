import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('notepad-theme');
      if (stored) return JSON.parse(stored) as Theme;
    } catch {}
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (t: 'light' | 'dark') => {
      setResolvedTheme(t);
      root.classList.remove('light', 'dark');
      root.classList.add(t);
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    if (theme === 'system') {
      applyTheme(mediaQuery.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handleChange);
    } else {
      applyTheme(theme);
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setThemeMode = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('notepad-theme', JSON.stringify(newTheme));
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setThemeMode(nextTheme);
  }, [theme, setThemeMode]);

  return { theme, resolvedTheme, setTheme: setThemeMode, toggleTheme };
}