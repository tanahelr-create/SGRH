import { useEffect, useState } from 'react';
import { getMyNotifications, markNotificationAsRead } from '../services/notificationApi';

const TYPE_LABELS = {
  info: 'Information', reunion: 'Réunion', echeance: 'Échéance',
  conge: 'Congé', paie: 'Paie',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('toutes'); // 'toutes' | 'non_lues' | 'lues'

  async function load() {
    setLoading(true);
    try {
      setNotifications(await getMyNotifications());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleRead(id) {
    await markNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  }

  const filtered = notifications.filter((n) => {
    if (filter === 'non_lues') return !n.is_read;
    if (filter === 'lues') return n.is_read;
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex gap-2 mb-6">
        {['toutes', 'non_lues', 'lues'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              filter === f ? 'bg-navy text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            {f === 'toutes' ? 'Toutes' : f === 'non_lues' ? 'Non lues' : 'Lues'}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500 text-sm">Chargement...</p>}
      {!loading && filtered.length === 0 && (
        <p className="text-gray-400 text-sm">Aucune notification ici.</p>
      )}

      <div className="space-y-2">
        {filtered.map((n) => (
          <div
            key={n.id}
            className={`bg-white rounded-lg shadow p-4 flex items-start justify-between gap-3 ${
              n.is_read ? 'opacity-60' : ''
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                  {TYPE_LABELS[n.type] || n.type}
                </span>
                {!n.is_read && <span className="w-2 h-2 rounded-full bg-status-rejected" />}
              </div>
              <p className="text-sm font-medium text-navy">{n.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(n.created_at).toLocaleString('fr-FR')}
              </p>
            </div>
            {!n.is_read && (
              <button
                onClick={() => handleRead(n.id)}
                className="text-xs text-navy underline whitespace-nowrap"
              >
                Marquer lue
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
