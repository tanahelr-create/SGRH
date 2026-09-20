import { useEffect, useState } from 'react';
import { getDemandesEnAttente, traiterDemande, refuserDemande } from '../../services/documentApi';
import PageHeader from '../../components/PageHeader';
import { SkeletonCard } from '../../components/ui/Skeleton';

const TYPE_LABELS = { certificat_administratif: 'Certificat administratif', lettre_confirmation: 'Lettre de confirmation', etat_conge: 'État de congé' };

export default function DemandesDocuments() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      setDemandes(await getDemandesEnAttente());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleTraiter(id) {
    setError('');
    try {
      const document = await traiterDemande(id);
      setDemandes((prev) => prev.filter((d) => d.id !== id));
      window.open(`/documents/${document.id}`, '_blank');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRefuser(id) {
    setError('');
    try {
      await refuserDemande(id);
      setDemandes((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader crumbs={[{ label: 'Admin RH' }, { label: 'Documents' }, { label: 'Demandes de documents' }]} title="Demandes de documents" subtitle="Demandes en attente, initiées par le personnel" />

      {error && <p className="text-sm text-status-rejected mb-4">{error}</p>}
      {!loading && demandes.length === 0 && <p className="text-gray-500">Aucune demande en attente.</p>}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {demandes.map((d) => (
          <div key={d.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-navy dark:text-gray-100">{d.prenom} {d.nom}</p>
              <p className="text-sm text-gray-500">{TYPE_LABELS[d.type_document] || d.type_document}</p>
              {d.motif && <p className="text-xs text-gray-400 mt-1">Motif : {d.motif}</p>}
              <p className="text-xs text-gray-400 mt-1">
                Demandé le {new Date(d.date_demande).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleRefuser(d.id)}
                className="px-4 py-2 rounded-md border border-status-rejected text-status-rejected text-sm font-medium hover:bg-red-50"
              >
                Refuser
              </button>
              <button
                onClick={() => handleTraiter(d.id)}
                className="px-4 py-2 rounded-md bg-status-approved text-white text-sm font-medium hover:opacity-90"
              >
                Générer et envoyer
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}