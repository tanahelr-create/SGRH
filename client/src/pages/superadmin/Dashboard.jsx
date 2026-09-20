import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserCheck, UserX, Clock, ShieldCheck, KeyRound, Trash2,
  History, Lock, Settings, ArrowRight,
} from 'lucide-react';
import { listAccounts } from '../../services/accountAdminApi';
import { listAllPermissions } from '../../services/permissionApi';
import { getActivityLog } from '../../services/activityLogApi';
import { listCorbeille } from '../../services/corbeilleApi';
import { Card, Badge, Skeleton, SkeletonText } from '../../components/ui';
import PageHeader from '../../components/PageHeader';

const ROLES = ['SUPERADMIN', 'ADMIN_RH', 'PE', 'PAT'];
const ROLE_LABELS = { SUPERADMIN: 'Superadmin', ADMIN_RH: 'Admin RH', PE: 'PE', PAT: 'PAT' };
const CORBEILLE_TYPE_LABELS = { compte: 'Compte utilisateur' };

const QUICK_ACTIONS = [
  { label: 'Gérer les comptes', to: '/superadmin/comptes', icon: ShieldCheck },
  { label: 'Comptes en attente', to: '/admin/comptes-attente', icon: UserCheck },
  { label: 'Gérer les permissions', to: '/superadmin/permissions', icon: KeyRound },
  { label: "Consulter l'activité", to: '/admin/historique', icon: History },
  { label: 'Ouvrir la corbeille', to: '/superadmin/corbeille', icon: Trash2 },
  { label: 'Paramètres', to: '/parametres', icon: Settings },
];

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card padding="p-5" className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-navy/10 dark:bg-gold/10 flex items-center justify-center text-navy dark:text-gold shrink-0">
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{label}</p>
        <p className="text-2xl font-bold text-navy dark:text-gray-100">{value}</p>
      </div>
    </Card>
  );
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <h3 className="font-semibold text-navy dark:text-gold mb-3 flex items-center gap-2">
      <Icon size={18} /> {children}
    </h3>
  );
}

function ShortcutLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-xs font-medium text-navy dark:text-gold hover:underline mt-3"
    >
      {children} <ArrowRight size={12} />
    </Link>
  );
}

