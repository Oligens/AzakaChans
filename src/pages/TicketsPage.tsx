import { Link } from 'react-router-dom';
import { ArrowLeft, Ticket, CheckCircle, Clock, Lock } from 'lucide-react';

export function TicketsPage() {
  // Données simulées - en production : appel API backend
  const tickets = [
    { id: 'CHN-2024-00002', type: 'PHYSICAL', status: 'REVEALED', price: 100, prize: 500, date: '2024-03-21' },
    { id: 'CHN-2024-00003', type: 'PHYSICAL', status: 'REDEEMED', price: 100, prize: 10000, date: '2024-03-22' },
    { id: 'CHN-2024-00009', type: 'VIRTUAL', status: 'REDEEMED', price: 250, prize: 1000, date: '2024-04-09' },
    { id: 'CHN-2024-00001', type: 'PHYSICAL', status: 'SOLD', price: 100, prize: null, date: '2024-03-20' },
  ];

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      SOLD: { label: 'À révéler', color: '#3B82F6' },
      REVEALED: { label: 'Révélé', color: '#10B981' },
      REDEEMED: { label: 'Encaissé', color: '#8B5CF6' },
    };
    const { label, color } = config[status] || { label: status, color: '#AAB7C9' };
    return (
      <span className="badge-premium" style={{ background: `${color}20`, color, borderColor: `${color}50` }}>
        {label}
      </span>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #07162E 0%, #0B1F3A 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="inline-flex items-center gap-2 mb-6 text-sm hover:opacity-80 transition" style={{ color: '#AAB7C9' }}>
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#F5F0E6' }}>Mes Tickets</h1>
            <p style={{ color: '#AAB7C9' }}>{tickets.length} tickets au total</p>
          </div>
          <Link to="/boutique" className="btn-premium">
            Acheter des tickets
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card-premium p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <p className="text-sm" style={{ color: '#AAB7C9' }}>À révéler</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#F5F0E6' }}>
              {tickets.filter(t => t.status === 'SOLD').length}
            </p>
          </div>
          <div className="card-premium p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5" style={{ color: '#10B981' }} />
              <p className="text-sm" style={{ color: '#AAB7C9' }}>Gains totaux</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#10B981' }}>
              {tickets.reduce((sum, t) => sum + (t.prize || 0), 0).toLocaleString()} HTG
            </p>
          </div>
          <div className="card-premium p-6">
            <div className="flex items-center gap-3 mb-2">
              <Ticket className="w-5 h-5" style={{ color: '#D4AF37' }} />
              <p className="text-sm" style={{ color: '#AAB7C9' }}>Total tickets</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#F5F0E6' }}>{tickets.length}</p>
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map(ticket => (
            <div key={ticket.id} className="card-premium p-6">
              {/* Ticket Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-mono text-sm font-medium" style={{ color: '#F5F0E6' }}>{ticket.id}</p>
                  <p className="text-xs mt-1" style={{ color: '#AAB7C9' }}>
                    {ticket.type === 'PHYSICAL' ? '🎫 Physique' : '📱 Virtuel'} • {ticket.price} HTG
                  </p>
                </div>
                {getStatusBadge(ticket.status)}
              </div>

              {/* Ticket Body */}
              <div className="aspect-video rounded-xl flex items-center justify-center mb-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(242, 214, 117, 0.1) 100%)', border: '2px solid rgba(212, 175, 55, 0.3)' }}>
                {ticket.status === 'SOLD' ? (
                  <Lock className="w-12 h-12" style={{ color: '#D4AF37' }} />
                ) : (
                  <div className="text-center">
                    <p className="text-xs" style={{ color: '#AAB7C9' }}>Gain</p>
                    <p className="text-2xl font-bold" style={{ color: '#10B981' }}>{ticket.prize?.toLocaleString()} HTG</p>
                  </div>
                )}
              </div>

              {/* Ticket Footer */}
              <div className="flex items-center justify-between text-xs" style={{ color: '#AAB7C9' }}>
                <span>Acheté: {ticket.date}</span>
                {ticket.status === 'SOLD' && (
                  <button className="btn-premium text-xs py-1 px-3">
                    Révéler
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
