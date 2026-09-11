import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionContext';

export default function ProtectedRoute({ children, allowedRoles = [], permission = null }) {
  const { user, loading } = useAuth();
  const { can, loading: permissionsLoading } = usePermissions();

  if (loading || permissionsLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  if (permission && !can(permission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <p className="text-status-rejected font-medium mb-2">Accès non autorisé</p>
          <p className="text-sm text-gray-500">
            Votre rôle ne dispose pas de la permission nécessaire pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  return children;
}