import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authService';
import { Lock, Mail, AlertCircle, Loader2, Eye, EyeOff, Shield } from 'lucide-react';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, checkAuth, error, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Si déjà connecté, rediriger
  if (checkAuth()) {
    navigate('/gestion-privee', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const result = await login(email, password);
    if (result.success) {
      navigate('/gestion-privee', { replace: true });
    } else {
      setLocalError(result.error || 'Erreur de connexion');
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #07162E 0%, #0B1F3A 100%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F2D675 100%)' }}>
            <Shield className="w-8 h-8" style={{ color: '#07162E' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#F5F0E6' }}>
            Espace Administration
          </h1>
          <p className="text-sm mt-2" style={{ color: '#AAB7C9' }}>
            ChansAyiti - Accès sécurisé
          </p>
        </div>

        {/* Formulaire */}
        <div className="card-premium p-8 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#AAB7C9' }}>
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#AAB7C9' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-premium pl-10"
                  placeholder="admin@chansayiti.ht"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#AAB7C9' }}>
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#AAB7C9' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium pl-10 pr-10"
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" style={{ color: '#AAB7C9' }} />
                  ) : (
                    <Eye className="w-5 h-5" style={{ color: '#AAB7C9' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {displayError && (
              <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
                <p className="text-sm" style={{ color: '#EF4444' }}>{displayError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-premium w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Info sécurité */}
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(170, 183, 201, 0.1)' }}>
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#AAB7C9' }} />
              <p className="text-xs" style={{ color: '#AAB7C9' }}>
                Connexion sécurisée. Toutes les tentatives sont journalisées.
                Après 5 échecs, le compte sera verrouillé pendant 15 minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <a href="/" className="text-sm hover:underline" style={{ color: '#AAB7C9' }}>
            ← Retour au site public
          </a>
        </div>
      </div>
    </div>
  );
}
