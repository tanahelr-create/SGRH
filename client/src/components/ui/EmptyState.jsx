import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'Aucun résultat', description, action, className = '' }) {
  return (
    <div className={`text-center py-8 px-4 ${className}`}>
      <Icon size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" aria-hidden="true" />
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      {description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
