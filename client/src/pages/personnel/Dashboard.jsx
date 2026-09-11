import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, CalendarDays, Bell, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMyDemandes } from '../../services/congeApi';
import { getMyNotifications } from '../../services/notificationApi';

const STATUS_LABELS = {
  en_attente: { label: 'En attente', color: 'text-status-pending' },
  approuvee: { label: 'Approuvée', color: 'text-status-approved' },
  refusee: { label: 'Refusée', color: 'text-status-rejected' },
};

const roleLabels = { PE: 'Personnel Enseignant', PAT: 'Personnel Administratif et Technique' };

export default function Dashboard() {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyDemandes(), getMyNotifications()])
      .then(([d, n]) => {
        setDemandes(d);
        setNotifications(n);
      })
      .finally(() => setLoading(false));
  }, []);

  const enAttente = demandes.filter((d) => d.status === 'en_attente').length;
  const nonLues = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      {/* Bannière d'accueil */}
      <div className="bg-navy rounded-xl p-6 text-white relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none" viewBox="0 0 400 150">
          <circle cx="370" cy="10" r="90" fill="#F2B705" opacity="0.4" />
          <path d="M0 130 Q 100 100 200 130 T 400 120 L400 150 L0 150 Z" fill="#F2B705" opacity="0.5" />
        </svg>
        <div className="relative z-10">
          <h2 className="text-xl font-bold">
            Bonjour, {user?.prenom ? `${user.prenom} ${user.nom}` : user?.email} 👋
          </h2>
          <p className="text-sm text-white/70 mt-1">Découvrez tout ce qui vous concerne</p>
        </div>
      </div>

      {/* Carte profil + raccourcis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-navy text-white flex items-center justify-center text-xl font-bold">
            {(user?.prenom?.[0] || user?.email?.[0] || '?').toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-navy dark:text-gray-100">
              {user?.prenom ? `${user.prenom} ${user.nom}` : user?.email}
            </p>
            <p className="text-xs text-gray-400">{roleLabels[user?.role]}</p>
            {user?.matricule && (
              <p className="text-xs text-navy/70 dark:text-gold mt-0.5 font-medium">
                Matricule {user.matricule}
              </p>
            )}
          </div>
        </div>

        <Link to="/conges" className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 hover:shadow-md transition flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Demandes en attente</p>
            <p className="text-2xl font-bold text-navy dark:text-gold">{loading ? '—' : enAttente}</p>
          </div>
          <CalendarDays className="text-navy/40 dark:text-gold/40" size={28} />
        </Link>

        <Link to="/notifications" className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 hover:shadow-md transition flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Notifications non lues</p>
            <p className="text-2xl font-bold text-navy dark:text-gold">{loading ? '—' : nonLues}</p>
          </div>
          <Bell className="text-navy/40 dark:text-gold/40" size={28} />
        </Link>
      </div>

      {/* Raccourcis */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/profil" className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 hover:shadow-md transition">
          <User className="text-navy dark:text-gold mb-2" size={22} />
          <p className="font-medium text-navy dark:text-gray-100">Mon profil</p>
          <p className="text-xs text-gray-400 mt-1">Voir mes informations</p>
        </Link>

        <Link to="/conges" className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 hover:shadow-md transition">
          <CalendarDays className="text-navy dark:text-gold mb-2" size={22} />
          <p className="font-medium text-navy dark:text-gray-100">Congés</p>
          <p className="text-xs text-gray-400 mt-1">Faire ou suivre une demande</p>
        </Link>

        <Link to="/notifications" className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 hover:shadow-md transition">
          <Bell className="text-navy dark:text-gold mb-2" size={22} />
          <p className="font-medium text-navy dark:text-gray-100">Notifications</p>
          <p className="text-xs text-gray-400 mt-1">Messages de l'administration</p>
        </Link>
      </div>

      {/* Dernières demandes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-navy dark:text-gold">Mes dernières demandes</h3>
          <Link to="/conges" className="text-xs text-navy dark:text-gold flex items-center gap-1">
            Tout voir <ArrowRight size={12} />
          </Link>
        </div>

        {loading && <p className="text-sm text-gray-400">Chargement...</p>}
        {!loading && demandes.length === 0 && (
          <p className="text-sm text-gray-400">Aucune demande pour l'instant.</p>
        )}

        <div className="space-y-3">
          {demandes.slice(0, 3).map((d) => (
            <div key={d.id} className="flex items-center justify-between border-b last:border-0 dark:border-gray-700 pb-2">
              <div>
                <p className="text-sm font-medium text-navy dark:text-gray-100">{d.type_conge}</p>
                <p className="text-xs text-gray-400">
                  {new Date(d.date_debut).toLocaleDateString('fr-FR')} — {new Date(d.date_fin).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <span className={`text-xs font-medium ${STATUS_LABELS[d.status].color}`}>
                {STATUS_LABELS[d.status].label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}