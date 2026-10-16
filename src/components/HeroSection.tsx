import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Shield, Ticket, Wallet, Star } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #07162E 0%, #0B1F3A 100%)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 35%, rgba(14,165,233,.22) 0%, transparent 55%)' }} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="animate-fade-in">
          <div className="flex justify-center mb-7"><div className="w-28 h-28 rounded-3xl bg-white p-2 shadow-2xl"><img src="/icons/icon.svg" alt="AZAKA" className="w-full h-full object-contain" /></div></div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(212,175,55,.1)', border: '1px solid rgba(212,175,55,.3)', backdropFilter: 'blur(10px)' }}><Star className="w-4 h-4" style={{ color: '#D4AF37' }} /><span className="text-sm font-medium" style={{ color: '#D4AF37' }}>Rasin nou. Chans nou.</span></div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ color: '#F5F0E6' }}>AZAKA</h1>
          <p className="text-xl md:text-2xl mb-4" style={{ color: '#D4AF37' }}>La loterie haïtienne nouvelle génération</p>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto" style={{ color: '#AAB7C9' }}>Achetez des tickets physiques ou virtuels, révélez vos gains et retirez-les via MonCash ou NatCash. Sécurité maximale, transparence totale, fierté culturelle.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12"><Link to="/boutique" className="btn-premium inline-flex items-center justify-center gap-2 text-lg px-8 py-4">Acheter des tickets<ArrowRight className="w-5 h-5" /></Link><Link to="/portefeuille" className="btn-secondary inline-flex items-center justify-center text-lg px-8 py-4">Mon portefeuille</Link></div>
          <div className="card-premium inline-block p-6 mb-12" style={{ background: 'rgba(11,31,58,.6)', backdropFilter: 'blur(20px)', border: '2px solid rgba(212,175,55,.3)' }}><p className="text-sm mb-2" style={{ color: '#AAB7C9' }}>Jackpot Itinérant</p><p className="text-5xl md:text-6xl font-bold mb-2" style={{ background: 'linear-gradient(135deg,#D4AF37 0%,#F2D675 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>100 000 HTG</p><p className="text-sm" style={{ color: '#AAB7C9' }}>Change de catégorie à chaque victoire</p></div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"><div className="card-premium p-6" style={{ background: 'rgba(11,31,58,.5)', backdropFilter: 'blur(10px)' }}><Ticket className="w-10 h-10 mx-auto mb-3" style={{ color: '#D4AF37' }} /><h3 className="text-lg font-bold mb-2" style={{ color: '#F5F0E6' }}>Tickets Sécurisés</h3><p className="text-sm" style={{ color: '#AAB7C9' }}>Physiques ou virtuels, résultats vérifiables</p></div><div className="card-premium p-6" style={{ background: 'rgba(11,31,58,.5)', backdropFilter: 'blur(10px)' }}><Wallet className="w-10 h-10 mx-auto mb-3" style={{ color: '#D4AF37' }} /><h3 className="text-lg font-bold mb-2" style={{ color: '#F5F0E6' }}>Retraits Rapides</h3><p className="text-sm" style={{ color: '#AAB7C9' }}>MonCash et NatCash en quelques clics</p></div><div className="card-premium p-6" style={{ background: 'rgba(11,31,58,.5)', backdropFilter: 'blur(10px)' }}><Shield className="w-10 h-10 mx-auto mb-3" style={{ color: '#D4AF37' }} /><h3 className="text-lg font-bold mb-2" style={{ color: '#F5F0E6' }}>100% Sécurisé</h3><p className="text-sm" style={{ color: '#AAB7C9' }}>Cryptographie avancée et audit complet</p></div></div>
        </div>
      </div>
    </section>
  );
}
