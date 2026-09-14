import { useEffect, useState } from 'react';
import { getActivityLog } from '../../services/activityLogApi';

const ACTION_LABELS = {
  invitation_envoyee: { label: 'Invitation envoyée', color: 'bg-blue-50 text-blue-600' },
  compte_confirme: { label: 'Compte confirmé', color: 'bg-green-50 text-status-approved' },
  compte_refuse: { label: 'Compte refusé', color: 'bg-red-50 text-status-rejected' },
  notification_envoyee: { label: 'Notification', color: 'bg-purple-50 text-purple-600' },
  conge_demande: { label: 'Demande de congé', color: 'bg-amber-50 text-status-pending' },
  conge_traite: { label: 'Congé traité', color: 'bg-green-50 text-status-approved' },
  fonction_modifiee: { label: 'Changement de grade', color: 'bg-indigo-50 text-indigo-600' },
  mot_de_passe_modifie: { label: 'Mot de passe', color: 'bg-gray-100 text-gray-600' },
};

export default function Historique() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    getActivityLog(100).then(setLogs).finally(() => setLoading(false));
  }, []);

  const filtered = filterType ? logs.filter((l) => l.action_type === filterType) : logs;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilterType('')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium ${
              filterType === '' ? 'bg-navy text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
          }`}
        >
          Tout
        </button>
        {Object.entries(ACTION_LABELS).map(([type, { label }]) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium ${
              filterType === type ? 'bg-navy text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500 text-sm">Chargement...</p>}
      {!loading && filtered.length === 0 && (
        <p className="text-gray-400 text-sm">Aucune activité enregistrée.</p>
      )}

      <div className="space-y-2">
        {filtered.map((log) => {
          const meta = ACTION_LABELS[log.action_type] || { label: log.action_type, color: 'bg-gray-100 text-gray-600' };
          return (
            <div key={log.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-start gap-3">
              <span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap mt-0.5 ${meta.color}`}>
                {meta.label}
              </span>
              <div className="flex-1">
                <p className="text-sm text-navy dark:text-gray-100">{log.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {log.email ? `${log.prenom || ''} ${log.nom || log.email}`.trim() : 'Système'}
                  {' — '}
                  {new Date(log.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
