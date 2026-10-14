import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Mail, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { verifyEmail, resendVerificationCode } from '../services/userAuthService';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || '';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Rediriger si pas d'email
  useEffect(() => {
    if (!email) {
      navigate('/inscription');
    }
  }, [email, navigate]);

  // Timer pour le cooldown de renvoi
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Masquer l'email pour la confidentialité
  const maskEmail = (email: string): string => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (!domain) return email;
    
    const maskedUsername = username.length > 2 
      ? username[0] + '***' + username[username.length - 1]
      : username[0] + '***';
    
    return `${maskedUsername}@${domain}`;
  };

  const handleCodeChange = (index: number, value: string) => {
    // Accepter seulement les chiffres
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Effacer les erreurs
    if (generalError) {
      setGeneralError('');
    }

    // Passer automatiquement au champ suivant
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Retour arrière : passer au champ précédent
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      setGeneralError('Veuillez saisir le code complet à 6 chiffres');
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyEmail(email, fullCode);

      if (result.success) {
        setSuccessMessage('Email vérifié avec succès ! Vous pouvez maintenant vous connecter.');
        setTimeout(() => {
          navigate('/connexion');
        }, 2000);
      } else {
        setGeneralError(result.error || 'Code incorrect');
        // Réinitialiser les champs en cas d'erreur
        setCode(['', '', '', '', '', '']);
        const firstInput = document.getElementById('code-0');
        if (firstInput) {
          firstInput.focus();
        }
      }
    } catch (error) {
      setGeneralError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) {
      return;
    }

    setIsResending(true);
    setGeneralError('');
    setSuccessMessage('');

    try {
      const result = await resendVerificationCode(email);

      if (result.success) {
        setSuccessMessage('Un nouveau code a été envoyé à votre adresse email');
        setResendCooldown(45); // 45 secondes de cooldown
        // Réinitialiser les champs
        setCode(['', '', '', '', '', '']);
      } else {
        setGeneralError(result.error || 'Impossible de renvoyer le code');
      }
    } catch (error) {
      setGeneralError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null;
  }

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
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
            <Mail className="w-8 h-8" style={{ color: '#D4AF37' }} />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#F5F0E6' }}>
            Vérification email
          </h1>
          <p className="text-lg mb-4" style={{ color: '#AAB7C9' }}>
            Nous avons envoyé un code à 6 chiffres à :
          </p>
          <p className="text-xl font-semibold" style={{ color: '#D4AF37' }}>
            {maskEmail(email)}
          </p>
        </div>

        {/* Carte du formulaire */}
        <div className="card-premium p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message de succès */}
            {successMessage && (
              <div className="p-4 rounded-lg flex items-start gap-3" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#10B981' }} />
                <p className="text-sm" style={{ color: '#10B981' }}>{successMessage}</p>
              </div>
            )}

            {/* Erreur générale */}
            {generalError && (
              <div className="p-4 rounded-lg flex items-start gap-3" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
                <p className="text-sm" style={{ color: '#EF4444' }}>{generalError}</p>
              </div>
            )}

            {/* Champs du code */}
            <div>
              <label className="block text-sm font-medium mb-3 text-center" style={{ color: '#AAB7C9' }}>
                Code de vérification
              </label>
              <div className="flex gap-2 justify-center">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 focus:outline-none transition"
                    style={{
                      background: 'rgba(11, 31, 58, 0.5)',
                      borderColor: digit ? '#D4AF37' : 'rgba(170, 183, 201, 0.2)',
                      color: '#F5F0E6'
                    }}
                    disabled={isLoading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            {/* Bouton de vérification */}
            <button
              type="submit"
              disabled={isLoading || code.join('').length !== 6}
              className="btn-premium w-full py-4 text-lg disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Vérification...
                </span>
              ) : (
                'Vérifier mon email'
              )}
            </button>
          </form>

          {/* Renvoyer le code */}
          <div className="mt-6 text-center">
            {resendCooldown > 0 ? (
              <div className="flex items-center justify-center gap-2 text-sm" style={{ color: '#AAB7C9' }}>
                <Clock className="w-4 h-4" />
                <span>Renvoyer le code dans {resendCooldown}s</span>
              </div>
            ) : (
              <button
                onClick={handleResendCode}
                disabled={isResending}
                className="text-sm font-medium hover:underline disabled:opacity-50"
                style={{ color: '#D4AF37' }}
              >
                {isResending ? 'Envoi en cours...' : 'Renvoyer le code'}
              </button>
            )}
          </div>
        </div>

        {/* Informations */}
        <div className="mt-8 p-6 rounded-xl" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
          <h3 className="font-semibold mb-3" style={{ color: '#D4AF37' }}>
            Informations importantes
          </h3>
          <ul className="space-y-2 text-sm" style={{ color: '#AAB7C9' }}>
            <li>• Le code est valable pendant 10 minutes</li>
            <li>• Vous avez 5 tentatives maximum</li>
            <li>• Vérifiez votre dossier spam si vous ne recevez pas l'email</li>
            <li>• Le code ne peut être utilisé qu'une seule fois</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
