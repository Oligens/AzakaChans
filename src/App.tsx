import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminJackpotPage } from './pages/AdminJackpotPage';
import { AdminPlatformPage } from './pages/AdminPlatformPage';
import { AdminSeriesTicketsPage } from './pages/AdminSeriesTicketsPage';
import { AdminDrawPage } from './pages/AdminDrawPage';
import { AdminFinancialEnginePage } from './pages/AdminFinancialEnginePage';
import { AdminLedgerPage } from './pages/AdminLedgerPage';
import { AdminWithdrawalsPage } from './pages/AdminWithdrawalsPage';
import { AdminClaimsPage } from './pages/AdminClaimsPage';
import { AdminCyclesPage } from './pages/AdminCyclesPage';
import { AdminTestsPage } from './pages/AdminTestsPage';
import { AdminReportsPage } from './pages/AdminReportsPage';
import { AdminAuditPage } from './pages/AdminAuditPage';
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
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PrivateRoute } from './components/PrivateRoute';
import { useEffect, type ReactNode } from 'react';
import { loadSession } from './services/authService';
import { restoreSession } from './services/userAuthService';

function App() {
  useEffect(() => { loadSession(); restoreSession(); }, []);
  const admin = (element: ReactNode) => <ProtectedRoute requiredRole="ADMIN">{element}</ProtectedRoute>;
  return <BrowserRouter><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/inscription" element={<RegisterPage />} /><Route path="/verification-email" element={<VerifyEmailPage />} /><Route path="/connexion" element={<LoginPage />} />
    <Route path="/aide" element={<HelpPage />} /><Route path="/contact" element={<ContactPage />} /><Route path="/faq" element={<FAQPage />} /><Route path="/conditions-utilisation" element={<TermsPage />} /><Route path="/confidentialite" element={<PrivacyPage />} /><Route path="/jeu-responsable" element={<ResponsibleGamingPage />} />
    <Route path="/profil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} /><Route path="/parametres" element={<PrivateRoute><SettingsPage /></PrivateRoute>} /><Route path="/boutique" element={<PrivateRoute><ShopPage /></PrivateRoute>} /><Route path="/portefeuille" element={<PrivateRoute><WalletPage /></PrivateRoute>} /><Route path="/mes-tickets" element={<PrivateRoute><TicketsPage /></PrivateRoute>} /><Route path="/retrait" element={<PrivateRoute><WithdrawalPage /></PrivateRoute>} />
    <Route path="/gestion-privee/connexion" element={<AdminLoginPage />} />
    <Route path="/gestion-privee" element={admin(<AdminDashboard />)} />
    <Route path="/gestion-privee/jackpot" element={admin(<AdminJackpotPage />)} />
    <Route path="/gestion-privee/plateforme" element={admin(<AdminPlatformPage />)} />
    <Route path="/gestion-privee/series-tickets" element={admin(<AdminSeriesTicketsPage />)} />
    <Route path="/gestion-privee/tirage" element={admin(<AdminDrawPage />)} />
    <Route path="/gestion-privee/moteur-financier" element={admin(<AdminFinancialEnginePage />)} />
    <Route path="/gestion-privee/registre-comptable" element={admin(<AdminLedgerPage />)} />
    <Route path="/gestion-privee/retraits" element={admin(<AdminWithdrawalsPage />)} />
    <Route path="/gestion-privee/reclamations" element={admin(<AdminClaimsPage />)} />
    <Route path="/gestion-privee/cycles-horaires" element={admin(<AdminCyclesPage />)} />
    <Route path="/gestion-privee/tests" element={admin(<AdminTestsPage />)} />
    <Route path="/gestion-privee/rapports" element={admin(<AdminReportsPage />)} />
    <Route path="/gestion-privee/audit" element={admin(<AdminAuditPage />)} />
    <Route path="/gestion-privee/architecture" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><ArchitecturePage /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}
export default App;
