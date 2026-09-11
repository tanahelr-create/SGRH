import { useEffect, useState } from 'react';
import { getMaCarriere } from '../../services/carriereApi';

export default function MaCarriere() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getMaCarriere().then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-status-rejected text-sm">{error}</p>;
  if (!data) return <p className="text-gray-500 text-sm">Chargement...</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="font-semibold text-navy dark:text-gold mb-4">Ma carrière</h3>
      {data.timeline.length === 0 && <p className="text-sm text-gray-400">Aucun événement enregistré pour l'instant.</p>}
      <div className="relative border-l-2 border-gray-200 dark:border-gray-700 pl-4 space-y-4">
        {data.timeline.map((item, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-navy dark:bg-gold" />
            <p className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString('fr-FR')}</p>
            <p className="text-sm font-medium text-navy dark:text-gray-100">{item.type}</p>
            {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
