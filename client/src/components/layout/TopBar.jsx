import { ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

const roleLabels = {
  ADMIN_RH: 'Admin RH',
  SUPERADMIN: 'Superadmin',
  PE: 'Personnel PE',
  PAT: 'Personnel PAT',
};

export default function TopBar({ title, subtitle }) {
  const { user } = useAuth();

  return (
    <header className="min-h-20 bg-white/95 dark:bg-gray-800/95 border-b border-slate-200 dark:border-gray-700 flex items-center px-4 sm:px-6 xl:px-8 shadow-sm">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-bold text-lg text-navy dark:text-gold leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <ThemeToggle />
        <NotificationBell />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="hidden lg:block text-sm max-w-56">
            <p className="font-medium text-navy dark:text-gray-100 leading-tight">{user?.email}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{roleLabels[user?.role]}</p>
          </div>
          <ChevronDown size={16} className="hidden sm:block text-gray-400" />
        </div>
      </div>
      </div>
    </header>
  );
}
