import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminJackpotPage } from './pages/AdminJackpotPage';
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
import { useEffect } from 'react';
import { loadSession } from './services/authService';
import { restoreSession } from './services/userAuthService';

function AdminModule({ title, description }: { title:string; description:string }) {
  return <div className="min-h-screen p-8" style={{background:'linear-gradient(135deg,#07162E 0%,#0B1F3A 100%)',color:'#F5F0E6'}}><div className="max-w-5xl mx-auto"><a href="/gestion-privee" className="text-sm" style={{color:'#AAB7C9'}}>← Retour au tableau de bord</a><div className="card-premium p-10 mt-6"><h1 className="text-3xl font-bold">{title}</h1><p className="mt-3" style={{color:'#AAB7C9'}}>{description}</p><p className="mt-6 text-sm" style={{color:'#D4AF37'}}>Module sécurisé — branchement aux données opérationnelles en cours.</p></div></div></div>;
}

function App() {
  useEffect(() => { loadSession(); restoreSession(); }, []);
  const admin = (element: React.ReactNode) => <ProtectedRoute requiredRole="ADMIN">{element}</ProtectedRoute>;
  return <BrowserRouter><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/inscription" element={<RegisterPage />} /><Route path="/verification-email" element={<VerifyEmailPage />} /><Route path="/connexion" element={<LoginPage />} />
    <Route path="/aide" element={<HelpPage />} /><Route path="/contact" element={<ContactPage />} /><Route path="/faq" element={<FAQPage />} /><Route path="/conditions-utilisation" element={<TermsPage />} /><Route path="/confidentialite" element={<PrivacyPage />} /><Route path="/jeu-responsable" element={<ResponsibleGamingPage />} />
    <Route path="/profil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} /><Route path="/parametres" element={<PrivateRoute><SettingsPage /></PrivateRoute>} /><Route path="/boutique" element={<PrivateRoute><ShopPage /></PrivateRoute>} /><Route path="/portefeuille" element={<PrivateRoute><WalletPage /></PrivateRoute>} /><Route path="/mes-tickets" element={<PrivateRoute><TicketsPage /></PrivateRoute>} /><Route path="/retrait" element={<PrivateRoute><WithdrawalPage /></PrivateRoute>} />
    <Route path="/gestion-privee/connexion" element={<AdminLoginPage />} />
    <Route path="/gestion-privee" element={admin(<AdminDashboard />)} />
    <Route path="/gestion-privee/jackpot" element={admin(<AdminJackpotPage />)} />
    <Route path="/gestion-privee/plateforme" element={admin(<AdminModule title="État Plateforme" description="Surveillance des services, santé de la plateforme et disponibilité." />)} />
    <Route path="/gestion-privee/series-tickets" element={admin(<AdminModule title="Séries & Tickets" description="Gestion des séries, lots, tickets publiés et états opérationnels." />)} />
    <Route path="/gestion-privee/moteur-financier" element={admin(<AdminModule title="Moteur Financier" description="Supervision des flux financiers et règles de couverture." />)} />
    <Route path="/gestion-privee/registre-comptable" element={admin(<AdminModule title="Registre Comptable" description="Consultation du registre comptable et des écritures de la plateforme." />)} />
    <Route path="/gestion-privee/retraits" element={admin(<AdminDashboard />)} />
    <Route path="/gestion-privee/reclamations" element={admin(<AdminModule title="Réclamations" description="Gestion et suivi des réclamations utilisateurs." />)} />
    <Route path="/gestion-privee/cycles-horaires" element={admin(<AdminModule title="Cycles Horaires" description="Configuration et supervision des cycles horaires." />)} />
    <Route path="/gestion-privee/tests" element={admin(<AdminModule title="Tests Automatisés" description="Exécution et suivi des contrôles automatisés de la plateforme." />)} />
    <Route path="/gestion-privee/rapports" element={admin(<AdminModule title="Rapports" description="Rapports opérationnels, financiers et statistiques." />)} />
    <Route path="/gestion-privee/audit" element={admin(<AdminModule title="Audit & Sécurité" description="Journal d'audit, contrôles de sécurité et traçabilité des opérations." />)} />
    <Route path="/gestion-privee/architecture" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><ArchitecturePage /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}
export default App;
