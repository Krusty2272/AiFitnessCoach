import React, { createContext, useContext, useState, useEffect } from 'react';
import hapticService from '../services/hapticService';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'dark';
  });

  const isLight = theme === 'light';

  useEffect(() => {
    // Применяем тему к документу
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Обновляем CSS переменные
    if (theme === 'light') {
      document.documentElement.style.setProperty('--text-primary', '#000000');
      document.documentElement.style.setProperty('--text-secondary', '#6b6b6f');
      document.documentElement.style.setProperty('--background-primary', '#ffffff');
      document.documentElement.style.setProperty('--background-secondary', '#f2f2f7');
      document.documentElement.style.setProperty('--background-card', 'rgba(0, 0, 0, 0.05)');
      document.documentElement.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
      document.documentElement.style.setProperty('--shadow-light', 'rgba(0, 0, 0, 0.1)');
      document.documentElement.style.setProperty('--shadow-dark', 'rgba(0, 0, 0, 0.2)');
    } else {
      document.documentElement.style.setProperty('--text-primary', '#ffffff');
      document.documentElement.style.setProperty('--text-secondary', '#8e8e93');
      document.documentElement.style.setProperty('--background-primary', '#000000');
      document.documentElement.style.setProperty('--background-secondary', '#1c1c1e');
      document.documentElement.style.setProperty('--background-card', 'rgba(255, 255, 255, 0.05)');
      document.documentElement.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
      document.documentElement.style.setProperty('--shadow-light', 'rgba(255, 255, 255, 0.1)');
      document.documentElement.style.setProperty('--shadow-dark', 'rgba(0, 0, 0, 0.5)');
    }
  }, [theme]);

  const toggleTheme = () => {
    hapticService.click();
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isLight }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};