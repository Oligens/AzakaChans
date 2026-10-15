import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, CheckCircle, CreditCard, Save, Shield, UserCircle } from 'lucide-react';
import { getCurrentUser, restoreSession } from '../services/userAuthService';

type Profile = {
  id: string; email: string; fullName: string; avatarUrl: string; phone: string;
  moncashPhone: string; natcashPhone: string; bankName: string; bankAccountNumber: string;
};

const emptyProfile: Profile = { id: '', email: '', fullName: '', avatarUrl: '', phone: '', moncashPhone: '', natcashPhone: '', bankName: '', bankAccountNumber: '' };

function field(value: unknown) { return typeof value === 'string' ? value : ''; }

export function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      await restoreSession();
      if (!getCurrentUser()) { navigate('/connexion'); return; }
      try {
        const response = await fetch('/api/user/profile', { credentials: 'same-origin' });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || 'Impossible de charger le profil.');
        const p = data.profile;
        setProfile({
          id: field(p.id), email: field(p.email), fullName: field(p.fullName), avatarUrl: field(p.avatarUrl),
          phone: field(p.phone), moncashPhone: field(p.moncashPhone), natcashPhone: field(p.natcashPhone),
          bankName: field(p.bankName), bankAccountNumber: field(p.bankAccountNumber),
        });
      } catch (e) { setError(e instanceof Error ? e.message : 'Impossible de charger le profil.'); }
      finally { setLoading(false); }
    })();
  }, [navigate]);

  const save = async () => {
    setSaving(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Enregistrement impossible.');
      setMessage('Profil enregistré avec succès.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Enregistrement impossible.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#07162E', color: '#AAB7C9' }}>Chargement du profil…</div>;

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'linear-gradient(135deg, #07162E 0%, #0B1F3A 100%)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm" style={{ color: '#AAB7C9' }}><ArrowLeft className="w-4 h-4" /> Retour</button>
          <Link to="/parametres" className="text-sm" style={{ color: '#D4AF37' }}>Paramètres</Link>
        </div>

        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] mb-2" style={{ color: '#D4AF37' }}>Mon compte</p>
          <h1 className="text-4xl font-bold" style={{ color: '#F5F0E6' }}>Mon profil</h1>
          <p className="mt-2" style={{ color: '#AAB7C9' }}>Ces informations serviront aussi à sécuriser et traiter vos demandes de retrait.</p>
        </div>

        <div className="card-premium p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
            <div className="relative">
              {profile.avatarUrl ? <img src={profile.avatarUrl} alt="Photo de profil" className="w-28 h-28 rounded-full object-cover border-2" style={{ borderColor: '#D4AF37' }} /> : <div className="w-28 h-28 rounded-full flex items-center justify-center border-2" style={{ borderColor: 'rgba(212,175,55,.35)', background: 'rgba(212,175,55,.08)' }}><UserCircle className="w-16 h-16" style={{ color: '#D4AF37' }} /></div>}
              <div className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#D4AF37', color: '#07162E' }}><Camera className="w-4 h-4" /></div>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm mb-2" style={{ color: '#AAB7C9' }}>URL de la photo de profil</label>
              <input value={profile.avatarUrl} onChange={e => setProfile({ ...profile, avatarUrl: e.target.value })} className="input-premium" placeholder="https://…/ma-photo.jpg" />
              <p className="text-xs mt-2" style={{ color: '#718198' }}>La photo est conservée comme URL sécurisée. Aucun fichier n'est stocké sur le serveur Vercel.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div><label className="block text-sm mb-2" style={{ color: '#AAB7C9' }}>Nom complet *</label><input value={profile.fullName} onChange={e => setProfile({ ...profile, fullName: e.target.value })} className="input-premium" placeholder="Jean Pierre" /></div>
            <div><label className="block text-sm mb-2" style={{ color: '#AAB7C9' }}>Adresse e-mail</label><input value={profile.email} readOnly className="input-premium opacity-70" /></div>
            <div><label className="block text-sm mb-2" style={{ color: '#AAB7C9' }}>Téléphone principal</label><input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="input-premium" placeholder="+509 37 00 00 00" /></div>
          </div>

          <div className="mt-10 pt-8 border-t" style={{ borderColor: 'rgba(212,175,55,.15)' }}>
            <div className="flex items-center gap-3 mb-5"><CreditCard className="w-5 h-5" style={{ color: '#D4AF37' }} /><div><h2 className="text-xl font-bold" style={{ color: '#F5F0E6' }}>Coordonnées de retrait</h2><p className="text-sm" style={{ color: '#718198' }}>L'administrateur utilisera ces coordonnées lors d'un retrait validé.</p></div></div>
            <div className="grid md:grid-cols-2 gap-5">
              <div><label className="block text-sm mb-2" style={{ color: '#AAB7C9' }}>Numéro MonCash</label><input type="tel" value={profile.moncashPhone} onChange={e => setProfile({ ...profile, moncashPhone: e.target.value })} className="input-premium" placeholder="+509 44 61 76 00" /></div>
              <div><label className="block text-sm mb-2" style={{ color: '#AAB7C9' }}>Numéro NatCash</label><input type="tel" value={profile.natcashPhone} onChange={e => setProfile({ ...profile, natcashPhone: e.target.value })} className="input-premium" placeholder="+509 40 24 34 34" /></div>
              <div><label className="block text-sm mb-2" style={{ color: '#AAB7C9' }}>Banque</label><input value={profile.bankName} onChange={e => setProfile({ ...profile, bankName: e.target.value })} className="input-premium" placeholder="Unibank, Sogebank…" /></div>
              <div><label className="block text-sm mb-2" style={{ color: '#AAB7C9' }}>Numéro de compte bancaire</label><input value={profile.bankAccountNumber} onChange={e => setProfile({ ...profile, bankAccountNumber: e.target.value })} className="input-premium" placeholder="Votre numéro de compte" /></div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl flex gap-3" style={{ background: 'rgba(212,175,55,.06)', border: '1px solid rgba(212,175,55,.15)' }}><Shield className="w-5 h-5 flex-shrink-0" style={{ color: '#D4AF37' }} /><p className="text-sm" style={{ color: '#AAB7C9' }}>Vos coordonnées financières sont privées. Elles ne sont affichées qu'à votre compte et pourront être consultées par les administrateurs autorisés pour traiter un retrait.</p></div>

          {error && <div className="mt-5 p-4 rounded-xl" style={{ background: 'rgba(239,68,68,.1)', color: '#FCA5A5' }}>{error}</div>}
          {message && <div className="mt-5 p-4 rounded-xl flex gap-2 items-center" style={{ background: 'rgba(34,197,94,.1)', color: '#86EFAC' }}><CheckCircle className="w-5 h-5" />{message}</div>}
          <button onClick={save} disabled={saving} className="btn-premium w-full mt-6 py-4 inline-flex items-center justify-center gap-2 disabled:opacity-50"><Save className="w-5 h-5" />{saving ? 'Enregistrement…' : 'Enregistrer mon profil'}</button>
        </div>
      </div>
    </div>
  );
}
