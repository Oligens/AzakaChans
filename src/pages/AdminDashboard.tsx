import { Link } from 'react-router-dom';
import { useAuth, logout } from '../services/authService';
import { Sparkles, LogOut, LayoutDashboard, Ticket, DollarSign, Shield, Database, ArrowDownToLine, RefreshCw, Zap, PieChart, FileText, Activity } from 'lucide-react';

export function AdminDashboard() {
  const { user } = useAuth();

  const menuItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'jackpot', label: 'Jackpot Itinérant', icon: Sparkles },
    { id: 'platform', label: 'État Plateforme', icon: Activity },
    { id: 'series', label: 'Séries & Tickets', icon: Ticket },
    { id: 'financial', label: 'Moteur Financier', icon: DollarSign },
    { id: 'ledger', label: 'Registre Comptable', icon: Database },
    { id: 'withdrawals', label: 'Retraits', icon: ArrowDownToLine },
    { id: 'claims', label: 'Réclamations', icon: FileText },
    { id: 'cycles', label: 'Cycles Horaires', icon: RefreshCw },
    { id: 'tests', label: 'Tests Automatisés', icon: Zap },
    { id: 'reports', label: 'Rapports', icon: PieChart },
    { id: 'audit', label: 'Audit & Sécurité', icon: Shield },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #07162E 0%, #0B1F3A 100%)' }}>
      {/* Sidebar */}
      <aside className="w-64 border-r flex flex-col" style={{ borderColor: 'rgba(212, 175, 55, 0.2)', background: 'rgba(11, 31, 58, 0.5)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F2D675 100%)' }}>
              <Shield className="w-6 h-6" style={{ color: '#07162E' }} />
            </div>
            <div>
              <h1 className="font-bold" style={{ color: '#F5F0E6' }}>Admin</h1>
              <p className="text-xs" style={{ color: '#AAB7C9' }}>AZAKA CHANS</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition hover:bg-white/5"
              style={{ color: '#AAB7C9' }}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
          <div className="mb-3">
            <p className="text-sm font-medium" style={{ color: '#F5F0E6' }}>{user?.name}</p>
            <p className="text-xs" style={{ color: '#AAB7C9' }}>{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-white/5" style={{ color: '#AAB7C9' }}>
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#F5F0E6' }}>Tableau de Bord</h1>
            <p style={{ color: '#AAB7C9' }}>Bienvenue dans l'espace d'administration</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Recettes Nettes', value: '196 750 HTG', color: '#10B981' },
              { label: 'Lots Versés', value: '128 000 HTG', color: '#F59E0B' },
              { label: 'Couverture', value: '83%', color: '#EF4444' },
              { label: 'Retraits en Attente', value: '2', color: '#3B82F6' },
            ].map((stat, i) => (
              <div key={i} className="card-premium p-6">
                <p className="text-sm mb-2" style={{ color: '#AAB7C9' }}>{stat.label}</p>
                <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="card-premium p-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#F5F0E6' }}>Actions Rapides</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/gestion-privee/architecture" className="btn-secondary text-center">
                Architecture Technique
              </Link>
              <button className="btn-premium">
                Nouvelle Série
              </button>
              <button className="btn-secondary">
                Voir les Alertes
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
