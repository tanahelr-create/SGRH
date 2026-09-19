import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, GraduationCap, Wrench } from 'lucide-react';
import { getAdminDashboardStats } from '../../services/statsApi';
import { getRecentDemandes, getCalendarDemandes } from '../../services/congeApi';
import { getEcheancesProches } from '../../services/carriereApi';
import MiniCalendar from '../../components/Calendar';
import PageHeader from '../../components/PageHeader';
import { Skeleton, SkeletonText } from '../../components/ui/Skeleton';

const STATUS_LABELS = {
  en_attente: { label: 'En attente', color: 'text-status-pending' },
  approuvee: { label: 'Approuvée', color: 'text-status-approved' },
  refusee: { label: 'Refusée', color: 'text-status-rejected' },
};

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-lg shadow p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center text-navy">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-navy">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [calendarDemandes, setCalendarDemandes] = useState([]);
  const [echeances, setEcheances] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const now = new Date();
    Promise.all([
      getAdminDashboardStats(),
      getRecentDemandes(),
      getCalendarDemandes(now.getFullYear(), now.getMonth() + 1),
      getEcheancesProches(),
    ])
      .then(([s, r, c, e]) => {
        setStats(s);
        setRecent(r);
        setCalendarDemandes(c);
        setEcheances(e);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-status-rejected">{error}</p>;

  if (!stats) {
    return (
      <div className="space-y-6" role="status" aria-label="Chargement du tableau de bord">
        <PageHeader crumbs={[{ label: 'Admin RH' }]} title="Tableau de bord" subtitle="Vue d'ensemble des ressources humaines" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-5 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-2/3 rounded" />
                <Skeleton className="h-5 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="rounded-lg h-64" />
          <div className="bg-white rounded-lg shadow p-5">
            <Skeleton className="h-4 w-1/3 rounded mb-4" />
            <SkeletonText lines={4} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader crumbs={[{ label: 'Admin RH' }]} title="Tableau de bord" subtitle="Vue d'ensemble des ressources humaines" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Personnel total" value={stats.totalPersonnel} icon={Users} />
        <StatCard label="Enseignants (PE)" value={stats.pe} icon={GraduationCap} />
        <StatCard label="Administratif (PAT)" value={stats.pat} icon={Wrench} />
        <StatCard label="Comptes en attente" value={stats.pendingValidation} icon={UserCheck} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MiniCalendar demandes={calendarDemandes} />

        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="font-semibold text-navy mb-3">Dernières demandes</h3>
          {recent.length === 0 && <p className="text-sm text-gray-400">Aucune demande récente.</p>}
          <div className="space-y-3">
            {recent.map((d) => (
              <div key={d.id} className="border-b last:border-0 pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-navy">{d.prenom} {d.nom}</p>
                  <span className={`text-xs font-medium ${STATUS_LABELS[d.status].color}`}>
                    {STATUS_LABELS[d.status].label}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {d.type_conge} — du {new Date(d.date_debut).toLocaleDateString('fr-FR')} au {new Date(d.date_fin).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {echeances.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
          <h3 className="font-semibold text-navy dark:text-gold mb-3">Échéances de contrat (30 prochains jours)</h3>
          <div className="space-y-2">
            {echeances.map((e) => (
              <div key={e.id} className="flex items-center justify-between border-b last:border-0 dark:border-gray-700 pb-2">
                <div>
                  <p className="text-sm font-medium text-navy dark:text-gray-100">{e.prenom} {e.nom}</p>
                  <p className="text-xs text-gray-400">
                    {e.type_contrat} — échéance le {new Date(e.date_echeance_contrat).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <Link
                  to="/admin/notifications"
                  className="text-xs px-3 py-1.5 rounded-md bg-status-pending/10 text-status-pending font-medium hover:bg-status-pending/20"
                >
                  Notifier
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}