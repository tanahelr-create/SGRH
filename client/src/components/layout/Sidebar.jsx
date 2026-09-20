import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { menuConfig } from '../../config/menuConfig';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionContext';

export default function Sidebar({ open = false, onClose = () => {} }) {
  const { user } = useAuth();
  const { can, loading } = usePermissions();

  // SUPERADMIN voit le menu ADMIN_RH complet, en plus de son propre menu
  // "Administration" — cohérent avec la règle SUPERADMIN = ADMIN_RH + plus.
  // Le lien "Tableau de bord" pointe vers le dashboard dédié SUPERADMIN
  // (/superadmin/dashboard) plutôt que celui d'ADMIN_RH — même position dans le
  // menu, même libellé, pas d'entrée en double.
  const groups = user?.role === 'SUPERADMIN'
    ? [
        ...(menuConfig.ADMIN_RH || []).map((group) => ({
          ...group,
          items: group.items.map((item) =>
            item.path === '/admin/dashboard' ? { ...item, path: '/superadmin/dashboard' } : item
          ),
        })),
        ...(menuConfig.SUPERADMIN || []),
      ]
    : menuConfig[user?.role] || [];

  return (
    <>
      {/* Sous lg : la sidebar est un tiroir superposé, fermé par défaut. À partir de
          lg, elle redevient statique (comportement historique inchangé). */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 shrink-0 flex-col overflow-hidden bg-navy text-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between gap-2 p-6 border-b border-white/10">
          <div className="min-w-0">
            <p className="font-bold leading-tight">UNIVERSITÉ</p>
            <p className="font-bold leading-tight">DE MAHAJANGA</p>
            <p className="text-xs text-white/60 mt-1">Gestion des Ressources Humaines</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="shrink-0 rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {groups.map((group, groupIndex) => {
            const items = group.items.filter((item) => {
              const permOk = item.permission === null || loading || can(item.permission);
              const conditionOk = !item.showIf || item.showIf(user);
              return permOk && conditionOk;
            });
            if (items.length === 0) return null;

            return (
              <div key={groupIndex}>
                {group.title && (
                  <p className="px-3 mb-1 text-[11px] font-semibold uppercase text-white/40 tracking-wide">
                    {group.title}
                  </p>
                )}
                <div className="space-y-1">
                  {items.map(({ label, path, icon: Icon }) => (
                    <NavLink
                      key={path}
                      to={path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                          isActive ? 'bg-gold text-navy' : 'text-white/80 hover:bg-white/10'
                        }`
                      }
                    >
                      <Icon size={18} />
                      {label}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}