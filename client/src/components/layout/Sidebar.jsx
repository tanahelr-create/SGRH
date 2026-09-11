import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { menuConfig } from '../../config/menuConfig';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { can, loading } = usePermissions();
  const groups = menuConfig[user?.role] || [];

  return (
    <aside className="w-[4.5rem] sm:w-64 shrink-0 bg-navy min-h-screen flex flex-col text-white shadow-xl shadow-navy/10 transition-[width] duration-200">
      <div className="p-3 sm:p-6 border-b border-white/10 min-h-[5.5rem] sm:min-h-[7.25rem] flex items-center">
        <div className="hidden sm:block">
          <p className="font-bold tracking-wide leading-tight">UNIVERSITÉ</p>
          <p className="font-bold tracking-wide leading-tight">DE MAHAJANGA</p>
          <p className="text-xs text-white/60 mt-1.5">Gestion des Ressources Humaines</p>
        </div>
        <span className="sm:hidden mx-auto text-lg font-bold text-gold" aria-label="Université de Mahajanga">UM</span>
      </div>

      <nav className="flex-1 p-2 sm:p-3 space-y-4 overflow-y-auto">
        {groups.map((group, groupIndex) => {
          const items = group.items.filter(
            (item) => item.permission === null || loading || can(item.permission)
          );
          if (items.length === 0) return null;

          return (
            <div key={groupIndex}>
              {group.title && (
                <p className="hidden sm:block px-3 mb-1 text-[11px] font-semibold uppercase text-white/40 tracking-wide">
                  {group.title}
                </p>
              )}
              <div className="space-y-1">
                {items.map(({ label, path, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                      `flex items-center justify-center sm:justify-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-gold text-navy shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`
                    }
                    title={label}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className="hidden sm:inline truncate">{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="flex items-center justify-center sm:justify-start gap-3 px-3 py-3 m-2 sm:m-3 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
        title="Déconnexion"
      >
        <LogOut size={18} />
        <span className="hidden sm:inline">Déconnexion</span>
      </button>
    </aside>
  );
}
