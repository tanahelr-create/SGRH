import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserRound, FileSignature, CalendarClock, Award, FileStack,
  MessageCircleQuestion, ArrowRight,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { getMyPersonnel } from '../../services/personnelApi';
import { getMesContrats } from '../../services/contratApi';
import { getMesSituations } from '../../services/situationAdministrativeApi';
import { getMaCarriere } from '../../services/carriereApi';
import { getMyDemandes } from '../../services/congeApi';
import { getMesDocuments } from '../../services/documentApi';
import { getMyNotifications } from '../../services/notificationApi';
import { Card, Badge, Skeleton, SkeletonText, EmptyState } from '../../components/ui';
import { RH_ASSISTANT_QUESTIONS, answerRhQuestion } from '../../utils/rhAssistant';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
function photoUrl(photo) {
  if (!photo) return null;
  return `${API_URL.replace(/\/api\/?$/, '')}${photo}`;
}

const STATUT_CONTRAT_LABELS = {
  actif: 'Actif', expire: 'Expiré', renouvele: 'Renouvelé', non_renouvele: 'Non renouvelé', resilie: 'Résilié',
};
const STATUT_CONTRAT_BADGE = {
  actif: 'approved', renouvele: 'approved', expire: 'rejected', resilie: 'rejected', non_renouvele: 'neutral',
};
const CONGE_STATUS_LABELS = { en_attente: 'En attente', approuvee: 'Approuvée', refusee: 'Refusée' };
const DOCUMENT_TYPE_LABELS = { certificat_administratif: 'Certificat administratif', lettre_confirmation: 'Lettre de confirmation' };

const QUICK_LINKS = [
  { label: 'Mon profil', to: '/profil', icon: UserRound },
  { label: 'Ma carrière', to: '/carriere', icon: Award },
  { label: 'Mes contrats', to: '/mes-contrats', icon: FileSignature },
  { label: 'Mes congés', to: '/conges', icon: CalendarClock },
  { label: 'Mes documents', to: '/mes-documents', icon: FileStack },
];

const ASSISTANT_CATEGORIES = [...new Set(RH_ASSISTANT_QUESTIONS.map((q) => q.category))];

function contratActuel(contrats) {
  if (!contrats?.length) return null;
  return contrats.find((c) => c.statut === 'actif') || contrats[0];
}

