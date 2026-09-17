import { NavLink } from 'react-router-dom';
import { menuConfig } from '../../config/menuConfig';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionContext';

export default function Sidebar() {
  const { user } = useAuth();
  const { can, loading } = usePermissions();

  // SUPERADMIN voit le menu ADMIN_RH complet, en plus de son propre menu
  // "Administration" — cohérent avec la règle SUPERADMIN = ADMIN_RH + plus.
  const groups = user?.role === 'SUPERADMIN'
    ? [...(menuConfig.ADMIN_RH || []), ...(menuConfig.SUPERADMIN || [])]
    : menuConfig[user?.role] || [];

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col overflow-hidden bg-navy text-white">
      <div className="p-6 border-b border-white/10">
        <p className="font-bold leading-tight">UNIVERSITÉ</p>
        <p className="font-bold leading-tight">DE MAHAJANGA</p>
        <p className="text-xs text-white/60 mt-1">Gestion des Ressources Humaines</p>
      </div>

      <nav className="flex-1 p-3 space-y-4">
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
  );
}