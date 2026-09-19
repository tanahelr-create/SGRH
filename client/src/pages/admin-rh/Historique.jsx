import { useEffect, useState } from 'react';
import { getActivityLog } from '../../services/activityLogApi';
import PageHeader from '../../components/PageHeader';

const ACTION_LABELS = {
  invitation_envoyee: { label: 'Invitation envoyée', color: 'bg-blue-50 text-blue-600' },
  lien_inscription_envoye: { label: "Lien d'inscription envoyé", color: 'bg-blue-50 text-blue-600' },
  compte_confirme: { label: 'Compte confirmé', color: 'bg-green-50 text-status-approved' },
  compte_refuse: { label: 'Compte refusé', color: 'bg-red-50 text-status-rejected' },
  compte_desactive: { label: 'Compte désactivé', color: 'bg-red-50 text-status-rejected' },
  compte_reactive: { label: 'Compte réactivé', color: 'bg-green-50 text-status-approved' },
  compte_supprime: { label: 'Compte supprimé', color: 'bg-red-50 text-status-rejected' },
  element_restaure: { label: 'Élément restauré', color: 'bg-green-50 text-status-approved' },
  element_supprime_definitivement: { label: 'Suppression définitive', color: 'bg-red-50 text-status-rejected' },
  notification_envoyee: { label: 'Notification', color: 'bg-purple-50 text-purple-600' },
  conge_demande: { label: 'Demande de congé', color: 'bg-amber-50 text-status-pending' },
  conge_traite: { label: 'Congé traité', color: 'bg-green-50 text-status-approved' },
  conge_avis_intermediaire: { label: 'Avis intermédiaire congé', color: 'bg-amber-50 text-status-pending' },
  conge_justificatif_ajoute: { label: 'Justificatif de congé ajouté', color: 'bg-amber-50 text-status-pending' },
  fonction_modifiee: { label: 'Changement de grade', color: 'bg-indigo-50 text-indigo-600' },
  carriere_evenement: { label: 'Événement de carrière', color: 'bg-indigo-50 text-indigo-600' },
  carriere_evenement_modifie: { label: 'Événement de carrière modifié', color: 'bg-indigo-50 text-indigo-600' },
  carriere_evenement_supprime: { label: 'Événement de carrière supprimé', color: 'bg-indigo-50 text-indigo-600' },
  diplome_ajoute: { label: 'Diplôme ajouté', color: 'bg-indigo-50 text-indigo-600' },
  diplome_supprime: { label: 'Diplôme supprimé', color: 'bg-indigo-50 text-indigo-600' },
  situation_administrative: { label: 'Situation administrative', color: 'bg-indigo-50 text-indigo-600' },
  situation_administrative_modifiee: { label: 'Situation administrative modifiée', color: 'bg-indigo-50 text-indigo-600' },
  situation_administrative_supprimee: { label: 'Situation administrative supprimée', color: 'bg-red-50 text-status-rejected' },
  contrat_importe: { label: 'Contrat importé', color: 'bg-teal-50 text-teal-600' },
  contrat_document_ajoute: { label: 'Document de contrat ajouté', color: 'bg-teal-50 text-teal-600' },
  contrat_decision: { label: 'Décision sur un contrat', color: 'bg-teal-50 text-teal-600' },
  contrat_renouvele: { label: 'Contrat renouvelé', color: 'bg-teal-50 text-teal-600' },
  document_demande: { label: 'Document demandé', color: 'bg-purple-50 text-purple-600' },
  document_demande_traitee: { label: 'Demande de document traitée', color: 'bg-purple-50 text-purple-600' },
  document_demande_refusee: { label: 'Demande de document refusée', color: 'bg-red-50 text-status-rejected' },
  document_genere: { label: 'Document généré', color: 'bg-purple-50 text-purple-600' },
  personnel_cree: { label: 'Fiche personnel créée', color: 'bg-blue-50 text-blue-600' },
  personnel_importe: { label: 'Personnel importé', color: 'bg-blue-50 text-blue-600' },
  personnel_infos_modifiees: { label: 'Informations personnelles modifiées', color: 'bg-blue-50 text-blue-600' },
  personnel_modifie_par_rh: { label: 'Fiche modifiée par la RH', color: 'bg-blue-50 text-blue-600' },
  mot_de_passe_modifie: { label: 'Mot de passe modifié', color: 'bg-gray-100 text-gray-600' },
  mot_de_passe_reinitialise: { label: 'Mot de passe réinitialisé', color: 'bg-gray-100 text-gray-600' },
  apparence_modifiee: { label: 'Apparence modifiée', color: 'bg-gray-100 text-gray-600' },
  texte_modifie: { label: 'Texte modifié', color: 'bg-gray-100 text-gray-600' },
  parametre_carriere_modifie: { label: 'Paramètre de carrière modifié', color: 'bg-gray-100 text-gray-600' },
};

export default function Historique() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    getActivityLog(100).then(setLogs).finally(() => setLoading(false));
  }, []);

  const filtered = filterType ? logs.filter((l) => l.action_type === filterType) : logs;

  return (
    <div className="max-w-4xl mx-auto">
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

      {loading && <p className="text-gray-500 text-sm">Chargement...</p>}
      {!loading && filtered.length === 0 && (
        <p className="text-gray-400 text-sm">Aucune activité enregistrée.</p>
      )}

      <div className="space-y-2">
        {filtered.map((log) => {
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
