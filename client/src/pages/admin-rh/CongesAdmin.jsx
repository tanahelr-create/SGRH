import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPendingDemandes, reviewDemande, telechargerJustificatifConge } from '../../services/congeApi';
import PageHeader from '../../components/PageHeader';
import { JUSTIFICATIF_OBLIGATOIRE } from '../../constants/conges';
import { SkeletonCard, EmptyState } from '../../components/ui';

const JUSTIFICATIF_REQUIS_VALIDATION = ['Congé de maladie', 'Congé de maternité'];

export default function CongesAdmin() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [avisMap, setAvisMap] = useState({});
  const [reviewingId, setReviewingId] = useState(null);

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
    if (reviewingId) return; // empêche un double-clic pendant une décision déjà en cours
    setActionError('');
    setReviewingId(id);
    try {
      await reviewDemande(id, decision, avisMap[id] || '');
      setDemandes((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setReviewingId(null);
    }
  }

  return (
    <div>
      <PageHeader crumbs={[{ label: 'Admin RH' }, { label: 'Congés & absences' }]} title="Congés & absences" subtitle="Demandes en attente de décision" />

      {actionError && <p className="text-sm text-status-rejected mb-4">{actionError}</p>}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      )}
      {!loading && demandes.length === 0 && <EmptyState title="Aucune demande en attente." />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {demandes.map((d) => {
          const justificatifManquant = JUSTIFICATIF_REQUIS_VALIDATION.includes(d.type_conge) && !d.justificatif_path;

          return (
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

              <div className="flex items-center gap-3 mb-3">
                <Link to={`/demandes/${d.id}/fiche`} className="text-xs text-navy underline inline-block">
                  Voir / télécharger la fiche
                </Link>
                {d.justificatif_path ? (
                  <button
                    type="button"
                    onClick={() => telechargerJustificatifConge(d.id, d.justificatif_filename)}
                    className="text-xs text-navy underline inline-block"
                  >
                    Voir le justificatif
                  </button>
                ) : JUSTIFICATIF_OBLIGATOIRE.includes(d.type_conge) && (
                  <span className="text-xs text-status-pending">Aucun justificatif fourni</span>
                )}
              </div>

              {justificatifManquant && (
                <p className="text-xs text-status-rejected mb-3">
                  Justificatif requis avant validation pour ce type de congé.
                </p>
              )}

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
                  disabled={reviewingId !== null}
                  className="px-4 py-2 rounded-md border border-status-rejected text-status-rejected text-sm font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reviewingId === d.id ? 'Refus...' : 'Refuser'}
                </button>
                <button
                  onClick={() => handleReview(d.id, 'approuvee')}
                  disabled={justificatifManquant || reviewingId !== null}
                  className="px-4 py-2 rounded-md bg-status-approved text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reviewingId === d.id ? 'Approbation...' : 'Approuver'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}