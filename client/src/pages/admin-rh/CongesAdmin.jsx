import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPendingDemandes, reviewDemande } from '../../services/congeApi';

export default function CongesAdmin() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [avisMap, setAvisMap] = useState({});

  async function load() {
    setLoading(true);
    try {
      setDemandes(await getPendingDemandes());
    } catch (err) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleReview(id, decision) {
    setActionError('');
    try {
      await reviewDemande(id, decision, avisMap[id] || '');
      setDemandes((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <p className="text-sm text-gray-500 mb-6">Demandes en attente de décision.</p>

      {actionError && <p className="text-sm text-status-rejected mb-4">{actionError}</p>}
      {loading && <p className="text-gray-500">Chargement...</p>}
      {!loading && demandes.length === 0 && <p className="text-gray-500">Aucune demande en attente.</p>}

      <div className="space-y-3">
        {demandes.map((d) => (
          <div key={d.id} className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-navy">{d.prenom} {d.nom} <span className="text-xs text-gray-400">({d.role})</span></p>
                <p className="text-sm text-gray-500">{d.type_conge} — {d.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Du {new Date(d.date_debut).toLocaleDateString('fr-FR')} au {new Date(d.date_fin).toLocaleDateString('fr-FR')}
                </p>
                {d.lieu_jouissance && <p className="text-xs text-gray-400">Lieu : {d.lieu_jouissance}</p>}
                {d.remplacant && <p className="text-xs text-gray-400">Remplaçant : {d.remplacant}</p>}
                {d.motif && <p className="text-xs text-gray-500 mt-1">Motif : {d.motif}</p>}
              </div>
            </div>

            <Link to={`/demandes/${d.id}/fiche`} className="text-xs text-navy underline mb-3 inline-block">
              Voir / télécharger la fiche
            </Link>

            <textarea
              placeholder="Avis du chef de service (optionnel)"
              rows={2}
              value={avisMap[d.id] || ''}
              onChange={(e) => setAvisMap((prev) => ({ ...prev, [d.id]: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-navy"
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
                className="px-4 py-2 rounded-md bg-status-approved text-white text-sm font-medium hover:opacity-90"
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
