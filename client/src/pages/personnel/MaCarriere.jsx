import { useEffect, useState } from 'react';
import { getMaCarriere } from '../../services/carriereApi';
import { getMesSituations } from '../../services/situationAdministrativeApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function fileUrl(path) {
  return path ? `${API_URL.replace(/\/api\/?$/, '')}${path}` : null;
}

export default function MaCarriere() {
  const [data, setData] = useState(null);
  const [situations, setSituations] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getMaCarriere().then(setData).catch((err) => setError(err.message));
    getMesSituations().then(setSituations).catch(() => {});
  }, []);

  if (error) return <p className="text-status-rejected text-sm">{error}</p>;
  if (!data) return <p className="text-gray-500 text-sm">Chargement...</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {situations?.actuelle && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-semibold text-navy dark:text-gold mb-2">Situation administrative</h3>
          <p className="text-sm text-navy dark:text-gray-100 font-medium">{situations.actuelle.libelle}</p>
          <p className="text-xs text-gray-400">Depuis le {new Date(situations.actuelle.date_debut).toLocaleDateString('fr-FR')}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="font-semibold text-navy dark:text-gold mb-4">Ma carrière</h3>
        {data.timeline.length === 0 && <p className="text-sm text-gray-400">Aucun événement enregistré pour l'instant.</p>}
        <div className="relative border-l-2 border-gray-200 dark:border-gray-700 pl-4 space-y-4">
          {data.timeline.map((item, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-navy dark:bg-gold" />
              <p className="text-xs text-gray-400">
                {new Date(item.date).toLocaleDateString('fr-FR')}
                {item.dateEffet && ` — effet au ${new Date(item.dateEffet).toLocaleDateString('fr-FR')}`}
              </p>
              <p className="text-sm font-medium text-navy dark:text-gray-100">{item.type}</p>
              {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
              {(item.corps || item.grade || item.classe || item.echelon || item.indice) && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {[item.corps, item.grade, item.classe && `classe ${item.classe}`, item.echelon && `échelon ${item.echelon}`, item.indice && `indice ${item.indice}`].filter(Boolean).join(' · ')}
                </p>
              )}
              {item.justificatifPath && (
                <a href={fileUrl(item.justificatifPath)} target="_blank" rel="noreferrer" className="text-xs text-navy underline">
                  Voir le justificatif
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {data.personnel.role === 'PE' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-semibold text-navy dark:text-gold mb-3">Diplômes et qualifications</h3>
          {data.diplomes.length === 0 && <p className="text-sm text-gray-400">Aucun diplôme enregistré.</p>}
          <div className="space-y-2">
            {data.diplomes.map((d) => (
              <div key={d.id} className="border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
                <p className="text-sm font-medium text-navy dark:text-gray-100">{d.intitule}</p>
                <p className="text-xs text-gray-400">{[d.etablissement, d.annee_obtention].filter(Boolean).join(' — ')}</p>
                {d.document_path && (
                  <a href={fileUrl(d.document_path)} target="_blank" rel="noreferrer" className="text-xs text-navy underline">
                    Voir le document
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}