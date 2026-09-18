import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="text-gray-400 hover:text-navy dark:hover:text-gold transition"
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}>
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}