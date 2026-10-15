/**
 * Route protection for administrative pages.
 * The actual identity and role are loaded from the server session cookie.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { checkAuth, hasPermission, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-deep" role="status" aria-live="polite">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-gold-400 border-t-transparent animate-spin" />
          <p className="text-text-secondary">Vérification de la session sécurisée...</p>
        </div>
      </div>
    );
  }

  if (!checkAuth()) return <Navigate to="/gestion-privee/connexion" replace />;

  if (requiredRole && !hasPermission(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-deep">
        <div className="card-premium p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-off-white mb-2">Accès refusé</h2>
          <p className="text-text-secondary mb-4">Ce compte ne possède pas les permissions nécessaires.</p>
          <button onClick={() => window.history.back()} className="btn-secondary">Retour</button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
