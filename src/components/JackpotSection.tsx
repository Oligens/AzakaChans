import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';

const money = (value:number) => `${value.toLocaleString('fr-FR')} HTG`;

export function JackpotSection() {
  const [amount, setAmount] = useState(100000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await fetch('/api/jackpot', { cache:'no-store' });
        const data = await response.json();
        if (mounted && response.ok && data.success) setAmount(Number(data.jackpot.amount));
      } catch { /* le hub conserve la dernière valeur affichée */ }
      finally { if (mounted) setLoading(false); }
    };
    void load();
    const timer = window.setInterval(load, 10000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, []);

  return <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
    <div className="absolute inset-0 opacity-20" style={{backgroundImage:'url(https://image.qwenlm.ai/generated-images/128daf2b-fef0-4cee-b7ce-f095a50d1292/_result.png)',backgroundSize:'cover',backgroundPosition:'center',backgroundRepeat:'no-repeat'}} />
    <div className="absolute inset-0" style={{background:'linear-gradient(180deg, rgba(7, 22, 46, 0.95) 0%, rgba(11, 31, 58, 0.98) 100%)'}} />
    <div className="relative z-10 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 animate-pulse-gold" style={{background:'rgba(212,175,55,.1)',border:'1px solid rgba(212,175,55,.3)'}}><Sparkles className="w-4 h-4" style={{color:'#D4AF37'}}/><span className="text-sm font-medium" style={{color:'#D4AF37'}}>Jackpot Itinérant</span></div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{color:'#F5F0E6'}}>Gagnez jusqu'à</h2>
          <p className="text-6xl md:text-7xl font-bold mb-6" style={{background:'linear-gradient(135deg,#D4AF37 0%,#F2D675 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{loading?'…':money(amount)}</p>
          <p className="text-lg mb-8" style={{color:'#AAB7C9'}}>Le montant est mis à jour en temps réel depuis la plateforme. L'administrateur peut augmenter le jackpot, y compris au-delà de 1 000 000 HTG.</p>
          <div className="card-premium p-6 mb-8" style={{background:'rgba(11,31,58,.6)',backdropFilter:'blur(10px)',border:'1px solid rgba(212,175,55,.2)'}}>
            <h3 className="text-sm font-medium mb-4" style={{color:'#AAB7C9'}}>Cycle des catégories</h3>
            <div className="flex flex-wrap items-center gap-3">{['50 HTG','250 HTG','500 HTG','1 000 HTG'].map((cat,i)=><div key={i} className="flex items-center gap-3"><div className="px-4 py-2 rounded-lg" style={{background:'rgba(212,175,55,.1)',border:'1px solid rgba(212,175,55,.3)'}}><span className="text-sm font-medium" style={{color:'#D4AF37'}}>{cat}</span></div>{i<3&&<span style={{color:'#AAB7C9'}}>→</span>}</div>)}</div>
            <p className="text-xs mt-3" style={{color:'#AAB7C9'}}>Retour à 50 HTG après 1 000 HTG</p>
          </div>
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3"><Lock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color:'#D4AF37'}}/><p className="text-sm" style={{color:'#AAB7C9'}}><strong style={{color:'#F5F0E6'}}>Financement intégral :</strong> le montant publié doit être couvert avant activation.</p></div>
            <div className="flex items-start gap-3"><Lock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color:'#D4AF37'}}/><p className="text-sm" style={{color:'#AAB7C9'}}><strong style={{color:'#F5F0E6'}}>Immutabilité :</strong> les gains acquis ne peuvent jamais être modifiés.</p></div>
            <div className="flex items-start gap-3"><Lock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color:'#D4AF37'}}/><p className="text-sm" style={{color:'#AAB7C9'}}><strong style={{color:'#F5F0E6'}}>Transparence :</strong> la valeur publique provient directement de Neon.</p></div>
          </div>
          <Link to="/boutique" className="btn-premium inline-flex items-center gap-2 text-lg px-8 py-4">Tenter ma chance<ArrowRight className="w-5 h-5"/></Link>
        </div>
        <div className="relative"><div className="card-premium overflow-hidden" style={{background:'rgba(11,31,58,.4)',backdropFilter:'blur(10px)',border:'2px solid rgba(212,175,55,.3)'}}><img src="https://image.qwenlm.ai/generated-images/128daf2b-fef0-4cee-b7ce-f095a50d1292/_result.png" alt="Colonne de pièces de Gourde haïtiennes" className="w-full h-auto" style={{filter:'brightness(1.1) contrast(1.05)'}}/><div className="absolute bottom-0 left-0 right-0 h-32" style={{background:'linear-gradient(to top, rgba(7,22,46,.8) 0%, transparent 100%)'}}/><div className="absolute top-4 right-4 px-4 py-2 rounded-full" style={{background:'rgba(212,175,55,.9)',backdropFilter:'blur(10px)'}}><span className="text-sm font-bold" style={{color:'#07162E'}}>🏆 Jackpot Actif</span></div></div><div className="absolute -inset-4 pointer-events-none" style={{background:'radial-gradient(circle at 50% 50%, rgba(212,175,55,.15) 0%, transparent 70%)',filter:'blur(40px)'}}/></div>
      </div>
    </div>
  </section>;
}
