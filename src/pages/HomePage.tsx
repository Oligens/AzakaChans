import { Link } from 'react-router-dom';
import { Sparkles, Ticket, Wallet, Shield, ArrowRight } from 'lucide-react';
import { HeroSection } from '../components/HeroSection';
import { JackpotSection } from '../components/JackpotSection';

export function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #07162E 0%, #0B1F3A 100%)' }}>
      {/* Navigation */}
      <nav className="border-b sticky top-0 z-50" style={{ 
        borderColor: 'rgba(212, 175, 55, 0.2)',
        background: 'rgba(7, 22, 46, 0.95)',
        backdropFilter: 'blur(20px)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F2D675 100%)' }}>
                <Sparkles className="w-6 h-6" style={{ color: '#07162E' }} />
              </div>
              <div>
                <span className="text-xl font-bold block" style={{ color: '#F5F0E6' }}>AZAKA CHANS</span>
                <span className="text-xs" style={{ color: '#D4AF37' }}>Rasin nou. Chans nou.</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm hover:opacity-80 transition" style={{ color: '#AAB7C9' }}>Fonctionnalités</a>
              <a href="#jackpot" className="text-sm hover:opacity-80 transition" style={{ color: '#AAB7C9' }}>Jackpot</a>
              <a href="#security" className="text-sm hover:opacity-80 transition" style={{ color: '#AAB7C9' }}>Sécurité</a>
              <Link to="/boutique" className="btn-premium text-sm">
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section avec image de fond */}
      <HeroSection />

      {/* Jackpot Section avec image de pièces */}
      <div id="jackpot">
        <JackpotSection />
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#F5F0E6' }}>
              Pourquoi choisir AZAKA CHANS ?
            </h2>
            <p className="text-lg" style={{ color: '#AAB7C9' }}>
              Une plateforme conçue pour la sécurité et la transparence
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Ticket,
                title: 'Tickets Physiques & Virtuels',
                description: 'Achetez en ligne ou chez nos distributeurs agréés. Scannez vos tickets physiques pour révéler vos gains.',
              },
              {
                icon: Wallet,
                title: 'Portefeuille Sécurisé',
                description: 'Gérez vos gains en toute sécurité. Retirez via MonCash ou NatCash en quelques clics.',
              },
              {
                icon: Shield,
                title: 'Sécurité Maximale',
                description: 'Chaque transaction est vérifiée et enregistrée. Vos gains sont protégés par des mécanismes cryptographiques.',
              },
            ].map((feature, i) => (
              <div key={i} className="card-premium p-6 animate-fade-in">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                  <feature.icon className="w-6 h-6" style={{ color: '#D4AF37' }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#F5F0E6' }}>{feature.title}</h3>
                <p style={{ color: '#AAB7C9' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="card-premium p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4" style={{ color: '#F5F0E6' }}>
                  Sécurité et Transparence
                </h2>
                <p className="mb-6" style={{ color: '#AAB7C9' }}>
                  Chaque ticket est généré de manière cryptographiquement sûre. Les résultats sont déterminés avant la vente et ne peuvent jamais être modifiés.
                </p>
                <ul className="space-y-3">
                  {[
                    'Résultats pré-déterminés et vérifiables',
                    'Registre comptable en double écriture',
                    'Protection contre les fraudes',
                    'Conformité réglementaire haïtienne',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#D4AF37' }} />
                      <span style={{ color: '#AAB7C9' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center">
                <div className="w-64 h-64 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(242, 214, 117, 0.1) 100%)', border: '2px solid rgba(212, 175, 55, 0.3)' }}>
                  <Shield className="w-32 h-32" style={{ color: '#D4AF37' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F2D675 100%)' }}>
                  <Sparkles className="w-6 h-6" style={{ color: '#07162E' }} />
                </div>
                <div>
                  <span className="text-xl font-bold block" style={{ color: '#F5F0E6' }}>AZAKA CHANS</span>
                  <span className="text-xs" style={{ color: '#AAB7C9' }}>Rasin nou. Chans nou.</span>
                </div>
              </div>
              <p className="text-sm" style={{ color: '#AAB7C9' }}>
                La loterie haïtienne nouvelle génération.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4" style={{ color: '#F5F0E6' }}>Navigation</h4>
              <ul className="space-y-2">
                <li><Link to="/boutique" className="text-sm hover:opacity-80 transition" style={{ color: '#AAB7C9' }}>Boutique</Link></li>
                <li><Link to="/portefeuille" className="text-sm hover:opacity-80 transition" style={{ color: '#AAB7C9' }}>Portefeuille</Link></li>
                <li><Link to="/mes-tickets" className="text-sm hover:opacity-80 transition" style={{ color: '#AAB7C9' }}>Mes Tickets</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4" style={{ color: '#F5F0E6' }}>Support</h4>
              <ul className="space-y-2">
                <li><Link to="/aide" className="text-sm hover:opacity-80 transition" style={{ color: '#AAB7C9' }}>Centre d'aide</Link></li>
                <li><Link to="/contact" className="text-sm hover:opacity-80 transition" style={{ color: '#AAB7C9' }}>Contact</Link></li>
                <li><Link to="/faq" className="text-sm hover:opacity-80 transition" style={{ color: '#AAB7C9' }}>FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4" style={{ color: '#F5F0E6' }}>Légal</h4>
              <ul className="space-y-2">
                <li><Link to="/conditions-utilisation" className="text-sm hover:opacity-80 transition" style={{ color: '#AAB7C9' }}>Conditions d'utilisation</Link></li>
                <li><Link to="/confidentialite" className="text-sm hover:opacity-80 transition" style={{ color: '#AAB7C9' }}>Politique de confidentialité</Link></li>
                <li><Link to="/jeu-responsable" className="text-sm hover:opacity-80 transition" style={{ color: '#AAB7C9' }}>Jeu responsable</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 text-center" style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <p className="text-sm" style={{ color: '#AAB7C9' }}>
              © 2024 AZAKA CHANS. Tous droits réservés. Jouer comporte des risques : endettement, dépendance... Appelez le 09 26 60 88 41 (appel non surtaxé).
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
