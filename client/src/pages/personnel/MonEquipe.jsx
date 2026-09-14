import { useEffect, useState } from 'react';
import { getMonEquipe } from '../../services/personnelApi';

export default function MonEquipe() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getMonEquipe().then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-status-rejected text-sm">{error}</p>;
  if (!data) return <p className="text-gray-500 text-sm">Chargement...</p>;

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {data.portee === 'service' ? 'Service' : 'Direction'} : <span className="font-medium text-navy dark:text-gray-100">{data.nom}</span>
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y dark:divide-gray-700">
        {data.equipe.length === 0 && (
          <p className="p-4 text-sm text-gray-400">Aucun membre dans cette équipe pour l'instant.</p>
        )}
        {data.equipe.map((m) => (
          <div key={m.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">
                {(m.prenom?.[0] || m.email[0]).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-navy dark:text-gray-100">{m.prenom} {m.nom}</p>
                <p className="text-xs text-gray-400">{m.fonction || m.role} — {m.matricule}</p>
              </div>
            </div>
            {m.en_conge ? (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-status-pending font-medium">En congé</span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-status-approved font-medium">Présent</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
