/**
 * PRIVATE ROUTE - AZAKA CHANS
 * 
 * Composant de protection des routes privées pour les utilisateurs connectés.
 * Vérifie que l'utilisateur est authentifié avant d'afficher le contenu.
 * Redirige vers la page de connexion si l'utilisateur n'est pas connecté.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/authService';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Si l'utilisateur n'est pas connecté, rediriger vers la connexion
  // avec l'URL de retour pour pouvoir revenir après connexion
  if (!isAuthenticated) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  // L'utilisateur est connecté, afficher le contenu
  return <>{children}</>;
}