function joursRestants(dateFin) {
  const diffMs = new Date(dateFin).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(diffMs / 86400000);
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Chargement du tableau de bord">
      <PageHeader crumbs={[{ label: 'Mon espace' }]} title="Tableau de bord" subtitle="Vue d'ensemble de votre espace personnel" />
      <Skeleton className="h-24 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} padding="p-5">
            <Skeleton className="h-3 w-1/2 rounded mb-3" />
            <Skeleton className="h-5 w-2/3 rounded" />
          </Card>
        ))}
      </div>
      <Card>
        <Skeleton className="h-4 w-1/4 rounded mb-4" />
        <SkeletonText lines={3} />
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <Skeleton className="h-4 w-1/3 rounded mb-4" />
          <SkeletonText lines={4} />
        </Card>
        <Card>
          <Skeleton className="h-4 w-1/2 rounded mb-4" />
          <SkeletonText lines={3} />
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [assistantKey, setAssistantKey] = useState(null);

  useEffect(() => {
    Promise.all([
      getMyPersonnel(),
      getMesContrats(),
      getMesSituations(),
      getMaCarriere(),
      getMyDemandes(),
      getMesDocuments(),
      getMyNotifications(),
    ])
      .then(([personnel, contratsRes, situations, carriere, demandes, documents, notifications]) => {
        setData({
          personnel,
          contrats: contratsRes?.contrats || [],
          situations,
          carriere,
          demandes: demandes || [],
          documents: documents || [],
          notifications: notifications || [],
        });
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div>
        <PageHeader crumbs={[{ label: 'Mon espace' }]} title="Tableau de bord" subtitle="Vue d'ensemble de votre espace personnel" />
        <p className="text-status-rejected text-sm">{error}</p>
      </div>
    );
  }

  if (!data) return <DashboardSkeleton />;

  const { personnel, contrats, situations, carriere, demandes, documents, notifications } = data;

  if (!personnel) {
    return (
      <div>
        <PageHeader crumbs={[{ label: 'Mon espace' }]} title="Tableau de bord" subtitle="Vue d'ensemble de votre espace personnel" />
        <EmptyState title="Aucune fiche personnel associée à votre compte." description="Contactez le service RH si cela vous semble anormal." />
      </div>
    );
  }

  const contrat = contratActuel(contrats);
  const jours = contrat?.date_fin ? joursRestants(contrat.date_fin) : null;
  const indice = personnel.indice || (personnel.indice_num ? String(personnel.indice_num) : null);

  const activite = [
    situations?.actuelle && {
      key: 'situation', to: '/carriere', date: situations.actuelle.date_debut,
      label: `Situation administrative : ${situations.actuelle.libelle}`,
    },
    carriere?.timeline?.[0] && {
      key: 'carriere', to: '/carriere', date: carriere.timeline[0].date,
      label: `Carrière : ${carriere.timeline[0].type}`,
    },
    demandes[0] && {
      key: 'conge', to: '/conges', date: demandes[0].created_at || demandes[0].date_debut,
      label: `Congé ${demandes[0].type_conge} — ${CONGE_STATUS_LABELS[demandes[0].status] || demandes[0].status}`,
    },
    documents[0] && {
      key: 'document', to: `/documents/${documents[0].id}`, date: documents[0].genere_le,
      label: `Document généré : ${DOCUMENT_TYPE_LABELS[documents[0].type_document] || documents[0].type_document}`,
    },
    notifications[0] && {
      key: 'notification', to: '/notifications', date: notifications[0].created_at,
      label: notifications[0].title,
    },
  ].filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader crumbs={[{ label: 'Mon espace' }]} title="Tableau de bord" subtitle="Vue d'ensemble de votre espace personnel" />

      {/* En-tête personnel */}
      <div className="bg-navy rounded-xl p-6 text-white relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none" viewBox="0 0 400 150">
          <circle cx="370" cy="10" r="90" fill="#F2B705" opacity="0.4" />
          <path d="M0 130 Q 100 100 200 130 T 400 120 L400 150 L0 150 Z" fill="#F2B705" opacity="0.5" />
        </svg>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/10 overflow-hidden flex items-center justify-center text-xl font-bold shrink-0">
            {personnel.photo_profil ? (
              <img src={photoUrl(personnel.photo_profil)} alt="" className="w-full h-full object-cover" />
            ) : (
              (personnel.prenom?.[0] || personnel.email?.[0] || '?').toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">Bonjour, {personnel.prenom || personnel.email} 👋</h2>
            <p className="text-sm text-white/70 mt-1">Voici un aperçu de votre situation administrative.</p>
          </div>
        </div>
      </div>

      {/* Cartes de synthèse */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="p-5">
          <p className="text-xs text-gray-400 mb-1">Situation administrative</p>
          {situations?.actuelle ? (
            <>
              <p className="text-lg font-bold text-navy dark:text-gray-100 truncate">{situations.actuelle.libelle}</p>
              <p className="text-xs text-gray-400 mt-1">
                Depuis le {new Date(situations.actuelle.date_debut).toLocaleDateString('fr-FR')}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400">Aucune situation enregistrée</p>
          )}
        </Card>

        <Card padding="p-5">
          <p className="text-xs text-gray-400 mb-1">Contrat actuel</p>
          {contrat ? (
            <>
              <p className="text-lg font-bold text-navy dark:text-gray-100 truncate">{contrat.type_contrat}</p>
              <Badge variant={STATUT_CONTRAT_BADGE[contrat.statut] || 'neutral'} className="mt-1.5">
                {STATUT_CONTRAT_LABELS[contrat.statut] || contrat.statut}
              </Badge>
            </>
          ) : (
            <p className="text-sm text-gray-400">Aucun contrat enregistré</p>
          )}
        </Card>

        <Card padding="p-5">
          <p className="text-xs text-gray-400 mb-1">Échéance</p>
          {!contrat ? (
            <p className="text-sm text-gray-400">Aucun contrat enregistré</p>
          ) : !contrat.date_fin ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Sans date d'échéance</p>
          ) : jours < 0 ? (
            <>
              <p className="text-lg font-bold text-status-rejected">{new Date(contrat.date_fin).toLocaleDateString('fr-FR')}</p>
              <p className="text-xs text-status-rejected mt-1">Contrat expiré</p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-navy dark:text-gray-100">{new Date(contrat.date_fin).toLocaleDateString('fr-FR')}</p>
              <p className="text-xs text-gray-400 mt-1">{jours} jour{jours > 1 ? 's' : ''} restant{jours > 1 ? 's' : ''}</p>
            </>
          )}
        </Card>

        <Card padding="p-5">
          <p className="text-xs text-gray-400 mb-1">Indice actuel</p>
          {indice ? (
            <p className="text-lg font-bold text-navy dark:text-gray-100">{indice}</p>
          ) : (
            <p className="text-sm text-gray-400">Non renseigné</p>
          )}
        </Card>
      </div>

      {/* Assistant RH */}
      <Card>
        <div className="flex items-center gap-2 mb-1">
          <MessageCircleQuestion size={18} className="text-navy dark:text-gold" />
          <h3 className="font-semibold text-navy dark:text-gold">Assistant RH</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Choisissez une question pour obtenir rapidement une information sur votre situation.
        </p>

        {ASSISTANT_CATEGORIES.map((cat) => (
          <div key={cat} className="mb-3 last:mb-0">
            <p className="text-[11px] font-semibold uppercase text-gray-400 mb-1.5">{cat}</p>
            <div className="flex flex-wrap gap-2">
              {RH_ASSISTANT_QUESTIONS.filter((q) => q.category === cat).map((q) => (
                <button
                  key={q.key}
                  type="button"
                  onClick={() => setAssistantKey(q.key)}
                  aria-pressed={assistantKey === q.key}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    assistantKey === q.key
                      ? 'bg-navy text-white border-navy dark:bg-gold dark:text-navy dark:border-gold'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-navy dark:hover:border-gold'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {assistantKey && (
          <div className="mt-4 bg-navy/5 dark:bg-gold/5 rounded-md p-4" role="status">
            <p className="text-xs text-gray-400 mb-1">
              {RH_ASSISTANT_QUESTIONS.find((q) => q.key === assistantKey)?.label}
            </p>
            <p className="text-sm text-navy dark:text-gray-100">
              {answerRhQuestion(assistantKey, data)}
            </p>
          </div>
        )}
      </Card>

      {/* Activité récente + Accès rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-navy dark:text-gold mb-3">Activité récente</h3>
          {activite.length === 0 ? (
            <EmptyState title="Aucune activité récente." />
          ) : (
            <div className="space-y-1">
              {activite.map((item) => (
                <Link
                  key={item.key}
                  to={item.to}
                  className="flex items-center justify-between gap-3 px-2 -mx-2 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-navy dark:text-gray-100 truncate">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(item.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-navy dark:text-gold mb-3">Accès rapides</h3>
          <div className="space-y-1">
            {QUICK_LINKS.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <Icon size={16} className="text-navy dark:text-gold shrink-0" />
                {label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
