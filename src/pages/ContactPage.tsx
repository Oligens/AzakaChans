import { InformationPage } from '../components/InformationPage';
import { Mail, MessageCircle, User } from 'lucide-react';

export function ContactPage() {
  return (
    <InformationPage 
      title="Nous contacter" 
      subtitle="Nous sommes là pour vous aider"
    >
      <div className="space-y-8">
        {/* Introduction */}
        <div className="text-center mb-8">
          <p className="text-lg" style={{ color: '#AAB7C9' }}>
            Une question, un problème ou une suggestion ? N'hésitez pas à nous contacter.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="card-premium p-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
              <Mail className="w-6 h-6" style={{ color: '#D4AF37' }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#F5F0E6' }}>Email</h3>
            <p className="text-sm mb-4" style={{ color: '#AAB7C9' }}>
              Envoyez-nous un email et nous vous répondrons dans les plus brefs délais.
            </p>
            <a 
              href="mailto:cleefolig@gmail.com"
              className="btn-premium inline-flex items-center gap-2 w-full justify-center"
            >
              <Mail className="w-4 h-4" />
              Envoyer un email
            </a>
            <p className="text-xs mt-3 text-center" style={{ color: '#AAB7C9' }}>
              cleefolig@gmail.com
            </p>
          </div>

          {/* WhatsApp */}
          <div className="card-premium p-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
              <MessageCircle className="w-6 h-6" style={{ color: '#D4AF37' }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#F5F0E6' }}>WhatsApp</h3>
            <p className="text-sm mb-4" style={{ color: '#AAB7C9' }}>
              Contactez-nous directement sur WhatsApp pour une réponse rapide.
            </p>
            <a 
              href="https://wa.me/50944617600"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium inline-flex items-center gap-2 w-full justify-center"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            <p className="text-xs mt-3 text-center" style={{ color: '#AAB7C9' }}>
              +509 44 61 76 00
            </p>
          </div>
        </div>

        {/* Developer Info */}
        <div className="mt-12 p-6 rounded-xl" style={{ background: 'rgba(11, 31, 58, 0.5)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F2D675 100%)' }}>
              <User className="w-6 h-6" style={{ color: '#07162E' }} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: '#F5F0E6' }}>Développeur</h3>
              <p className="text-sm" style={{ color: '#D4AF37' }}>Cleef Oligens JOSEPH</p>
            </div>
          </div>
          <div className="space-y-2 text-sm" style={{ color: '#AAB7C9' }}>
            <p>
              <strong style={{ color: '#F5F0E6' }}>Email :</strong> cleefolig@gmail.com
            </p>
            <p>
              <strong style={{ color: '#F5F0E6' }}>WhatsApp :</strong> +509 44 61 76 00
            </p>
          </div>
        </div>

        {/* Response Time */}
        <div className="text-center p-6 rounded-xl" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
          <h3 className="text-lg font-bold mb-2" style={{ color: '#F5F0E6' }}>Délai de réponse</h3>
          <p className="text-sm" style={{ color: '#AAB7C9' }}>
            Nous nous efforçons de répondre à toutes les demandes dans un délai de 24 à 48 heures ouvrables.
          </p>
        </div>
      </div>
    </InformationPage>
  );
}