export default function SuperadminDashboard() {
  const [accounts, setAccounts] = useState(null);
  const [permissionRows, setPermissionRows] = useState(null);
  const [activity, setActivity] = useState(null);
  const [corbeille, setCorbeille] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      listAccounts(),
      listAllPermissions(),
      getActivityLog(8),
      listCorbeille(),
    ])
      .then(([acc, perms, act, corb]) => {
        setAccounts(acc);
        setPermissionRows(perms);
        setActivity(act);
        setCorbeille(corb);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div>
        <PageHeader crumbs={[{ label: 'Administration' }]} title="Tableau de bord" subtitle="Vue d'ensemble administrative et technique du SGRH" />
        <p className="text-status-rejected text-sm">{error}</p>
      </div>
    );
  }

  const loading = accounts === null;

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-label="Chargement du tableau de bord">
        <PageHeader crumbs={[{ label: 'Administration' }]} title="Tableau de bord" subtitle="Vue d'ensemble administrative et technique du SGRH" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} padding="p-5" className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-2/3 rounded" />
                <Skeleton className="h-5 w-1/3 rounded" />
              </div>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <Skeleton className="h-4 w-1/3 rounded mb-4" />
            <SkeletonText lines={5} />
          </Card>
          <Card>
            <Skeleton className="h-4 w-1/2 rounded mb-4" />
            <SkeletonText lines={4} />
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-4 w-1/2 rounded mb-4" />
              <SkeletonText lines={3} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalComptes = accounts.length;
  const actifs = accounts.filter((a) => a.status === 'active').length;
  const enAttente = accounts.filter((a) => a.status === 'pending').length;
  const inactifs = accounts.filter((a) => a.status === 'inactive').length;

  const nbPermissions = new Set(permissionRows.map((r) => r.key)).size;
  const nbAffectations = permissionRows.filter((r) => r.enabled).length;
  const affectationsParRole = ROLES.map((role) => ({
    role,
    count: permissionRows.filter((r) => r.role === role && r.enabled).length,
  }));

  const corbeilleParType = corbeille.reduce((acc, item) => {
    acc[item.type_element] = (acc[item.type_element] || 0) + 1;
    return acc;
  }, {});

  const derniereActivite = activity[0];

  return (
    <div className="space-y-6">
      <PageHeader crumbs={[{ label: 'Administration' }]} title="Tableau de bord" subtitle="Vue d'ensemble administrative et technique du SGRH" />

      {/* Ligne 1 — Comptes utilisateurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Comptes total" value={totalComptes} />
        <StatCard icon={UserCheck} label="Comptes actifs" value={actifs} />
        <StatCard icon={Clock} label="En attente" value={enAttente} />
        <StatCard icon={UserX} label="Inactifs / désactivés" value={inactifs} />
      </div>

      {/* Ligne 2 — Activité récente + Rôles & permissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-2">
          <SectionTitle icon={History}>Activité récente</SectionTitle>
          {activity.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune activité enregistrée.</p>
          ) : (
            <div className="space-y-2">
              {activity.map((log) => (
                <div key={log.id} className="flex items-start justify-between gap-3 border-b last:border-0 border-gray-100 dark:border-gray-700 pb-2">
                  <div className="min-w-0">
                    <p className="text-sm text-navy dark:text-gray-100 truncate">{log.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {log.email ? `${log.prenom || ''} ${log.nom || log.email}`.trim() : 'Système'}
                      {' — '}
                      {new Date(log.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <Badge variant="info" className="shrink-0">{log.action_type}</Badge>
                </div>
              ))}
            </div>
          )}
          <ShortcutLink to="/admin/historique">Voir le journal complet</ShortcutLink>
        </Card>

        <Card>
          <SectionTitle icon={KeyRound}>Rôles & permissions</SectionTitle>
          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <div>
              <p className="text-xl font-bold text-navy dark:text-gray-100">{ROLES.length}</p>
              <p className="text-[11px] text-gray-400">Rôles</p>
            </div>
            <div>
              <p className="text-xl font-bold text-navy dark:text-gray-100">{nbPermissions}</p>
              <p className="text-[11px] text-gray-400">Permissions</p>
            </div>
            <div>
              <p className="text-xl font-bold text-navy dark:text-gray-100">{nbAffectations}</p>
              <p className="text-[11px] text-gray-400">Affectations</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {affectationsParRole.map(({ role, count }) => (
              <div key={role} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">{ROLE_LABELS[role]}</span>
                <Badge variant="neutral">{count} permission{count > 1 ? 's' : ''}</Badge>
              </div>
            ))}
          </div>
          <ShortcutLink to="/superadmin/permissions">Gérer les permissions</ShortcutLink>
        </Card>
      </div>

      {/* Ligne 3 — Corbeille / Sécurité & système / Actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card>
          <SectionTitle icon={Trash2}>Corbeille</SectionTitle>
          <p className="text-3xl font-bold text-navy dark:text-gray-100">{corbeille.length}</p>
          <p className="text-xs text-gray-400 mb-3">élément{corbeille.length > 1 ? 's' : ''} actuellement dans la corbeille</p>
          {corbeille.length > 0 && (
            <div className="space-y-1 mb-1">
              {Object.entries(corbeilleParType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{CORBEILLE_TYPE_LABELS[type] || type}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          )}
          <ShortcutLink to="/superadmin/corbeille">Ouvrir la corbeille</ShortcutLink>
        </Card>

        <Card>
          <SectionTitle icon={Lock}>Sécurité & système</SectionTitle>
          <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-300">
            <li>
              <span className="block text-xs text-gray-400 mb-0.5">Dernière activité</span>
              {derniereActivite ? (
                <>
                  {derniereActivite.description}
                  <span className="block text-xs text-gray-400 mt-0.5">
                    {new Date(derniereActivite.created_at).toLocaleString('fr-FR')}
                  </span>
                </>
              ) : 'Aucune activité enregistrée.'}
            </li>
            <li className="flex items-center justify-between">
              <span>Comptes en attente de validation</span>
              <Badge variant={enAttente > 0 ? 'pending' : 'approved'}>{enAttente}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <span>Éléments dans la corbeille</span>
              <Badge variant={corbeille.length > 0 ? 'pending' : 'neutral'}>{corbeille.length}</Badge>
            </li>
          </ul>
          <ShortcutLink to="/admin/historique">Consulter l'audit complet</ShortcutLink>
        </Card>

        <Card>
          <SectionTitle icon={Settings}>Actions rapides</SectionTitle>
          <div className="space-y-1">
            {QUICK_ACTIONS.map(({ label, to, icon: Icon }) => (
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
