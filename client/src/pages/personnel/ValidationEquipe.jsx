import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { getPendingEquipe, reviewIntermediaire } from '../../services/congeApi';

export default function ValidationEquipe() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [avisMap, setAvisMap] = useState({});

  async function load() {
    setLoading(true);
    try {
      setDemandes(await getPendingEquipe());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleReview(id, decision) {
    setError('');
    try {
      await reviewIntermediaire(id, decision, avisMap[id] || '');
      setDemandes((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Mon espace', path: '/dashboard' }, { label: 'Validation équipe' }]}
        title="Validation équipe"
        subtitle="Demandes de votre équipe en attente de votre avis, avant transmission à l'Admin RH"
      />

      {error && <p className="text-sm text-status-rejected mb-4">{error}</p>}
      {loading && <p className="text-gray-500">Chargement...</p>}
      {!loading && demandes.length === 0 && <p className="text-gray-500">Aucune demande en attente.</p>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {demandes.map((d) => (
          <div key={d.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-navy dark:text-gray-100">{d.prenom} {d.nom}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{d.type_conge}</p>
                <p className="text-xs text-gray-400">
                  Du {new Date(d.date_debut).toLocaleDateString('fr-FR')} au {new Date(d.date_fin).toLocaleDateString('fr-FR')}
                </p>
                {d.motif && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Motif : {d.motif}</p>}
              </div>
            </div>

            <Link to={`/demandes/${d.id}/fiche`} className="text-xs text-navy dark:text-gold underline mb-3 inline-block">
              Voir / télécharger la fiche
            </Link>

            <textarea
              placeholder="Votre avis (optionnel)"
              rows={2}
              value={avisMap[d.id] || ''}
              onChange={(e) => setAvisMap((prev) => ({ ...prev, [d.id]: e.target.value }))}
              className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-navy"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleReview(d.id, 'refusee')}
                className="px-4 py-2 rounded-md border border-status-rejected text-status-rejected text-sm font-medium hover:bg-red-50"
              >
                Refuser
              </button>
              <button
                onClick={() => handleReview(d.id, 'approuvee')}
                className="px-4 py-2 rounded-md bg-navy text-white text-sm font-medium hover:opacity-90"
              >
                Approuver
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
