/**
 * PROTECTED ROUTE - ChansAyiti
 * 
 * Composant de protection des routes privilégiées.
 * Vérifie l'authentification et les permissions avant d'afficher le contenu.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { checkAuth, hasPermission } = useAuth();

  // Vérifier l'authentification
  if (!checkAuth()) {
    return <Navigate to="/gestion-privee/connexion" replace />;
  }

  // Vérifier les permissions si un rôle est requis
  if (requiredRole && !hasPermission(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-deep">
        <div className="card-premium p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-off-white mb-2">Accès Refusé</h2>
          <p className="text-text-secondary mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
