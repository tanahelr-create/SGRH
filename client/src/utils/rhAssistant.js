// Assistant RH du dashboard personnel : pas d'IA, pas d'appel réseau
// supplémentaire. Chaque question est une clé interne qui lit les données déjà
// chargées par le dashboard (elles-mêmes issues des endpoints /me existants,
// donc déjà isolées au personnel connecté côté backend). Réponse = texte court
// généré à partir de données réelles, jamais inventé.

export const RH_ASSISTANT_QUESTIONS = [
  { key: 'CONTRACT_CURRENT', category: 'Contrat', label: 'Quel est mon contrat actuel ?' },
  { key: 'CONTRACT_EXPIRATION', category: 'Contrat', label: 'Quand mon contrat expire-t-il ?' },
  { key: 'CONTRACT_STATUS', category: 'Contrat', label: 'Mon contrat est-il actuellement actif ?' },
  { key: 'LEAVE_BALANCE', category: 'Congés', label: 'Combien de jours de congés me reste-t-il ?' },
  { key: 'LEAVE_LAST_REQUEST', category: 'Congés', label: 'Où en est ma dernière demande de congé ?' },
  { key: 'LEAVE_UPCOMING', category: 'Congés', label: 'Ai-je des congés à venir ?' },
  { key: 'CURRENT_SITUATION', category: 'Situation / carrière', label: 'Quelle est ma situation administrative actuelle ?' },
  { key: 'CURRENT_INDEX', category: 'Situation / carrière', label: 'Quel est mon indice actuel ?' },
  { key: 'LAST_CAREER_EVENT', category: 'Situation / carrière', label: 'Quelle est ma dernière évolution de carrière ?' },
  { key: 'DOCUMENTS', category: 'Documents', label: 'Quels sont mes documents disponibles ?' },
];

const STATUT_CONTRAT_LABELS = {
  actif: 'actif', expire: 'expiré', renouvele: 'renouvelé', non_renouvele: 'non renouvelé', resilie: 'résilié',
};
const CONGE_STATUS_LABELS = { en_attente: 'en attente', approuvee: 'approuvée', refusee: 'refusée' };

function fmt(date) {
  return date ? new Date(date).toLocaleDateString('fr-FR') : null;
}

function joursRestants(dateFin) {
  const diffMs = new Date(dateFin).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function contratActuel(contrats) {
  if (!contrats?.length) return null;
  return contrats.find((c) => c.statut === 'actif') || contrats[0];
}

export function answerRhQuestion(key, { personnel, contrats, situations, carriere, demandes, documents, solde: soldeConges }) {
  switch (key) {
    case 'CONTRACT_CURRENT': {
      const c = contratActuel(contrats);
      if (!c) return "Vous n'avez aucun contrat enregistré.";
      return `Votre contrat actuel est un contrat ${c.type_contrat}, débuté le ${fmt(c.date_debut)}.`;
    }
    case 'CONTRACT_EXPIRATION': {
      const c = contratActuel(contrats);
      if (!c) return "Vous n'avez aucun contrat enregistré.";
      if (!c.date_fin) return `Votre contrat ${c.type_contrat} n'a pas de date d'échéance renseignée.`;
      const jours = joursRestants(c.date_fin);
      if (jours < 0) return `Votre contrat ${c.type_contrat} est arrivé à échéance le ${fmt(c.date_fin)}.`;
      return `Votre contrat ${c.type_contrat} arrive à échéance le ${fmt(c.date_fin)}. Il reste ${jours} jour${jours > 1 ? 's' : ''}.`;
    }
    case 'CONTRACT_STATUS': {
      const c = contratActuel(contrats);
      if (!c) return "Vous n'avez aucun contrat enregistré.";
      return `Votre contrat ${c.type_contrat} est actuellement ${STATUT_CONTRAT_LABELS[c.statut] || c.statut}.`;
    }
    case 'LEAVE_BALANCE': {
      const enAttente = (demandes || []).filter((d) => d.status === 'en_attente').length;
      const solde = soldeConges?.soldeDisponible;
      if (solde === null || solde === undefined) return "Votre solde de congés n'est pas renseigné.";
      return `Votre solde actuel est de ${Number(solde).toLocaleString('fr-FR')} jour${solde > 1 ? 's' : ''}.${enAttente > 0 ? ` Vous avez ${enAttente} demande${enAttente > 1 ? 's' : ''} en attente.` : ''}`;
    }
    case 'LEAVE_LAST_REQUEST': {
      const d = demandes?.[0];
      if (!d) return "Vous n'avez fait aucune demande de congé.";
      return `Votre dernière demande (${d.type_conge}, du ${fmt(d.date_debut)} au ${fmt(d.date_fin)}) est ${CONGE_STATUS_LABELS[d.status] || d.status}.`;
    }
    case 'LEAVE_UPCOMING': {
      const today = new Date();
      const upcoming = (demandes || [])
        .filter((d) => d.status !== 'refusee' && new Date(d.date_fin) >= today)
        .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut));
      if (upcoming.length === 0) return "Vous n'avez aucun congé à venir.";
      const next = upcoming[0];
      return `Oui : votre prochain congé (${next.type_conge}) est du ${fmt(next.date_debut)} au ${fmt(next.date_fin)} (${CONGE_STATUS_LABELS[next.status] || next.status}).`;
    }
    case 'CURRENT_SITUATION': {
      const s = situations?.actuelle;
      if (!s) return "Aucune situation administrative n'est enregistrée.";
      return `Votre situation administrative actuelle est : ${s.libelle}, depuis le ${fmt(s.date_debut)}.`;
    }
    case 'CURRENT_INDEX': {
      const indice = personnel?.indice || (personnel?.indice_num ? String(personnel.indice_num) : null);
      if (!indice) return "Votre indice n'est pas renseigné.";
      return `Votre indice actuel est ${indice}.`;
    }
    case 'LAST_CAREER_EVENT': {
      const item = carriere?.timeline?.[0];
      if (!item) return "Aucun événement de carrière n'est enregistré.";
      return `Votre dernière évolution de carrière est : ${item.type} (${fmt(item.date)}).`;
    }
    case 'DOCUMENTS': {
      const list = documents || [];
      if (list.length === 0) return "Vous n'avez aucun document disponible.";
      return `Vous avez ${list.length} document${list.length > 1 ? 's' : ''} disponible${list.length > 1 ? 's' : ''}, le plus récent daté du ${fmt(list[0].genere_le)}.`;
    }
    default:
      return "Cette information n'est pas disponible.";
  }
}
