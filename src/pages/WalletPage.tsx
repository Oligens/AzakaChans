import { Link } from 'react-router-dom';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, ArrowDownToLine } from 'lucide-react';

export function WalletPage() {
  // Données simulées - en production : appel API backend
  const walletData = {
    balance: 2500,
    totalDeposits: 5000,
    totalWinnings: 4000,
    totalWithdrawals: 1500,
  };

  const transactions = [
    { id: 1, type: 'WIN', description: 'Gain ticket CHN-2024-00002', amount: 500, date: '2024-03-21' },
    { id: 2, type: 'PURCHASE', description: 'Achat ticket CHN-2024-00003', amount: -100, date: '2024-03-22' },
    { id: 3, type: 'WITHDRAWAL', description: 'Retrait MonCash', amount: -1000, date: '2024-03-24' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #07162E 0%, #0B1F3A 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="inline-flex items-center gap-2 mb-6 text-sm hover:opacity-80 transition" style={{ color: '#AAB7C9' }}>
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        <h1 className="text-4xl font-bold mb-8" style={{ color: '#F5F0E6' }}>Mon Portefeuille</h1>

        {/* Balance Card */}
        <div className="card-premium p-8 mb-8" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(242, 214, 117, 0.1) 100%)', borderColor: 'rgba(212, 175, 55, 0.3)' }}>
          <div className="flex items-center gap-4 mb-4">
            <Wallet className="w-12 h-12" style={{ color: '#D4AF37' }} />
            <div>
              <p className="text-sm" style={{ color: '#AAB7C9' }}>Solde disponible</p>
              <p className="text-4xl font-bold" style={{ color: '#F5F0E6' }}>{walletData.balance.toLocaleString()} HTG</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div>
              <p className="text-xs" style={{ color: '#AAB7C9' }}>Dépôts</p>
              <p className="text-lg font-bold" style={{ color: '#10B981' }}>{walletData.totalDeposits.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#AAB7C9' }}>Gains</p>
              <p className="text-lg font-bold" style={{ color: '#10B981' }}>{walletData.totalWinnings.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#AAB7C9' }}>Retraits</p>
              <p className="text-lg font-bold" style={{ color: '#EF4444' }}>{walletData.totalWithdrawals.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <button className="btn-premium flex items-center justify-center gap-2">
            <ArrowDownToLine className="w-5 h-5" />
            Retirer vers MonCash
          </button>
          <button className="btn-secondary flex items-center justify-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Déposer des fonds
          </button>
        </div>

        {/* Transactions */}
        <div className="card-premium p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#F5F0E6' }}>Historique des Transactions</h2>
          <div className="space-y-3">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'rgba(11, 31, 58, 0.5)' }}>
                <div className="flex items-center gap-3">
                  {tx.amount > 0 ? (
                    <TrendingUp className="w-5 h-5" style={{ color: '#10B981' }} />
                  ) : (
                    <TrendingDown className="w-5 h-5" style={{ color: '#EF4444' }} />
                  )}
                  <div>
                    <p className="font-medium" style={{ color: '#F5F0E6' }}>{tx.description}</p>
                    <p className="text-xs" style={{ color: '#AAB7C9' }}>{tx.date}</p>
                  </div>
                </div>
                <p className={`font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} HTG
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
