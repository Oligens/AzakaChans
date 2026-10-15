import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginUser } from '../services/userAuthService';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validation email
    if (!formData.email) {
      newErrors.email = 'L\'adresse email est requise';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'adresse email invalide';
    }

    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser(formData.email, formData.password);

      if (result.success) {
        // Rediriger vers le tableau de bord ou la page d'accueil
        const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';
        navigate(destination, { replace: true });
      } else {
        setGeneralError(result.error || 'Une erreur est survenue lors de la connexion');
      }
    } catch (error) {
      setGeneralError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #07162E 0%, #0B1F3A 100%)' }}>
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Bouton retour */}
        <Link to="/" className="inline-flex items-center gap-2 mb-6 text-sm hover:opacity-80 transition" style={{ color: '#AAB7C9' }}>
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#F5F0E6' }}>
            Connexion
          </h1>
          <p className="text-lg" style={{ color: '#AAB7C9' }}>
            Accédez à votre compte AZAKA CHANS
          </p>
        </div>

        {/* Carte du formulaire */}
        <div className="card-premium p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Erreur générale */}
            {generalError && (
              <div className="p-4 rounded-lg flex items-start gap-3" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
                <p className="text-sm" style={{ color: '#EF4444' }}>{generalError}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#AAB7C9' }}>
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#AAB7C9' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-premium pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="votre@email.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.email}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium" style={{ color: '#AAB7C9' }}>
                  Mot de passe
                </label>
                <Link to="/mot-de-passe-oublie" className="text-xs hover:underline" style={{ color: '#D4AF37' }}>
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#AAB7C9' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-premium pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
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
              {errors.password && (
                <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.password}</p>
              )}
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-premium w-full py-4 text-lg disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Lien vers inscription */}
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: '#AAB7C9' }}>
              Pas encore de compte ?{' '}
              <Link to="/inscription" className="font-medium hover:underline" style={{ color: '#D4AF37' }}>
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        {/* Informations de sécurité */}
        <div className="mt-8 p-6 rounded-xl" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
          <h3 className="font-semibold mb-3" style={{ color: '#D4AF37' }}>
            Sécurité de votre compte
          </h3>
          <ul className="space-y-2 text-sm" style={{ color: '#AAB7C9' }}>
            <li>• Votre connexion est sécurisée et chiffrée</li>
            <li>• Ne partagez jamais vos identifiants</li>
            <li>• Déconnectez-vous après utilisation sur un appareil partagé</li>
            <li>• Si vous pensez que votre compte est compromis, changez votre mot de passe immédiatement</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
