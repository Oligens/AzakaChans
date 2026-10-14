import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { WalletPage } from './pages/WalletPage';
import { TicketsPage } from './pages/TicketsPage';
import { WithdrawalPage } from './pages/WithdrawalPage';
import { HelpPage } from './pages/HelpPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ResponsibleGamingPage } from './pages/ResponsibleGamingPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PrivateRoute } from './components/PrivateRoute';
import { useEffect } from 'react';
import { loadSession } from './services/authService';
import { restoreSession } from './services/userAuthService';

function App() {
  // Charger la session au démarrage
  useEffect(() => {
    loadSession();
    restoreSession(); // Restaurer la session utilisateur
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Routes Publiques - Accessibles sans connexion */}
        <Route path="/" element={<HomePage />} />
        
        {/* Authentification Utilisateur */}
        <Route path="/inscription" element={<RegisterPage />} />
        <Route path="/verification-email" element={<VerifyEmailPage />} />
        <Route path="/connexion" element={<LoginPage />} />
        
        {/* Pages Informatives - Accessibles sans connexion */}
        <Route path="/aide" element={<HelpPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/conditions-utilisation" element={<TermsPage />} />
        <Route path="/confidentialite" element={<PrivacyPage />} />
        <Route path="/jeu-responsable" element={<ResponsibleGamingPage />} />
        
        {/* Routes Privées - Réservées aux utilisateurs connectés */}
        <Route path="/boutique" element={
          <PrivateRoute>
            <ShopPage />
          </PrivateRoute>
        } />
        <Route path="/portefeuille" element={
          <PrivateRoute>
            <WalletPage />
          </PrivateRoute>
        } />
        <Route path="/mes-tickets" element={
          <PrivateRoute>
            <TicketsPage />
          </PrivateRoute>
        } />
        <Route path="/retrait" element={
          <PrivateRoute>
            <WithdrawalPage />
          </PrivateRoute>
        } />
        
        {/* Route Admin - URL secrète */}
        <Route path="/gestion-privee/connexion" element={<AdminLoginPage />} />
        
        {/* Routes Admin Protégées - Réservées aux administrateurs */}
        <Route
          path="/gestion-privee"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Route Architecture Protégée - Réservée aux super administrateurs */}
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
