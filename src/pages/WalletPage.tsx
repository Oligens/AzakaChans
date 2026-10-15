import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, ArrowDownToLine, Loader2, RefreshCw } from 'lucide-react';

type WalletPayload = {
  success: boolean;
  error?: string;
  wallet?: {
    balance: number;
    availableBalance: number;
    totalDeposits: number;
    totalWithdrawals: number;
    totalWinnings: number;
    reservedAmount: number;
    currency: string;
  };
  transactions?: Array<{
    id: string;
    type: string;
    amount: number;
    currency: string;
    description: string;
    status: string;
    createdAt: string;
  }>;
};

export function WalletPage() {
  const [data, setData] = useState<WalletPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWallet = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/user/wallet', {
        method: 'GET',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      const payload = await response.json() as WalletPayload;
      if (!response.ok || !payload.success || !payload.wallet) {
        throw new Error(payload.error || 'Impossible de charger le portefeuille.');
      }
      setData(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors du chargement du portefeuille.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadWallet(); }, []);

  const wallet = data?.wallet;
  const transactions = data?.transactions ?? [];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #07162E 0%, #0B1F3A 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm hover:opacity-80 transition" style={{ color: '#AAB7C9' }}>
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>
          <button onClick={() => void loadWallet()} disabled={loading} className="btn-secondary inline-flex items-center gap-2 text-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
          </button>
        </div>

        <h1 className="text-4xl font-bold mb-8" style={{ color: '#F5F0E6' }}>Mon Portefeuille</h1>

        {error && (
          <div role="alert" className="rounded-xl border p-4 mb-6" style={{ color: '#FCA5A5', borderColor: 'rgba(239,68,68,.4)', background: 'rgba(239,68,68,.08)' }}>
            {error}
            {error.toLowerCase().includes('schéma neon') && <p className="mt-2 text-sm">Exécutez le fichier <code>database/neon_schema.sql</code> dans le SQL Editor de votre projet Neon.</p>}
          </div>
        )}

        {loading && !data ? (
          <div className="flex items-center justify-center gap-3 py-20" style={{ color: '#AAB7C9' }}>
            <Loader2 className="w-6 h-6 animate-spin" /> Chargement des données sécurisées…
          </div>
        ) : wallet ? (
          <>
            <div className="card-premium p-8 mb-8" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(242, 214, 117, 0.1) 100%)', borderColor: 'rgba(212, 175, 55, 0.3)' }}>
              <div className="flex items-center gap-4 mb-4">
                <Wallet className="w-12 h-12" style={{ color: '#D4AF37' }} />
                <div>
                  <p className="text-sm" style={{ color: '#AAB7C9' }}>Solde disponible</p>
                  <p className="text-4xl font-bold" style={{ color: '#F5F0E6' }}>{wallet.availableBalance.toLocaleString()} {wallet.currency}</p>
                  <p className="text-xs mt-2" style={{ color: '#AAB7C9' }}>Solde total : {wallet.balance.toLocaleString()} {wallet.currency}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div><p className="text-xs" style={{ color: '#AAB7C9' }}>Dépôts</p><p className="text-lg font-bold" style={{ color: '#10B981' }}>{wallet.totalDeposits.toLocaleString()} HTG</p></div>
                <div><p className="text-xs" style={{ color: '#AAB7C9' }}>Gains</p><p className="text-lg font-bold" style={{ color: '#10B981' }}>{wallet.totalWinnings.toLocaleString()} HTG</p></div>
                <div><p className="text-xs" style={{ color: '#AAB7C9' }}>Retraits</p><p className="text-lg font-bold" style={{ color: '#EF4444' }}>{wallet.totalWithdrawals.toLocaleString()} HTG</p></div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <Link to="/retrait" className="btn-premium flex items-center justify-center gap-2"><ArrowDownToLine className="w-5 h-5" /> Retirer</Link>
              <Link to="/boutique" className="btn-secondary flex items-center justify-center gap-2"><Wallet className="w-5 h-5" /> Acheter des tickets</Link>
            </div>

            <div className="card-premium p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#F5F0E6' }}>Historique des transactions</h2>
              {transactions.length === 0 ? (
                <p className="py-8 text-center" style={{ color: '#AAB7C9' }}>Aucune transaction enregistrée pour le moment.</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map(tx => {
                    const positive = ['DEPOSIT', 'WIN_CREDIT', 'REFUND'].includes(tx.type);
                    return <div key={tx.id} className="flex items-center justify-between gap-4 p-4 rounded-lg" style={{ background: 'rgba(11, 31, 58, 0.5)' }}>
                      <div className="flex items-center gap-3 min-w-0">
                        {positive ? <TrendingUp className="w-5 h-5 shrink-0" style={{ color: '#10B981' }} /> : <TrendingDown className="w-5 h-5 shrink-0" style={{ color: '#EF4444' }} />}
                        <div className="min-w-0"><p className="font-medium truncate" style={{ color: '#F5F0E6' }}>{tx.description}</p><p className="text-xs" style={{ color: '#AAB7C9' }}>{new Date(tx.createdAt).toLocaleString()} · {tx.status}</p></div>
                      </div>
                      <p className={`font-bold whitespace-nowrap ${positive ? 'text-green-500' : 'text-red-500'}`}>{positive ? '+' : '−'}{tx.amount.toLocaleString()} {tx.currency}</p>
                    </div>;
                  })}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
