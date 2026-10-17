import { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, Save, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const money = (value:number) => `${value.toLocaleString('fr-FR')} HTG`;

export function AdminJackpotPage() {
  const [amount, setAmount] = useState('100000');
  const [current, setCurrent] = useState(100000);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/jackpot', { credentials:'include', cache:'no-store' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Impossible de charger le jackpot.');
      setCurrent(Number(data.jackpot.amount)); setAmount(String(Number(data.jackpot.amount))); setUpdatedAt(data.jackpot.updatedAt || null);
    } catch (e) { setError(e instanceof Error ? e.message : 'Erreur de chargement.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const save = async () => {
    const numeric = Number(amount.replace(/\s/g,'').replace(',', '.'));
    if (!Number.isFinite(numeric) || numeric < 1) { setError('Entrez un montant supérieur à 0 HTG.'); return; }
    setSaving(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/jackpot', { method:'PATCH', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify({amount:numeric}) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Mise à jour impossible.');
      setCurrent(Number(data.jackpot.amount)); setAmount(String(Number(data.jackpot.amount))); setMessage(`Jackpot mis à jour : ${money(Number(data.jackpot.amount))}.`); setUpdatedAt(new Date().toISOString());
    } catch (e) { setError(e instanceof Error ? e.message : 'Mise à jour impossible.'); }
    finally { setSaving(false); }
  };

  return <div className="min-h-screen" style={{background:'linear-gradient(135deg,#07162E 0%,#0B1F3A 100%)',color:'#F5F0E6'}}>
    <main className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div><Link to="/gestion-privee" className="inline-flex items-center gap-2 text-sm mb-4" style={{color:'#AAB7C9'}}><ArrowLeft className="w-4 h-4"/>Retour au tableau de bord</Link><h1 className="text-3xl font-bold flex items-center gap-3"><Sparkles style={{color:'#D4AF37'}}/>Jackpot Itinérant</h1><p className="mt-2" style={{color:'#AAB7C9'}}>Gestion réelle du montant affiché aux joueurs.</p></div>
        <button onClick={load} disabled={loading} className="btn-secondary flex items-center gap-2"><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/>Actualiser</button>
      </div>
      {error&&<div className="mb-6 p-4 rounded-xl" style={{background:'rgba(239,68,68,.12)',color:'#FCA5A5'}}>{error}</div>}
      {message&&<div className="mb-6 p-4 rounded-xl" style={{background:'rgba(34,197,94,.12)',color:'#86EFAC'}}>{message}</div>}
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="card-premium p-8">
          <p className="text-sm" style={{color:'#AAB7C9'}}>Jackpot actuellement publié</p>
          <p className="text-5xl font-black mt-3" style={{color:'#D4AF37'}}>{money(current)}</p>
          {updatedAt&&<p className="text-xs mt-3" style={{color:'#718096'}}>Dernière mise à jour : {new Date(updatedAt).toLocaleString('fr-FR')}</p>}
          <div className="mt-8 flex items-center gap-3" style={{color:'#86EFAC'}}><TrendingUp className="w-5 h-5"/><span>La valeur est lue depuis Neon et publiée sur le hub.</span></div>
        </section>
        <section className="card-premium p-8">
          <h2 className="text-xl font-bold mb-2">Modifier le jackpot</h2>
          <p className="text-sm mb-6" style={{color:'#AAB7C9'}}>Exemple : 100 000 → 1 000 000 HTG. Aucun plafond artificiel de 100 000 HTG n'est appliqué ici.</p>
          <label className="block text-sm mb-2" style={{color:'#CBD5E1'}}>Nouveau montant (HTG)</label>
          <input value={Number(amount||0).toLocaleString('fr-FR')} onChange={e=>setAmount(e.target.value.replace(/\D/g,''))} inputMode="numeric" className="w-full rounded-xl px-4 py-4 text-2xl font-bold bg-white/5 border border-white/10 outline-none" style={{color:'#F5F0E6'}} aria-label="Montant du jackpot" />
          <button onClick={save} disabled={saving} className="btn-premium w-full mt-5 flex items-center justify-center gap-2"><Save className="w-5 h-5"/>{saving?'Publication…':'Publier le nouveau jackpot'}</button>
          <p className="text-xs mt-4" style={{color:'#718096'}}>Chaque modification est enregistrée avec l'administrateur, l'ancien montant et le nouveau montant.</p>
        </section>
      </div>
      <section className="card-premium p-6 mt-6"><h2 className="font-bold mb-2">Propagation utilisateur</h2><p className="text-sm" style={{color:'#AAB7C9'}}>Le hub public interroge la même valeur persistante. Les utilisateurs voient donc le nouveau jackpot sans modifier le code ou redéployer l'application.</p></section>
    </main>
  </div>;
}
