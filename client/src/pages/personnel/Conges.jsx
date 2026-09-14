import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createDemande, getMyDemandes } from '../../services/congeApi';
import { getMyPersonnel } from '../../services/personnelApi';
import { TYPES_CONGE, STATUS_LABELS } from '../../constants/conges';

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-navy">{value || '—'}</p>
    </div>
  );
}

export default function Conges() {
  const [personnel, setPersonnel] = useState(null);
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [typeConge, setTypeConge] = useState(TYPES_CONGE[0]);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [motif, setMotif] = useState('');
  const [lieuJouissance, setLieuJouissance] = useState('');
  const [dateRepriseService, setDateRepriseService] = useState('');
  const [remplacant, setRemplacant] = useState('');
  const [status, setStatus] = useState(null);
  const [feedback, setFeedback] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [p, d] = await Promise.all([getMyPersonnel(), getMyDemandes()]);
      setPersonnel(p);
      setDemandes(d);
    } catch (err) {
      setFeedback(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setFeedback('');
    try {
      await createDemande({
        typeConge, dateDebut, dateFin, motif,
        lieuJouissance, dateRepriseService, remplacant,
      });
      setStatus('success');
      setFeedback('Demande envoyée.');
      setDateDebut(''); setDateFin(''); setMotif('');
      setLieuJouissance(''); setDateRepriseService(''); setRemplacant('');
      load();
    } catch (err) {
      setStatus('error');
      setFeedback(err.message);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-navy mb-4">Nouvelle demande</h3>

        {personnel && (
          <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-gray-50 rounded-md">
            <ReadOnlyField label="Matricule" value={personnel.matricule} />
            <ReadOnlyField label="Nom et prénom" value={`${personnel.prenom} ${personnel.nom}`} />
            <ReadOnlyField label="Fonction" value={personnel.fonction} />
            <ReadOnlyField label="Corps / Grade" value={[personnel.corps, personnel.grade].filter(Boolean).join(' / ')} />
          </div>
        )}

        {personnel && (
          <div className="flex items-center justify-between mb-5 p-3 bg-navy/5 rounded-md">
            <span className="text-sm text-navy font-medium">Solde de congé annuel</span>
            <span className="text-xl font-bold text-navy">{personnel.solde_conges} jour(s)</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de demande</label>
            <select
              value={typeConge}
              onChange={(e) => setTypeConge(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            >
              {TYPES_CONGE.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {typeConge === 'Congé annuel' && (
              <p className="text-xs text-gray-400 mt-1">
                Minimum 15 jours pour votre première demande de congé annuel de l'année.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="date" required value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input
                type="date" required value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de jouissance</label>
            <input
              type="text" value={lieuJouissance}
              onChange={(e) => setLieuJouissance(e.target.value)}
              placeholder="Ex : Mahajanga"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de reprise de service</label>
            <input
              type="date" value={dateRepriseService}
              onChange={(e) => setDateRepriseService(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remplaçant(e) (optionnel)</label>
            <input
              type="text" value={remplacant}
              onChange={(e) => setRemplacant(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
            <textarea
              rows={2} value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-navy text-white rounded-md py-2 font-medium hover:opacity-90 disabled:opacity-50"
          >
            {status === 'loading' ? 'Envoi...' : 'Envoyer la demande'}
          </button>

          {feedback && (
            <p className={`text-sm ${status === 'success' ? 'text-status-approved' : 'text-status-rejected'}`}>
              {feedback}
            </p>
          )}
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-navy mb-4">Mes demandes</h3>
        {loading && <p className="text-gray-500 text-sm">Chargement...</p>}
        {!loading && demandes.length === 0 && (
          <p className="text-gray-400 text-sm">Aucune demande pour l'instant.</p>
        )}
        <div className="space-y-3">
          {demandes.map((d) => (
            <div key={d.id} className="border-b last:border-0 pb-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-navy">{d.type_conge}</p>
                <span className={`text-xs font-medium ${STATUS_LABELS[d.status].color}`}>
                  {STATUS_LABELS[d.status].label}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Du {new Date(d.date_debut).toLocaleDateString('fr-FR')} au {new Date(d.date_fin).toLocaleDateString('fr-FR')}
              </p>
              {d.decision_intermediaire === 'en_attente' && (
                <p className="text-xs text-status-pending mt-1">En attente de l'avis du responsable direct</p>
              )}
              {d.lieu_jouissance && <p className="text-xs text-gray-500 mt-1">Lieu : {d.lieu_jouissance}</p>}
              {d.avis_chef_service && (
                <p className="text-xs text-gray-500 mt-1">Avis : {d.avis_chef_service}</p>
              )}
              <Link to={`/demandes/${d.id}/fiche`} className="text-xs text-navy underline mt-1 inline-block">
                Voir / télécharger la fiche
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}