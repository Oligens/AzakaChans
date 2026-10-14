import { Link } from 'react-router-dom';
import { ArrowLeft, Database, Server, Shield, Lock, Globe, Smartphone, Zap } from 'lucide-react';

export function ArchitecturePage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #07162E 0%, #0B1F3A 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/gestion-privee" className="inline-flex items-center gap-2 mb-6 text-sm hover:opacity-80 transition" style={{ color: '#AAB7C9' }}>
          <ArrowLeft className="w-4 h-4" />
          Retour au dashboard
        </Link>

        <h1 className="text-4xl font-bold mb-4" style={{ color: '#F5F0E6' }}>Architecture Technique</h1>
        <p className="text-lg mb-12" style={{ color: '#AAB7C9' }}>
          Vue d'ensemble des composants du système AZAKA CHANS
        </p>

        {/* Components Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Smartphone, title: 'Application Mobile', desc: 'React Native / Expo', color: '#3B82F6' },
            { icon: Globe, title: 'Application Web', desc: 'React / Next.js', color: '#10B981' },
            { icon: Server, title: 'Backend API', desc: 'FastAPI / Python', color: '#8B5CF6' },
            { icon: Database, title: 'Base de Données', desc: 'PostgreSQL ACID', color: '#F59E0B' },
            { icon: Zap, title: 'Moteur de Lottery', desc: 'Services modulaires', color: '#EF4444' },
            { icon: Shield, title: 'Sécurité', desc: 'Auth + Chiffrement', color: '#D4AF37' },
          ].map((comp, i) => (
            <div key={i} className="card-premium p-6">
              <comp.icon className="w-10 h-10 mb-4" style={{ color: comp.color }} />
              <h3 className="text-lg font-bold mb-2" style={{ color: '#F5F0E6' }}>{comp.title}</h3>
              <p style={{ color: '#AAB7C9' }}>{comp.desc}</p>
            </div>
          ))}
        </div>

        {/* Security Notice */}
        <div className="card-premium p-6" style={{ borderColor: 'rgba(212, 175, 55, 0.3)' }}>
          <div className="flex items-start gap-4">
            <Lock className="w-8 h-8 flex-shrink-0" style={{ color: '#D4AF37' }} />
            <div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#F5F0E6' }}>Informations Sécurisées</h3>
              <p className="text-sm" style={{ color: '#AAB7C9' }}>
                Cette page affiche des informations techniques non sensibles. Les secrets d'API, 
                mots de passe et clés privées ne sont jamais affichés dans l'interface.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
