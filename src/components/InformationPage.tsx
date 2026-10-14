import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface InformationPageProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function InformationPage({ title, subtitle, children }: InformationPageProps) {
  const navigate = useNavigate();

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
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 mb-6 text-sm hover:opacity-80 transition"
          style={{ color: '#AAB7C9' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#F5F0E6' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg" style={{ color: '#AAB7C9' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Main Content */}
        <div className="card-premium p-8 md:p-12">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8 mt-20" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F2D675 100%)' }}>
              <Sparkles className="w-6 h-6" style={{ color: '#07162E' }} />
            </div>
            <div>
              <span className="text-xl font-bold block" style={{ color: '#F5F0E6' }}>AZAKA CHANS</span>
              <span className="text-xs" style={{ color: '#AAB7C9' }}>Rasin nou. Chans nou.</span>
            </div>
          </div>
          <p className="text-sm" style={{ color: '#AAB7C9' }}>
            © 2024 AZAKA CHANS. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
