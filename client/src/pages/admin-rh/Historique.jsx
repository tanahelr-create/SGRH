import { useEffect, useState } from 'react';
import { getActivityLog } from '../../services/activityLogApi';
import PageHeader from '../../components/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { ACTION_LABELS } from '../../constants/activityLabels';

export default function Historique() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    getActivityLog(100).then(setLogs).finally(() => setLoading(false));
  }, []);

  const filtered = filterType ? logs.filter((l) => l.action_type === filterType) : logs;

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader crumbs={[{ label: 'Admin RH' }, { label: 'Audit & journal' }]} title="Audit & journal" subtitle="Historique des actions effectuées dans le SGRH" />
      <div className="mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
        >
          <option value="">Tous les types d'action</option>
          {Object.entries(ACTION_LABELS).map(([type, { label }]) => (
            <option key={type} value={type}>{label}</option>
          ))}
        </select>
      </div>

      {!loading && filtered.length === 0 && (
        <p className="text-gray-400 text-sm">Aucune activité enregistrée.</p>
      )}

      {loading && (
        <div className="space-y-2" role="status" aria-label="Chargement du journal d'activité">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-start gap-3">
              <Skeleton className="h-5 w-28 rounded shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-2/3 rounded" />
                <Skeleton className="h-3 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {!loading && filtered.map((log) => {
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
