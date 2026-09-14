import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'rh_theme';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Applique les couleurs personnalisées dès le chargement de l'app, pour tous les rôles
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    fetch(`${API_URL}/site-settings`)
      .then((res) => res.json())
      .then((data) => {
        const settings = data.settings || {};
        Object.entries(settings).forEach(([key, value]) => {
          const cssVarName = `--${key.replace('color_', 'color-').replace(/_/g, '-')}`;
          document.documentElement.style.setProperty(cssVarName, value);
        });
      })
      .catch(() => {}); // échec silencieux : les couleurs par défaut du CSS restent actives
  }, []);

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé dans ThemeProvider');
  return ctx;
}