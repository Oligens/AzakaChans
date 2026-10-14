import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Lock, ShoppingCart, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

interface TicketCategory {
  price: number;
  name: string;
  description: string;
  available: boolean;
  jackpotEligible: boolean;
}

const TICKET_CATEGORIES: TicketCategory[] = [
  { price: 50, name: 'Bronze', description: 'Ticket d\'entrée - Gains jusqu\'à 5 000 HTG', available: true, jackpotEligible: false },
  { price: 250, name: 'Silver', description: 'Ticket premium - Gains jusqu\'à 25 000 HTG', available: true, jackpotEligible: false },
  { price: 500, name: 'Gold', description: 'Ticket exclusif - Gains jusqu\'à 50 000 HTG', available: true, jackpotEligible: false },
  { price: 1000, name: 'Platinum', description: 'Ticket VIP - Gains jusqu\'à 100 000 HTG', available: true, jackpotEligible: true },
];

export function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePurchase = () => {
    if (selectedCategory === null) return;
    
    // Simulation d'achat - en production : appel API backend
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedCategory(null);
      setQuantity(1);
    }, 3000);
  };

  const selectedTicket = selectedCategory !== null ? TICKET_CATEGORIES[selectedCategory] : null;
  const total = selectedTicket ? selectedTicket.price * quantity : 0;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #07162E 0%, #0B1F3A 100%)' }}>
      {/* Navigation */}
      <nav className="border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F2D675 100%)' }}>
                <Sparkles className="w-6 h-6" style={{ color: '#07162E' }} />
              </div>
              <span className="text-xl font-bold" style={{ color: '#F5F0E6' }}>AZAKA CHANS</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/portefeuille" className="btn-secondary text-sm">
                Portefeuille
              </Link>
              <Link to="/mes-tickets" className="btn-premium text-sm">
                Mes Tickets
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 text-sm hover:opacity-80 transition" style={{ color: '#AAB7C9' }}>
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#F5F0E6' }}>
            Boutique de Tickets
          </h1>
          <p className="text-lg" style={{ color: '#AAB7C9' }}>
            Choisissez votre catégorie et tentez votre chance
          </p>
        </div>

        {/* Jackpot Banner */}
        <div className="card-premium p-6 mb-8 animate-pulse-gold">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F2D675 100%)' }}>
                <Sparkles className="w-8 h-8" style={{ color: '#07162E' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#AAB7C9' }}>Jackpot Itinérant</p>
                <p className="text-3xl font-bold" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F2D675 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  100 000 HTG
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm" style={{ color: '#AAB7C9' }}>Catégorie active</p>
              <p className="text-xl font-bold" style={{ color: '#D4AF37' }}>1 000 HTG</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="card-premium p-6 mb-8 flex items-center gap-4" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <CheckCircle className="w-8 h-8" style={{ color: '#10B981' }} />
            <div>
              <p className="font-bold" style={{ color: '#F5F0E6' }}>Achat réussi !</p>
              <p className="text-sm" style={{ color: '#AAB7C9' }}>Vos tickets ont été ajoutés à votre portefeuille.</p>
            </div>
          </div>
        )}

        {/* Ticket Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {TICKET_CATEGORIES.map((ticket, index) => (
            <div
              key={index}
              className={`card-premium p-6 cursor-pointer transition-all ${selectedCategory === index ? 'ring-2 ring-gold' : ''}`}
              style={{
                borderColor: selectedCategory === index ? '#D4AF37' : undefined,
              }}
              onClick={() => ticket.available && setSelectedCategory(index)}
            >
              {/* Ticket Illustration */}
              <div className="relative mb-6">
                <div className="aspect-square rounded-xl flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(242, 214, 117, 0.1) 100%)', border: '2px solid rgba(212, 175, 55, 0.3)' }}>
                  {/* Lock Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-16 h-16" style={{ color: '#D4AF37' }} />
                  </div>
                  {/* Serial Number */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-mono" style={{ background: 'rgba(11, 31, 58, 0.8)', color: '#AAB7C9' }}>
                    #{String(index + 1).padStart(4, '0')}
                  </div>
                </div>
              </div>

              {/* Ticket Info */}
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2" style={{ color: '#F5F0E6' }}>{ticket.name}</h3>
                <p className="text-3xl font-bold mb-2" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F2D675 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {ticket.price} HTG
                </p>
                <p className="text-sm mb-4" style={{ color: '#AAB7C9' }}>{ticket.description}</p>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {ticket.jackpotEligible && (
                    <span className="badge-premium badge-gold">
                      <Sparkles className="w-3 h-3" />
                      Jackpot
                    </span>
                  )}
                  {ticket.available ? (
                    <span className="badge-premium badge-success">Disponible</span>
                  ) : (
                    <span className="badge-premium badge-error">Épuisé</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Purchase Panel */}
        {selectedTicket && (
          <div className="card-premium p-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#F5F0E6' }}>
              Récapitulatif de l'achat
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#AAB7C9' }}>
                    Quantité
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="btn-secondary px-4 py-2"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold" style={{ color: '#F5F0E6' }}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="btn-secondary px-4 py-2"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span style={{ color: '#AAB7C9' }}>Prix unitaire</span>
                    <span className="font-bold" style={{ color: '#F5F0E6' }}>{selectedTicket.price} HTG</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#AAB7C9' }}>Quantité</span>
                    <span className="font-bold" style={{ color: '#F5F0E6' }}>× {quantity}</span>
                  </div>
                  <div className="pt-3" style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}>
                    <div className="flex justify-between">
                      <span className="text-lg font-bold" style={{ color: '#F5F0E6' }}>Total</span>
                      <span className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F2D675 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {total.toLocaleString()} HTG
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-end">
                <button onClick={handlePurchase} className="btn-premium w-full py-4 text-lg">
                  <ShoppingCart className="w-5 h-5 inline-block mr-2" />
                  Confirmer l'achat
                </button>
                <p className="text-xs text-center mt-4" style={{ color: '#AAB7C9' }}>
                  Le montant sera déduit de votre portefeuille
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rules Section */}
        <div className="card-premium p-8 mt-12">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#F5F0E6' }}>
            Règles du jeu
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-3" style={{ color: '#D4AF37' }}>Comment jouer ?</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span style={{ color: '#D4AF37' }}>1.</span>
                  <span style={{ color: '#AAB7C9' }}>Choisissez votre catégorie de ticket</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#D4AF37' }}>2.</span>
                  <span style={{ color: '#AAB7C9' }}>Achetez vos tickets via votre portefeuille</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#D4AF37' }}>3.</span>
                  <span style={{ color: '#AAB7C9' }}>Révélez vos tickets pour découvrir vos gains</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#D4AF37' }}>4.</span>
                  <span style={{ color: '#AAB7C9' }}>Retirez vos gains via MonCash ou NatCash</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3" style={{ color: '#D4AF37' }}>Informations importantes</h3>
              <ul className="space-y-2 text-sm" style={{ color: '#AAB7C9' }}>
                <li>• Les résultats sont déterminés avant la vente</li>
                <li>• Chaque ticket est unique et ne peut être révélé qu'une fois</li>
                <li>• Les gains sont crédités instantanément dans votre portefeuille</li>
                <li>• Le jackpot de 100 000 HTG est disponible sur les tickets Platinum</li>
                <li>• Jouez de manière responsable</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
