import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { WalletPage } from './pages/WalletPage';
import { TicketsPage } from './pages/TicketsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useEffect } from 'react';
import { loadSession } from './services/authService';

function App() {
  // Charger la session au démarrage
  useEffect(() => {
    loadSession();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Routes Publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/boutique" element={<ShopPage />} />
        <Route path="/portefeuille" element={<WalletPage />} />
        <Route path="/mes-tickets" element={<TicketsPage />} />
        
        {/* Route Admin - URL secrète */}
        <Route path="/gestion-privee/connexion" element={<AdminLoginPage />} />
        
        {/* Routes Admin Protégées */}
        <Route
          path="/gestion-privee"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Route Architecture Protégée */}
        <Route
          path="/gestion-privee/architecture"
          element={
            <ProtectedRoute requiredRole="SUPER_ADMIN">
              <ArchitecturePage />
            </ProtectedRoute>
          }
        />
        
        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
