import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ShieldCheck, UserRound, WalletCards, Wrench } from 'lucide-react';

type AdminUser = {
  id: string; email: string; fullName: string; phone: string; role: string;
  emailVerified: boolean; active: boolean; suspended: boolean; createdAt: string; lastLoginAt: string | null;
  hasProfile: boolean; hasWallet: boolean; balance: number; availableBalance: number; ticketCount: number; activeSessions: number;
};

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [repairing, setRepairing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/users', { credentials: 'include', headers: { Accept: 'application/json' }, cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Impossible de charger les utilisateurs.');
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const repairAll = async () => {
    setRepairing(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Réparation impossible.');
      setMessage(`${Number(data.repaired || 0)} compte(s) vérifié(s) : profils et portefeuilles manquants créés.`);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Réparation impossible.'); }
    finally { setRepairing(false); }
  };

  const missingProfiles = users.filter(user => !user.hasProfile).length;
  const missingWallets = users.filter(user => !user.hasWallet).length;

  return (
    <div className="min-h-screen bg-navy-deep px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.22em] text-gold-400">Administration</p>
            <h1 className="text-3xl font-bold text-off-white">Utilisateurs, profils & portefeuilles</h1>
            <p className="mt-2 text-sm text-text-secondary">Source de vérité Neon : compte, session, profil, portefeuille et tickets.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => void load()} disabled={loading} className="btn-secondary inline-flex items-center gap-2"><RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} /> Actualiser</button>
            <button onClick={() => void repairAll()} disabled={repairing} className="btn-premium inline-flex items-center gap-2"><Wrench className="h-4 w-4" /> {repairing ? 'Réparation…' : 'Réparer profils / portefeuilles'}</button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="card-premium p-5"><div className="flex items-center gap-3"><UserRound className="h-6 w-6 text-gold-400" /><div><p className="text-xs text-text-secondary">Comptes</p><p className="text-2xl font-bold text-off-white">{users.length}</p></div></div></div>
          <div className="card-premium p-5"><div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-gold-400" /><div><p className="text-xs text-text-secondary">Profils manquants</p><p className="text-2xl font-bold text-off-white">{missingProfiles}</p></div></div></div>
          <div className="card-premium p-5"><div className="flex items-center gap-3"><WalletCards className="h-6 w-6 text-gold-400" /><div><p className="text-xs text-text-secondary">Portefeuilles manquants</p><p className="text-2xl font-bold text-off-white">{missingWallets}</p></div></div></div>
        </div>

        {error && <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}
        {message && <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">{message}</div>}

        <div className="card-premium overflow-hidden">
          {loading ? <div className="p-10 text-center text-text-secondary">Chargement sécurisé des comptes…</div> : users.length === 0 ? <div className="p-10 text-center text-text-secondary">Aucun utilisateur.</div> : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.03] text-text-secondary">
                  <tr><th className="px-5 py-4">Utilisateur</th><th className="px-5 py-4">Rôle</th><th className="px-5 py-4">Profil</th><th className="px-5 py-4">Portefeuille</th><th className="px-5 py-4">Tickets</th><th className="px-5 py-4">Session</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(user => <tr key={user.id} className="hover:bg-white/[0.025]">
                    <td className="px-5 py-4"><div className="font-medium text-off-white">{user.fullName || 'Sans nom'}</div><div className="text-xs text-text-secondary">{user.email}</div><div className="text-[11px] text-text-secondary">{user.emailVerified ? 'Email vérifié' : 'Email non vérifié'}</div></td>
                    <td className="px-5 py-4"><span className="rounded-full border border-gold-400/20 bg-gold-400/10 px-2.5 py-1 text-xs text-gold-300">{user.role}</span></td>
                    <td className="px-5 py-4">{user.hasProfile ? <span className="text-emerald-300">Créé</span> : <span className="text-red-300">Manquant</span>}</td>
                    <td className="px-5 py-4">{user.hasWallet ? <><span className="text-emerald-300">Créé</span><div className="text-xs text-text-secondary">{user.availableBalance.toLocaleString()} HTG disponibles</div></> : <span className="text-red-300">Manquant</span>}</td>
                    <td className="px-5 py-4 text-off-white">{user.ticketCount}</td>
                    <td className="px-5 py-4">{user.activeSessions > 0 ? <span className="text-emerald-300">Active</span> : <span className="text-text-secondary">Aucune</span>}</td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
