import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themeMode, colorTheme } = useStore();

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Handle dark/light mode
    root.classList.remove('light', 'dark');
    
    if (themeMode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(themeMode);
    }

    // Handle color theme
    root.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-orange', 'theme-rose');
    if (colorTheme !== 'blue') {
      root.classList.add(`theme-${colorTheme}`);
    }
  }, [themeMode, colorTheme]);

  // Listen for system theme changes if in system mode
  useEffect(() => {
    if (themeMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  return <>{children}</>;
}
