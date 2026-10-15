import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Lock, LogOut, Shield, UserRound } from 'lucide-react';
import { logoutUser } from '../services/userAuthService';

export function SettingsPage() {
  const navigate = useNavigate();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    await logoutUser();
    navigate('/');
  };

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'linear-gradient(135deg, #07162E 0%, #0B1F3A 100%)' }}>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm mb-8" style={{ color: '#AAB7C9' }}><ArrowLeft className="w-4 h-4" /> Retour</button>
        <p className="text-sm uppercase tracking-[0.2em] mb-2" style={{ color: '#D4AF37' }}>Mon compte</p>
        <h1 className="text-4xl font-bold" style={{ color: '#F5F0E6' }}>Paramètres</h1>
        <p className="mt-2 mb-8" style={{ color: '#AAB7C9' }}>Gérez votre profil, vos préférences et la sécurité de votre compte.</p>

        <div className="space-y-5">
          <div className="card-premium p-6">
            <h2 className="font-bold text-lg mb-4" style={{ color: '#F5F0E6' }}>Compte</h2>
            <Link to="/profil" className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition" style={{ border: '1px solid rgba(170,183,201,.12)' }}>
              <div className="flex items-center gap-4"><UserRound className="w-5 h-5" style={{ color: '#D4AF37' }} /><div><p className="font-medium" style={{ color: '#F5F0E6' }}>Profil personnel</p><p className="text-sm" style={{ color: '#718198' }}>Nom, photo et coordonnées de retrait</p></div></div><span style={{ color: '#D4AF37' }}>›</span>
            </Link>
          </div>

          <div className="card-premium p-6">
            <h2 className="font-bold text-lg mb-4" style={{ color: '#F5F0E6' }}>Sécurité</h2>
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ border: '1px solid rgba(170,183,201,.12)' }}>
              <div className="flex items-center gap-4"><Lock className="w-5 h-5" style={{ color: '#D4AF37' }} /><div><p className="font-medium" style={{ color: '#F5F0E6' }}>Session sécurisée</p><p className="text-sm" style={{ color: '#718198' }}>Votre session utilise un cookie HttpOnly.</p></div></div><Shield className="w-5 h-5" style={{ color: '#86EFAC' }} />
            </div>
            <p className="text-sm mt-4" style={{ color: '#718198' }}>Le changement de mot de passe sera ajouté dans la prochaine étape de la gestion du compte.</p>
          </div>

          <div className="card-premium p-6">
            <div className="flex items-center gap-3 mb-4"><Bell className="w-5 h-5" style={{ color: '#D4AF37' }} /><h2 className="font-bold text-lg" style={{ color: '#F5F0E6' }}>Notifications</h2></div>
            <label className="flex items-center justify-between py-3"><div><p className="font-medium" style={{ color: '#F5F0E6' }}>Notifications de compte</p><p className="text-sm" style={{ color: '#718198' }}>Alertes liées à vos opérations et votre compte.</p></div><input type="checkbox" checked={emailAlerts} onChange={e => setEmailAlerts(e.target.checked)} className="w-5 h-5 accent-[#D4AF37]" /></label>
            <label className="flex items-center justify-between py-3"><div><p className="font-medium" style={{ color: '#F5F0E6' }}>Alertes de sécurité</p><p className="text-sm" style={{ color: '#718198' }}>Connexions et événements importants.</p></div><input type="checkbox" checked={securityAlerts} onChange={e => setSecurityAlerts(e.target.checked)} className="w-5 h-5 accent-[#D4AF37]" /></label>
          </div>

          <div className="card-premium p-6"><button onClick={logout} disabled={busy} className="w-full py-3 rounded-xl border flex items-center justify-center gap-2" style={{ borderColor: 'rgba(239,68,68,.3)', color: '#FCA5A5' }}><LogOut className="w-5 h-5" />{busy ? 'Déconnexion…' : 'Se déconnecter'}</button></div>
        </div>
      </div>
    </div>
  );
}
