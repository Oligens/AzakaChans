import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, CreditCard, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import { getUserWalletData, createWithdrawal } from '../services/userDataService';

type WithdrawalMethod = 'MONCASH' | 'NATCASH' | 'BANK';

interface WithdrawalFormData {
  amount: string;
  method: WithdrawalMethod;
  beneficiaryName: string;
  phoneNumber: string;
  bankName: string;
  accountNumber: string;
}

export function WithdrawalPage() {
  const navigate = useNavigate();
  const walletData = getUserWalletData();
  
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [formData, setFormData] = useState<WithdrawalFormData>({
    amount: '',
    method: 'MONCASH',
    beneficiaryName: '',
    phoneNumber: '',
    bankName: '',
    accountNumber: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawalRef, setWithdrawalRef] = useState<string | null>(null);

  const handleMethodChange = (method: WithdrawalMethod) => {
    setFormData({ ...formData, method });
    setError(null);
  };

  const validateForm = (): boolean => {
    const amount = parseFloat(formData.amount);
    
    if (!formData.amount || isNaN(amount)) {
      setError('Veuillez entrer un montant valide');
      return false;
    }

    if (amount <= 0) {
      setError('Le montant doit être supérieur à 0');
      return false;
    }

    if (amount > walletData.availableForWithdrawal) {
      setError('Solde insuffisant');
      return false;
    }

    if (!formData.beneficiaryName.trim()) {
      setError('Veuillez entrer le nom du bénéficiaire');
      return false;
    }

    if (formData.method === 'MONCASH' || formData.method === 'NATCASH') {
      if (!formData.phoneNumber.trim()) {
        setError('Veuillez entrer le numéro de téléphone');
        return false;
      }
      // Validation basique du numéro haïtien
      const phoneRegex = /^\+509\s?\d{4}\s?\d{4}$/;
      if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, '+509 '))) {
        setError('Format de numéro invalide (ex: +509 4461 7600)');
        return false;
      }
    }

    if (formData.method === 'BANK') {
      if (!formData.bankName.trim()) {
        setError('Veuillez entrer le nom de la banque');
        return false;
      }
      if (!formData.accountNumber.trim()) {
        setError('Veuillez entrer le numéro de compte');
        return false;
      }
    }

    return true;
  };

  const handleContinue = () => {
    if (validateForm()) {
      setStep('confirm');
      setError(null);
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = createWithdrawal({
        amount: parseFloat(formData.amount),
        method: formData.method,
        beneficiaryName: formData.beneficiaryName,
        destination: formData.method === 'BANK' 
          ? `${formData.bankName} - ${formData.accountNumber}`
          : formData.phoneNumber,
      });

      if (result.success && result.withdrawal) {
        setWithdrawalRef(result.withdrawal.id);
        setStep('success');
      } else {
        setError(result.error || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Impossible de traiter cette opération. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('form');
    } else {
      navigate(-1);
    }
  };

  // Masquer les informations sensibles
  const maskDestination = (destination: string): string => {
    if (formData.method === 'BANK') {
      const parts = destination.split(' - ');
      if (parts.length === 2) {
        const account = parts[1];
        return `${parts[0]} - ••••${account.slice(-4)}`;
      }
    } else {
      // Masquer le numéro de téléphone
      return destination.replace(/(\d{2})\s?(\d{2})\s?(\d{2})\s?(\d{2})/, '$1 •• •• $4');
    }
    return destination;
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #07162E 0%, #0B1F3A 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 mb-6 text-sm hover:opacity-80 transition"
          style={{ color: '#AAB7C9' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        {/* ÉTAPE 1: FORMULAIRE */}
        {step === 'form' && (
          <>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#F5F0E6' }}>
              Effectuer un retrait
            </h1>
            <p className="text-lg mb-8" style={{ color: '#AAB7C9' }}>
              Solde disponible: <strong style={{ color: '#D4AF37' }}>{walletData.availableForWithdrawal.toLocaleString()} HTG</strong>
            </p>

            <div className="card-premium p-8">
              {/* Montant */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: '#AAB7C9' }}>
                  Montant du retrait
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="input-premium pr-16"
                    placeholder="0"
                    min="0"
                    max={walletData.availableForWithdrawal}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#AAB7C9' }}>
                    HTG
                  </span>
                </div>
              </div>

              {/* Méthode */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3" style={{ color: '#AAB7C9' }}>
                  Méthode de retrait
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleMethodChange('MONCASH')}
                    className={`p-4 rounded-xl border-2 transition ${
                      formData.method === 'MONCASH'
                        ? 'border-[#D4AF37] bg-[rgba(212,175,55,0.1)]'
                        : 'border-[rgba(170,183,201,0.2)] hover:border-[rgba(170,183,201,0.4)]'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-2" style={{ color: formData.method === 'MONCASH' ? '#D4AF37' : '#AAB7C9' }} />
                    <p className="text-sm font-medium" style={{ color: formData.method === 'MONCASH' ? '#F5F0E6' : '#AAB7C9' }}>
                      MonCash
                    </p>
                  </button>
                  <button
                    onClick={() => handleMethodChange('NATCASH')}
                    className={`p-4 rounded-xl border-2 transition ${
                      formData.method === 'NATCASH'
                        ? 'border-[#D4AF37] bg-[rgba(212,175,55,0.1)]'
                        : 'border-[rgba(170,183,201,0.2)] hover:border-[rgba(170,183,201,0.4)]'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-2" style={{ color: formData.method === 'NATCASH' ? '#D4AF37' : '#AAB7C9' }} />
                    <p className="text-sm font-medium" style={{ color: formData.method === 'NATCASH' ? '#F5F0E6' : '#AAB7C9' }}>
                      NatCash
                    </p>
                  </button>
                  <button
                    onClick={() => handleMethodChange('BANK')}
                    className={`p-4 rounded-xl border-2 transition ${
                      formData.method === 'BANK'
                        ? 'border-[#D4AF37] bg-[rgba(212,175,55,0.1)]'
                        : 'border-[rgba(170,183,201,0.2)] hover:border-[rgba(170,183,201,0.4)]'
                    }`}
                  >
                    <Building2 className="w-6 h-6 mx-auto mb-2" style={{ color: formData.method === 'BANK' ? '#D4AF37' : '#AAB7C9' }} />
                    <p className="text-sm font-medium" style={{ color: formData.method === 'BANK' ? '#F5F0E6' : '#AAB7C9' }}>
                      Banque
                    </p>
                  </button>
                </div>
              </div>

              {/* Informations du bénéficiaire */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: '#AAB7C9' }}>
                  Nom complet du bénéficiaire
                </label>
                <input
                  type="text"
                  value={formData.beneficiaryName}
                  onChange={(e) => setFormData({ ...formData, beneficiaryName: e.target.value })}
                  className="input-premium"
                  placeholder="Jean Pierre"
                />
              </div>

              {/* Champs dynamiques selon la méthode */}
              {(formData.method === 'MONCASH' || formData.method === 'NATCASH') && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#AAB7C9' }}>
                    Numéro {formData.method === 'MONCASH' ? 'MonCash' : 'NatCash'}
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="input-premium"
                    placeholder="+509 4461 7600"
                  />
                </div>
              )}

              {formData.method === 'BANK' && (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2" style={{ color: '#AAB7C9' }}>
                      Nom de la banque
                    </label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="input-premium"
                      placeholder="Sogebank, Unibank, etc."
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2" style={{ color: '#AAB7C9' }}>
                      Numéro de compte
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="input-premium"
                      placeholder="001-234-567-8"
                    />
                  </div>
                </>
              )}

              {/* Erreur */}
              {error && (
                <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
                  <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
                </div>
              )}

              {/* Bouton Continuer */}
              <button
                onClick={handleContinue}
                className="btn-premium w-full py-4 text-lg"
              >
                Continuer
              </button>
            </div>
          </>
        )}

        {/* ÉTAPE 2: CONFIRMATION */}
        {step === 'confirm' && (
          <>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#F5F0E6' }}>
              Confirmer votre retrait
            </h1>
            <p className="text-lg mb-8" style={{ color: '#AAB7C9' }}>
              Veuillez vérifier les informations ci-dessous
            </p>

            <div className="card-premium p-8">
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                  <span style={{ color: '#AAB7C9' }}>Montant</span>
                  <span className="text-2xl font-bold" style={{ color: '#D4AF37' }}>
                    {parseFloat(formData.amount).toLocaleString()} HTG
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                  <span style={{ color: '#AAB7C9' }}>Méthode</span>
                  <span className="font-medium" style={{ color: '#F5F0E6' }}>
                    {formData.method === 'MONCASH' ? 'MonCash' : formData.method === 'NATCASH' ? 'NatCash' : 'Compte bancaire'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                  <span style={{ color: '#AAB7C9' }}>Bénéficiaire</span>
                  <span className="font-medium" style={{ color: '#F5F0E6' }}>
                    {formData.beneficiaryName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: '#AAB7C9' }}>Destination</span>
                  <span className="font-medium" style={{ color: '#F5F0E6' }}>
                    {maskDestination(
                      formData.method === 'BANK'
                        ? `${formData.bankName} - ${formData.accountNumber}`
                        : formData.phoneNumber
                    )}
                  </span>
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
                  <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
                </div>
              )}

              {/* Boutons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setStep('form')}
                  disabled={isLoading}
                  className="btn-secondary py-4"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="btn-premium py-4 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    'Confirmer le retrait'
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ÉTAPE 3: SUCCÈS */}
        {step === 'success' && (
          <>
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                <CheckCircle className="w-12 h-12" style={{ color: '#10B981' }} />
              </div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#F5F0E6' }}>
                Retrait enregistré
              </h1>
              <p className="text-lg" style={{ color: '#AAB7C9' }}>
                Votre demande de retrait a été enregistrée avec succès
              </p>
            </div>

            <div className="card-premium p-8">
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                  <span style={{ color: '#AAB7C9' }}>Montant</span>
                  <span className="text-2xl font-bold" style={{ color: '#D4AF37' }}>
                    {parseFloat(formData.amount).toLocaleString()} HTG
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                  <span style={{ color: '#AAB7C9' }}>Méthode</span>
                  <span className="font-medium" style={{ color: '#F5F0E6' }}>
                    {formData.method === 'MONCASH' ? 'MonCash' : formData.method === 'NATCASH' ? 'NatCash' : 'Compte bancaire'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                  <span style={{ color: '#AAB7C9' }}>Statut</span>
                  <span className="badge-premium badge-warning">En attente</span>
                </div>
                {withdrawalRef && (
                  <div className="flex justify-between items-center">
                    <span style={{ color: '#AAB7C9' }}>Référence</span>
                    <span className="font-mono text-sm" style={{ color: '#F5F0E6' }}>
                      {withdrawalRef}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/portefeuille')}
                  className="btn-secondary py-4"
                >
                  Voir mon portefeuille
                </button>
                <button
                  onClick={() => navigate('/portefeuille')}
                  className="btn-premium py-4"
                >
                  Voir mes retraits
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
