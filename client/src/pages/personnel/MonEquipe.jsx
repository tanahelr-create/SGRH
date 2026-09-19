import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
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
    <div>
      <PageHeader
        crumbs={[{ label: 'Mon espace', path: '/dashboard' }, { label: 'Mon équipe' }]}
        title="Mon équipe"
        subtitle={`${data.portee === 'service' ? 'Service' : 'Direction'} : ${data.nom}`}
      />

      {data.equipe.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-400">Aucun membre dans cette équipe pour l'instant.</p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.equipe.map((m) => (
          <div key={m.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 shrink-0 rounded-full bg-navy text-white flex items-center justify-center text-sm font-bold">
                {(m.prenom?.[0] || m.email[0]).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-navy dark:text-gray-100 truncate">{m.prenom} {m.nom}</p>
                <p className="text-xs text-gray-400 truncate">{m.fonction || m.role} — {m.matricule}</p>
              </div>
            </div>
            {m.en_conge ? (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-status-pending font-medium shrink-0">En congé</span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-status-approved font-medium shrink-0">Présent</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
