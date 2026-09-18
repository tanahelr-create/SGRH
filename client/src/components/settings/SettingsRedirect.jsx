import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SettingsRedirect({ icon: Icon, title, description, path }) {
  return (
    <Link
      to={path}
      className="flex items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-lg shadow p-5 hover:shadow-md hover:-translate-y-0.5 transition"
    >
      <div className="flex items-start gap-3 min-w-0">
        {Icon && <Icon size={20} className="mt-0.5 text-navy dark:text-gold shrink-0" />}
        <div className="min-w-0">
          <p className="font-medium text-slate-800 dark:text-gray-100">{title}</p>
          {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <ArrowUpRight size={18} className="text-slate-400 shrink-0" />
    </Link>
  );
}