/**
 * Routes privées des joueurs : utiliser la session utilisateur Neon,
 * et non l'authentification distincte de l'administration.
 */
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuthState, restoreSession, subscribeToAuth } from '../services/userAuthService';

interface PrivateRouteProps { children: React.ReactNode }
export function PrivateRoute({ children }: PrivateRouteProps) {
  const location = useLocation();
  const [auth, setAuth] = useState(getAuthState());
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth(state => { setAuth(state); setChecking(false); });
    restoreSession().finally(() => setChecking(false));
    return unsubscribe;
  }, []);

  if (checking) return <div className="min-h-screen flex items-center justify-center text-white" style={{ background: '#07162E' }}>Vérification de votre session…</div>;
  if (!auth.isAuthenticated || !auth.user) return <Navigate to="/connexion" state={{ from: location }} replace />;
  return <>{children}</>;
}
