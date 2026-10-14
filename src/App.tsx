import { useState } from 'react';
import { 
  LayoutDashboard, Ticket, Wallet, ShoppingCart, ArrowDownToLine, 
  Users, Settings, BarChart3, FileText, Shield, QrCode, 
  Menu, X, ChevronRight, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle2, Clock, XCircle, Eye, EyeOff, Copy, Sparkles,
  Database, Server, Lock, Globe, Smartphone, CreditCard
} from 'lucide-react';
import { 
  mockTickets, mockWallets, mockWithdrawals, mockBatches, 
  mockTransactions, mockUsers, mockAuditLogs, prizeDistribution 
} from './data';
import { Ticket as TicketType, TicketStatus } from './types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

type Page = 'user-dashboard' | 'user-shop' | 'user-tickets' | 'user-wallet' | 'user-scan' | 'admin-dashboard' | 'admin-tickets' | 'admin-withdrawals' | 'admin-reports' | 'admin-audit' | 'architecture';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('user-dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'user' | 'admin' | 'archi'>('user');

  const userMenuItems = [
    { id: 'user-dashboard' as Page, label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'user-shop' as Page, label: 'Boutique', icon: ShoppingCart },
    { id: 'user-tickets' as Page, label: 'Mes Tickets', icon: Ticket },
    { id: 'user-scan' as Page, label: 'Scanner QR', icon: QrCode },
    { id: 'user-wallet' as Page, label: 'Portefeuille', icon: Wallet },
  ];

  const adminMenuItems = [
    { id: 'admin-dashboard' as Page, label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'admin-tickets' as Page, label: 'Gestion Tickets', icon: Ticket },
    { id: 'admin-withdrawals' as Page, label: 'Retraits', icon: ArrowDownToLine },
    { id: 'admin-reports' as Page, label: 'Rapports', icon: BarChart3 },
    { id: 'admin-audit' as Page, label: 'Audit & Sécurité', icon: Shield },
  ];

  const archiMenuItems = [
    { id: 'architecture' as Page, label: 'Architecture', icon: Database },
  ];

  const getMenuItems = () => {
    if (viewMode === 'admin') return adminMenuItems;
    if (viewMode === 'archi') return archiMenuItems;
    return userMenuItems;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-blue-900 to-blue-950 text-white transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-900" />
              </div>
              <div>
                <h1 className="font-bold text-lg">ChansAyiti</h1>
                <p className="text-xs text-blue-300">Loterie Numérique</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="px-4 mb-4">
          <div className="bg-blue-800/50 rounded-xl p-1 flex gap-1">
            <button onClick={() => { setViewMode('user'); setCurrentPage('user-dashboard'); }} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition ${viewMode === 'user' ? 'bg-yellow-400 text-blue-900' : 'text-blue-200 hover:text-white'}`}>
              Utilisateur
            </button>
            <button onClick={() => { setViewMode('admin'); setCurrentPage('admin-dashboard'); }} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition ${viewMode === 'admin' ? 'bg-yellow-400 text-blue-900' : 'text-blue-200 hover:text-white'}`}>
              Admin
            </button>
            <button onClick={() => { setViewMode('archi'); setCurrentPage('architecture'); }} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition ${viewMode === 'archi' ? 'bg-yellow-400 text-blue-900' : 'text-blue-200 hover:text-white'}`}>
              Archi
            </button>
          </div>
        </div>

        <nav className="px-4 space-y-1">
          {getMenuItems().map(item => (
            <button
              key={item.id}
              onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${currentPage === item.id ? 'bg-white/15 text-yellow-400' : 'text-blue-200 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-blue-800/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-xs font-bold text-green-900">JP</div>
              <div>
                <p className="text-sm font-medium">Jean Pierre</p>
                <p className="text-xs text-blue-300">+509 3456 7890</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="hidden sm:inline">{viewMode === 'user' ? 'Espace Utilisateur' : viewMode === 'admin' ? 'Administration' : 'Architecture Technique'}</span>
              <ChevronRight className="w-4 h-4" />
              <span className="font-medium text-gray-900">
                {getMenuItems().find(i => i.id === currentPage)?.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Système opérationnel
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {currentPage === 'user-dashboard' && <UserDashboard />}
          {currentPage === 'user-shop' && <UserShop />}
          {currentPage === 'user-tickets' && <UserTickets />}
          {currentPage === 'user-scan' && <UserScan />}
          {currentPage === 'user-wallet' && <UserWallet />}
          {currentPage === 'admin-dashboard' && <AdminDashboard />}
          {currentPage === 'admin-tickets' && <AdminTickets />}
          {currentPage === 'admin-withdrawals' && <AdminWithdrawals />}
          {currentPage === 'admin-reports' && <AdminReports />}
          {currentPage === 'admin-audit' && <AdminAudit />}
          {currentPage === 'architecture' && <ArchitecturePage />}
        </div>
      </main>
    </div>
  );
}

// ==================== USER PAGES ====================

function UserDashboard() {
  const wallet = mockWallets['u1'];
  const userTickets = mockTickets.filter(t => t.ownerId === 'u1');
  const recentWins = userTickets.filter(t => t.prizeAmount && t.prizeAmount > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, Jean 👋</h1>
          <p className="text-gray-500">Voici votre activité récente</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-10 -translate-x-10" />
        <div className="relative">
          <p className="text-blue-200 text-sm">Solde disponible</p>
          <p className="text-4xl font-bold mt-1">{wallet.balance.toLocaleString()} <span className="text-xl">HTG</span></p>
          <div className="flex gap-4 mt-4">
            <div className="bg-white/10 rounded-lg px-3 py-2">
              <p className="text-xs text-blue-200">Gains totaux</p>
              <p className="font-semibold">{wallet.totalWinnings.toLocaleString()} HTG</p>
            </div>
            <div className="bg-white/10 rounded-lg px-3 py-2">
              <p className="text-xs text-blue-200">Retraits</p>
              <p className="font-semibold">{wallet.totalWithdrawals.toLocaleString()} HTG</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Ticket} label="Tickets achetés" value={userTickets.length.toString()} color="blue" />
        <StatCard icon={Sparkles} label="Tickets gagnants" value={recentWins.length.toString()} color="yellow" />
        <StatCard icon={TrendingUp} label="Meilleur gain" value="1 000 HTG" color="green" />
        <StatCard icon={Clock} label="En attente" value={userTickets.filter(t => t.status === 'SOLD').length.toString()} color="purple" />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Activité récente</h3>
        <div className="space-y-3">
          {userTickets.slice(0, 5).map(ticket => (
            <div key={ticket.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ticket.status === 'REVEALED' || ticket.status === 'REDEEMED' ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {ticket.status === 'REVEALED' || ticket.status === 'REDEEMED' ? 
                    <CheckCircle2 className="w-5 h-5 text-green-600" /> : 
                    <Ticket className="w-5 h-5 text-blue-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{ticket.publicId}</p>
                  <p className="text-xs text-gray-500">{ticket.type === 'PHYSICAL' ? '🎫 Physique' : '📱 Virtuel'} • {ticket.purchasedAt}</p>
                </div>
              </div>
              <div className="text-right">
                {ticket.prizeAmount ? (
                  <p className="text-sm font-bold text-green-600">+{ticket.prizeAmount.toLocaleString()} HTG</p>
                ) : (
                  <p className="text-sm text-gray-400">En attente</p>
                )}
                <StatusBadge status={ticket.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UserShop() {
  const [selectedPack, setSelectedPack] = useState<number | null>(null);

  const packs = [
    { id: 1, name: 'Ticket Simple', price: 100, tickets: 1, color: 'from-blue-500 to-blue-600', popular: false },
    { id: 2, name: 'Pack 3 Tickets', price: 280, tickets: 3, color: 'from-purple-500 to-purple-600', popular: true },
    { id: 3, name: 'Pack 5 Tickets', price: 450, tickets: 5, color: 'from-orange-500 to-orange-600', popular: false },
    { id: 4, name: 'Pack 10 Tickets', price: 850, tickets: 10, color: 'from-green-500 to-green-600', popular: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Boutique de Tickets</h1>
        <p className="text-gray-500">Achetez des tickets virtuels et tentez votre chance</p>
      </div>

      {/* Prize Distribution */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Lots possibles
        </h3>
        <div className="flex flex-wrap gap-2">
          {prizeDistribution.map((p, i) => (
            <span key={i} className="bg-white px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-sm border">
              {p.label} <span className="text-gray-400">({(p.probability * 100).toFixed(1)}%)</span>
            </span>
          ))}
        </div>
      </div>

      {/* Packs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {packs.map(pack => (
          <div key={pack.id} className={`relative bg-white rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg ${selectedPack === pack.id ? 'border-blue-500 shadow-lg scale-[1.02]' : 'border-gray-200'}`} onClick={() => setSelectedPack(pack.id)}>
            {pack.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                POPULAIRE
              </div>
            )}
            <div className={`h-2 bg-gradient-to-r ${pack.color} rounded-t-2xl`} />
            <div className="p-5">
              <h3 className="font-semibold text-gray-900">{pack.name}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pack.price} <span className="text-sm text-gray-500">HTG</span></p>
              <p className="text-sm text-gray-500 mt-1">{pack.tickets} ticket{pack.tickets > 1 ? 's' : ''}</p>
              <button className={`w-full mt-4 py-2.5 rounded-xl font-medium text-sm transition ${selectedPack === pack.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                {selectedPack === pack.id ? '✓ Sélectionné' : 'Acheter'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Purchase Summary */}
      {selectedPack && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif</h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">{packs.find(p => p.id === selectedPack)?.name}</p>
              <p className="text-sm text-gray-500">{packs.find(p => p.id === selectedPack)?.tickets} ticket(s) virtuel(s)</p>
            </div>
            <p className="text-2xl font-bold">{packs.find(p => p.id === selectedPack)?.price} HTG</p>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition">
              Payer avec le portefeuille
            </button>
            <button className="px-4 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition">
              MonCash
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function UserTickets() {
  const [filter, setFilter] = useState<'ALL' | TicketStatus>('ALL');
  const userTickets = mockTickets.filter(t => t.ownerId === 'u1');
  const filteredTickets = filter === 'ALL' ? userTickets : userTickets.filter(t => t.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Tickets</h1>
        <p className="text-gray-500">Gérez vos tickets physiques et virtuels</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'CREATED', 'SOLD', 'REVEALED', 'REDEEMED'] as const).map(status => (
          <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === status ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {status === 'ALL' ? 'Tous' : status === 'CREATED' ? 'Créés' : status === 'SOLD' ? 'Vendus' : status === 'REVEALED' ? 'Révélés' : 'Encaissés'}
          </button>
        ))}
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTickets.map(ticket => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun ticket trouvé</p>
        </div>
      )}
    </div>
  );
}

function TicketCard({ ticket }: { ticket: TicketType }) {
  const [revealed, setRevealed] = useState(ticket.status !== 'SOLD');

  return (
    <div className={`bg-white rounded-2xl border-2 overflow-hidden transition hover:shadow-lg ${ticket.status === 'REDEEMED' ? 'border-green-200' : ticket.status === 'REVEALED' ? 'border-blue-200' : 'border-gray-200'}`}>
      <div className={`h-1.5 ${ticket.type === 'PHYSICAL' ? 'bg-gradient-to-r from-orange-400 to-orange-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-mono text-sm font-medium text-gray-900">{ticket.publicId}</p>
            <p className="text-xs text-gray-500 mt-0.5">{ticket.type === 'PHYSICAL' ? '🎫 Physique' : '📱 Virtuel'}</p>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        {ticket.status === 'SOLD' && !revealed ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mx-auto flex items-center justify-center mb-3 animate-pulse">
              <span className="text-2xl">🎁</span>
            </div>
            <button onClick={() => setRevealed(true)} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:shadow-lg transition">
              ✨ Révéler le gain
            </button>
          </div>
        ) : ticket.prizeAmount ? (
          <div className="text-center py-3">
            <p className="text-xs text-gray-500 mb-1">Gain</p>
            <p className="text-2xl font-bold text-green-600">{ticket.prizeAmount.toLocaleString()} HTG</p>
            {ticket.status === 'REVEALED' && (
              <button className="mt-2 text-xs text-blue-600 font-medium hover:underline">
                Demander le retrait →
              </button>
            )}
            {ticket.status === 'REDEEMED' && (
              <p className="mt-2 text-xs text-green-600 font-medium">✓ Gain encaissé</p>
            )}
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-sm text-gray-400">Ticket en attente de révélation</p>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
          <span>Acheté: {ticket.purchasedAt || '-'}</span>
          <span>{ticket.revealedAt ? `Révélé: ${ticket.revealedAt}` : ''}</span>
        </div>
      </div>
    </div>
  );
}

function UserScan() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<null | { success: boolean; ticket?: TicketType; message: string }>(null);

  const simulateScan = () => {
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      setScanning(false);
      const ticket = mockTickets.find(t => t.id === 't1');
      if (ticket) {
        setResult({ success: true, ticket, message: 'Ticket valide ! Cliquez pour révéler votre gain.' });
      }
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Scanner un Ticket</h1>
        <p className="text-gray-500">Scannez le QR code de votre ticket physique</p>
      </div>

      {/* Scanner Area */}
      <div className="bg-gray-900 rounded-3xl p-8 aspect-square flex items-center justify-center relative overflow-hidden">
        {scanning ? (
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-sm">Analyse en cours...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-48 h-48 border-2 border-dashed border-white/30 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <QrCode className="w-16 h-16 text-white/50" />
            </div>
            <p className="text-white/70 text-sm">Placez le QR code dans le cadre</p>
          </div>
        )}
        {/* Corner markers */}
        <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-yellow-400 rounded-tl-lg" />
        <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-yellow-400 rounded-tr-lg" />
        <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-yellow-400 rounded-bl-lg" />
        <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-yellow-400 rounded-br-lg" />
      </div>

      <button onClick={simulateScan} disabled={scanning} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-medium hover:bg-blue-700 transition disabled:opacity-50">
        {scanning ? 'Analyse...' : '📸 Simuler un scan'}
      </button>

      {/* Manual Entry */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Saisie manuelle</h3>
        <div className="space-y-3">
          <input type="text" placeholder="ID public (ex: CHN-2024-00001)" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
          <input type="text" placeholder="Code secret" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
          <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition">
            Vérifier le ticket
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-2xl p-6 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            {result.success ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <XCircle className="w-6 h-6 text-red-600" />}
            <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>{result.message}</p>
          </div>
          {result.ticket && (
            <div className="bg-white rounded-xl p-4 mt-3">
              <p className="font-mono text-sm">{result.ticket.publicId}</p>
              <p className="text-xs text-gray-500 mt-1">Statut: {result.ticket.status}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UserWallet() {
  const wallet = mockWallets['u1'];
  const userTransactions = mockTransactions.filter(t => t.creditAccount === 'u1-wallet' || t.debitAccount === 'u1-wallet');
  const [showWithdraw, setShowWithdraw] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Portefeuille</h1>
        <p className="text-gray-500">Gérez votre solde et vos transactions</p>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white lg:col-span-2">
          <p className="text-blue-200 text-sm">Solde disponible</p>
          <p className="text-4xl font-bold mt-1">{wallet.balance.toLocaleString()} HTG</p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowWithdraw(true)} className="bg-white text-blue-700 px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-50 transition">
              Retirer
            </button>
            <button className="bg-white/20 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-white/30 transition">
              Déposer
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm text-gray-500 mb-3">Résumé</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Dépôts</span>
              <span className="font-medium">{wallet.totalDeposits.toLocaleString()} HTG</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Gains</span>
              <span className="font-medium text-green-600">{wallet.totalWinnings.toLocaleString()} HTG</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Retraits</span>
              <span className="font-medium text-red-600">{wallet.totalWithdrawals.toLocaleString()} HTG</span>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowWithdraw(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Demander un retrait</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Montant (HTG)</label>
                <input type="number" placeholder="Ex: 500" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                <p className="text-xs text-gray-400 mt-1">Solde disponible: {wallet.balance.toLocaleString()} HTG</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Méthode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="border-2 border-blue-500 bg-blue-50 text-blue-700 py-3 rounded-xl font-medium text-sm">
                    📱 MonCash
                  </button>
                  <button className="border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-medium text-sm hover:border-gray-300">
                    📱 NatCash
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Numéro de téléphone</label>
                <input type="tel" placeholder="+509 XXXX XXXX" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition">
                Confirmer le retrait
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Historique des transactions</h3>
        <div className="space-y-3">
          {userTransactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'WIN_CREDIT' ? 'bg-green-100' : tx.type === 'TICKET_PURCHASE' ? 'bg-red-100' : 'bg-blue-100'}`}>
                  {tx.type === 'WIN_CREDIT' ? <TrendingUp className="w-5 h-5 text-green-600" /> : tx.type === 'TICKET_PURCHASE' ? <TrendingDown className="w-5 h-5 text-red-600" /> : <ArrowDownToLine className="w-5 h-5 text-blue-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                  <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <p className={`font-semibold ${tx.creditAccount === 'u1-wallet' ? 'text-green-600' : 'text-red-600'}`}>
                {tx.creditAccount === 'u1-wallet' ? '+' : '-'}{tx.amount.toLocaleString()} HTG
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== ADMIN PAGES ====================

function AdminDashboard() {
  const totalRevenue = mockBatches.reduce((sum, b) => sum + b.totalRevenue, 0);
  const totalPrizes = mockBatches.reduce((sum, b) => sum + b.totalPrizes, 0);
  const pendingWithdrawals = mockWithdrawals.filter(w => w.status === 'PENDING').length;
  const totalTicketsSold = mockBatches.reduce((sum, b) => sum + b.soldTickets, 0);

  const revenueData = [
    { month: 'Jan', revenue: 45000, prizes: 27000 },
    { month: 'Fév', revenue: 62000, prizes: 38000 },
    { month: 'Mar', revenue: 97000, prizes: 58000 },
    { month: 'Avr', revenue: 4500, prizes: 5000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Admin</h1>
        <p className="text-gray-500">Vue d'ensemble de la plateforme ChansAyiti</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Revenus totaux</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold">{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-400">HTG</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Lots versés</span>
            <TrendingDown className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold">{totalPrizes.toLocaleString()}</p>
          <p className="text-xs text-gray-400">HTG</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Tickets vendus</span>
            <Ticket className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{totalTicketsSold.toLocaleString()}</p>
          <p className="text-xs text-gray-400">tickets</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Retraits en attente</span>
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold">{pendingWithdrawals}</p>
          <p className="text-xs text-gray-400">demandes</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Revenus vs Lots (HTG)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#3B82F6" name="Revenus" radius={[4, 4, 0, 0]} />
              <Bar dataKey="prizes" fill="#F59E0B" name="Lots" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Répartition des lots</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={prizeDistribution.slice(0, 5)} dataKey="probability" nameKey="label" cx="50%" cy="50%" outerRadius={80} label={({ label }) => label}>
                {prizeDistribution.slice(0, 5).map((_, i) => (
                  <Cell key={i} fill={['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'][i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Batches */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Lots de tickets</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Lot</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Tickets</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Vendus</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Revenus</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Lots</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Marge</th>
              </tr>
            </thead>
            <tbody>
              {mockBatches.map(batch => (
                <tr key={batch.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{batch.name}</td>
                  <td className="py-3 px-4">{batch.totalTickets}</td>
                  <td className="py-3 px-4">{batch.soldTickets} ({((batch.soldTickets / batch.totalTickets) * 100).toFixed(0)}%)</td>
                  <td className="py-3 px-4">{batch.totalRevenue.toLocaleString()} HTG</td>
                  <td className="py-3 px-4">{batch.totalPrizes.toLocaleString()} HTG</td>
                  <td className="py-3 px-4 font-medium text-green-600">{(batch.totalRevenue - batch.totalPrizes).toLocaleString()} HTG</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminTickets() {
  const [selectedBatch, setSelectedBatch] = useState('all');
  const filteredTickets = selectedBatch === 'all' ? mockTickets : mockTickets.filter(t => t.batchId === selectedBatch);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Tickets</h1>
          <p className="text-gray-500">Superviser et gérer tous les tickets</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition">
          + Nouveau lot
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white">
          <option value="all">Tous les lots</option>
          {mockBatches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Propriétaire</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Gain</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs">{ticket.publicId}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${ticket.type === 'PHYSICAL' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {ticket.type === 'PHYSICAL' ? 'Physique' : 'Virtuel'}
                    </span>
                  </td>
                  <td className="py-3 px-4"><StatusBadge status={ticket.status} /></td>
                  <td className="py-3 px-4">{ticket.ownerId ? mockUsers.find(u => u.id === ticket.ownerId)?.name || '-' : '-'}</td>
                  <td className="py-3 px-4 font-medium">{ticket.prizeAmount ? `${ticket.prizeAmount.toLocaleString()} HTG` : '-'}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg" title="Voir"><Eye className="w-4 h-4 text-gray-400" /></button>
                      <button className="p-1.5 hover:bg-red-50 rounded-lg" title="Suspendre"><AlertTriangle className="w-4 h-4 text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminWithdrawals() {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED'>('ALL');
  const filtered = filter === 'ALL' ? mockWithdrawals : mockWithdrawals.filter(w => w.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Retraits</h1>
        <p className="text-gray-500">Valider ou rejeter les demandes de retrait</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-700">En attente</p>
          <p className="text-2xl font-bold text-yellow-800">{mockWithdrawals.filter(w => w.status === 'PENDING').length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-700">Complétés</p>
          <p className="text-2xl font-bold text-green-800">{mockWithdrawals.filter(w => w.status === 'COMPLETED').length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700">Approuvés</p>
          <p className="text-2xl font-bold text-blue-800">{mockWithdrawals.filter(w => w.status === 'APPROVED').length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">Rejetés</p>
          <p className="text-2xl font-bold text-red-800">{mockWithdrawals.filter(w => w.status === 'REJECTED').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'] as const).map(status => (
          <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === status ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {status === 'ALL' ? 'Tous' : status === 'PENDING' ? 'En attente' : status === 'APPROVED' ? 'Approuvés' : status === 'COMPLETED' ? 'Complétés' : 'Rejetés'}
          </button>
        ))}
      </div>

      {/* Withdrawals List */}
      <div className="space-y-3">
        {filtered.map(w => (
          <div key={w.id} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${w.provider === 'MONCASH' ? 'bg-blue-100' : 'bg-green-100'}`}>
                  <CreditCard className={`w-6 h-6 ${w.provider === 'MONCASH' ? 'text-blue-600' : 'text-green-600'}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{w.userName}</p>
                  <p className="text-sm text-gray-500">{w.provider} • {w.phoneNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(w.requestedAt).toLocaleString('fr-FR')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{w.amount.toLocaleString()} HTG</p>
                <WithdrawalStatusBadge status={w.status} />
              </div>
            </div>
            {w.status === 'PENDING' && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-green-700 transition">
                  ✓ Approuver
                </button>
                <button className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-red-700 transition">
                  ✗ Rejeter
                </button>
              </div>
            )}
            {w.adminNote && (
              <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">Note: {w.adminNote}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminReports() {
  const monthlyData = [
    { month: 'Jan', ventes: 45000, lots: 27000, marge: 18000 },
    { month: 'Fév', ventes: 62000, lots: 38000, marge: 24000 },
    { month: 'Mar', ventes: 97000, lots: 58000, marge: 39000 },
    { month: 'Avr', ventes: 4500, lots: 5000, marge: -500 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rapports Financiers</h1>
        <p className="text-gray-500">Analyse des performances de la plateforme</p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <p className="text-green-100 text-sm">Recettes brutes</p>
          <p className="text-3xl font-bold mt-1">208 500 HTG</p>
          <p className="text-green-200 text-xs mt-2">Total des ventes de tickets</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <p className="text-orange-100 text-sm">Lots versés</p>
          <p className="text-3xl font-bold mt-1">128 000 HTG</p>
          <p className="text-orange-200 text-xs mt-2">61.4% du chiffre d'affaires</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <p className="text-blue-100 text-sm">Marge brute</p>
          <p className="text-3xl font-bold mt-1">80 500 HTG</p>
          <p className="text-blue-200 text-xs mt-2">38.6% du chiffre d'affaires</p>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Évolution mensuelle</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="ventes" stroke="#3B82F6" strokeWidth={2} name="Ventes" />
            <Line type="monotone" dataKey="lots" stroke="#F59E0B" strokeWidth={2} name="Lots" />
            <Line type="monotone" dataKey="marge" stroke="#10B981" strokeWidth={2} name="Marge" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Double Entry Ledger */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Registre en double écriture</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Débit</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Crédit</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Montant</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Réf.</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map(tx => (
                <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 text-xs">{new Date(tx.createdAt).toLocaleString('fr-FR')}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100">{tx.type}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-red-600">{tx.debitAccount}</td>
                  <td className="py-3 px-4 font-mono text-xs text-green-600">{tx.creditAccount}</td>
                  <td className="py-3 px-4 font-medium">{tx.amount.toLocaleString()} HTG</td>
                  <td className="py-3 px-4 font-mono text-xs">{tx.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminAudit() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit & Sécurité</h1>
        <p className="text-gray-500">Journal d'audit et détection de fraude</p>
      </div>

      {/* Security Alerts */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-medium text-red-800">Alerte sécurité</p>
            <p className="text-sm text-red-600">Compte u5 (Patrick Sylvain) suspendu - Tentatives de connexion multiples depuis IP suspecte</p>
          </div>
        </div>
      </div>

      {/* Anti-Fraud Measures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Mesures anti-fraude actives
          </h3>
          <div className="space-y-3">
            {[
              'Protection brute-force (max 5 tentatives/15min)',
              'Détection comptes multiples (fingerprint device)',
              'Limite de retrait journalier: 50 000 HTG',
              'Vérification KYC pour retraits > 10 000 HTG',
              'Cooldown de 24h entre révélations suspectes',
              'Audit trail complet de chaque transaction',
            ].map((measure, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-green-50">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{measure}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-600" />
            Sécurité des tickets
          </h3>
          <div className="space-y-3">
            {[
              'Codes secrets: 8 caractères alphanumériques (62^8 combinaisons)',
              'QR codes signés avec HMAC-SHA256',
              'Machine à états: CREATED → SOLD → REVEALED → REDEEMED',
              'Verrouillage SELECT FOR UPDATE sur les transactions',
              'Aucune logique de gain côté client',
              'Horodatage serveur pour chaque opération',
            ].map((measure, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-purple-50">
                <Lock className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{measure}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Journal d'audit</h3>
        <div className="space-y-2">
          {mockAuditLogs.map(log => (
            <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 border border-gray-100">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${log.action.includes('FAILED') ? 'bg-red-100' : log.action.includes('WITHDRAWAL') ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                {log.action.includes('FAILED') ? <XCircle className="w-4 h-4 text-red-600" /> : <FileText className="w-4 h-4 text-blue-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{log.action}</p>
                  <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString('fr-FR')}</span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{log.details}</p>
                <p className="text-xs text-gray-400 mt-0.5">IP: {log.ipAddress} • User: {log.userId}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== ARCHITECTURE PAGE ====================

function ArchitecturePage() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Architecture Technique</h1>
        <p className="text-gray-500 mt-1">Documentation complète du système ChansAyiti</p>
      </div>

      {/* System Overview */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Server className="w-6 h-6 text-blue-600" />
          Vue d'ensemble du système
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <Smartphone className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-semibold text-blue-900">Application Mobile</h3>
            <p className="text-sm text-blue-700 mt-1">React Native / Expo</p>
            <ul className="text-xs text-blue-600 mt-2 space-y-1">
              <li>• Scan QR code natif</li>
              <li>• Boutique intégrée</li>
              <li>• Portefeuille temps réel</li>
              <li>• Notifications push</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <Globe className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-semibold text-green-900">Application Web</h3>
            <p className="text-sm text-green-700 mt-1">React.js / Next.js</p>
            <ul className="text-xs text-green-600 mt-2 space-y-1">
              <li>• Dashboard utilisateur</li>
              <li>• Dashboard administrateur</li>
              <li>• Gestion des lots</li>
              <li>• Rapports financiers</li>
            </ul>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <Database className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-semibold text-purple-900">Backend API</h3>
            <p className="text-sm text-purple-700 mt-1">FastAPI / Python</p>
            <ul className="text-xs text-purple-600 mt-2 space-y-1">
              <li>• REST API sécurisée</li>
              <li>• PostgreSQL ACID</li>
              <li>• Machine à états tickets</li>
              <li>• Registre double écriture</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Database Schema */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-6 h-6 text-purple-600" />
          Schéma de base de données (PostgreSQL)
        </h2>
        <div className="bg-gray-900 rounded-xl p-5 overflow-x-auto">
          <pre className="text-sm text-green-400 font-mono whitespace-pre">{`-- Table des utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    is_suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des portefeuilles
CREATE TABLE wallets (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    balance BIGINT NOT NULL DEFAULT 0 CHECK (balance >= 0),
    total_deposits BIGINT DEFAULT 0,
    total_withdrawals BIGINT DEFAULT 0,
    total_winnings BIGINT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des lots de tickets
CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- PHYSICAL | VIRTUAL
    total_tickets INTEGER NOT NULL,
    unit_price INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des tickets (machine à états)
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id VARCHAR(50) UNIQUE NOT NULL,
    secret_hash VARCHAR(256) NOT NULL, -- hash du code secret
    batch_id UUID REFERENCES batches(id),
    type VARCHAR(20) NOT NULL, -- PHYSICAL | VIRTUAL
    status VARCHAR(20) NOT NULL DEFAULT 'CREATED',
    -- États: CREATED → SOLD → REVEALED → REDEEMED
    price INTEGER NOT NULL,
    prize_amount BIGINT, -- null si non encore révélé
    owner_id UUID REFERENCES users(id),
    purchased_at TIMESTAMPTZ,
    revealed_at TIMESTAMPTZ,
    redeemed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (status IN ('CREATED','SOLD','REVEALED','REDEEMED')),
    CONSTRAINT valid_transitions CHECK (
        (status = 'CREATED' AND owner_id IS NULL) OR
        (status = 'SOLD' AND owner_id IS NOT NULL AND prize_amount IS NULL) OR
        (status = 'REVEALED' AND owner_id IS NOT NULL AND prize_amount IS NOT NULL) OR
        (status = 'REDEEMED' AND owner_id IS NOT NULL AND prize_amount IS NOT NULL)
    )
);

-- Registre financier en double écriture
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(30) NOT NULL,
    debit_account VARCHAR(100) NOT NULL,
    credit_account VARCHAR(100) NOT NULL,
    amount BIGINT NOT NULL CHECK (amount > 0),
    reference VARCHAR(100),
    description TEXT,
    status VARCHAR(20) DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal d'audit
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id),
    details TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_owner ON tickets(owner_id);
CREATE INDEX idx_transactions_accounts ON transactions(debit_account, credit_account);
CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at);`}</pre>
        </div>
      </div>

      {/* State Machine */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-6 h-6 text-orange-600" />
          Machine à états des tickets
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-4 py-6">
          <div className="bg-gray-100 border-2 border-gray-300 rounded-xl px-5 py-3 text-center">
            <p className="font-bold text-gray-800">CREATED</p>
            <p className="text-xs text-gray-500">Pas encore vendu</p>
          </div>
          <div className="text-2xl text-gray-400">→</div>
          <div className="bg-blue-100 border-2 border-blue-300 rounded-xl px-5 py-3 text-center">
            <p className="font-bold text-blue-800">SOLD</p>
            <p className="text-xs text-blue-500">Vendu, pas révélé</p>
          </div>
          <div className="text-2xl text-gray-400">→</div>
          <div className="bg-green-100 border-2 border-green-300 rounded-xl px-5 py-3 text-center">
            <p className="font-bold text-green-800">REVEALED</p>
            <p className="text-xs text-green-500">Gain révélé</p>
          </div>
          <div className="text-2xl text-gray-400">→</div>
          <div className="bg-purple-100 border-2 border-purple-300 rounded-xl px-5 py-3 text-center">
            <p className="font-bold text-purple-800">REDEEMED</p>
            <p className="text-xs text-purple-500">Gain payé</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 mt-4">
          <h4 className="font-medium text-gray-700 mb-2">Transaction SQL de révélation (avec verrouillage) :</h4>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-green-400 font-mono">{`BEGIN;
-- Verrouiller le ticket pour éviter double révélation
SELECT * FROM tickets 
WHERE public_id = $1 AND secret_hash = crypt($2, secret_hash)
FOR UPDATE;

-- Vérifier le statut
-- Si status != 'SOLD' → ROLLBACK (erreur)

-- Déterminer le gain (côté serveur uniquement)
-- Mettre à jour le ticket
UPDATE tickets SET 
  status = 'REVEALED',
  prize_amount = $3,
  revealed_at = NOW()
WHERE id = $4 AND status = 'SOLD';

-- Créditer le portefeuille (double écriture)
INSERT INTO transactions (type, debit_account, credit_account, amount, reference)
VALUES ('WIN_CREDIT', 'house', $5, $3, $4);

UPDATE wallets SET 
  balance = balance + $3,
  total_winnings = total_winnings + $3
WHERE user_id = $6;

COMMIT;`}</pre>
          </div>
        </div>
      </div>

      {/* API Endpoints */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-6 h-6 text-green-600" />
          Endpoints API (FastAPI)
        </h2>
        <div className="space-y-3">
          {[
            { method: 'POST', path: '/api/auth/send-otp', desc: 'Envoyer OTP par SMS' },
            { method: 'POST', path: '/api/auth/verify-otp', desc: 'Vérifier OTP et créer session' },
            { method: 'GET', path: '/api/wallet/balance', desc: 'Consulter le solde du portefeuille' },
            { method: 'POST', path: '/api/tickets/purchase', desc: 'Acheter un ticket virtuel' },
            { method: 'POST', path: '/api/tickets/reveal', desc: 'Révéler un ticket (QR ou code)' },
            { method: 'GET', path: '/api/tickets/my-tickets', desc: 'Lister mes tickets' },
            { method: 'POST', path: '/api/withdrawals/request', desc: 'Demander un retrait' },
            { method: 'GET', path: '/api/withdrawals/history', desc: 'Historique des retraits' },
            { method: 'POST', path: '/api/admin/withdrawals/:id/approve', desc: 'Approuver un retrait' },
            { method: 'POST', path: '/api/admin/withdrawals/:id/reject', desc: 'Rejeter un retrait' },
            { method: 'GET', path: '/api/admin/reports/financial', desc: 'Rapports financiers' },
            { method: 'GET', path: '/api/admin/audit/logs', desc: 'Journal d\'audit' },
          ].map((endpoint, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-gray-100">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${endpoint.method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {endpoint.method}
              </span>
              <code className="text-sm font-mono text-gray-800 flex-1">{endpoint.path}</code>
              <span className="text-sm text-gray-500 hidden sm:inline">{endpoint.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Integration */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-indigo-600" />
          Intégration Paiements (MonCash / NatCash)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-semibold text-blue-900 mb-2">MonCash (Digicel)</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• API REST officielle</p>
              <p>• Authentification OAuth 2.0</p>
              <p>• Confirmation transaction asynchrone</p>
              <p>• Webhook de notification</p>
              <p className="text-xs text-blue-500 mt-2">Endpoint: api.moncash.com/v1/...</p>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <h3 className="font-semibold text-green-900 mb-2">NatCash (NATCOM)</h3>
            <div className="text-sm text-green-700 space-y-1">
              <p>• API REST officielle</p>
              <p>• Authentification par clé API</p>
              <p>• Polling pour confirmation</p>
              <p>• Callback URL configurable</p>
              <p className="text-xs text-green-500 mt-2">Endpoint: api.natcash.ht/v1/...</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Important :</strong> Avant tout lancement, vérifier les conditions d'intégration auprès de Digicel et NATCOM, 
            ainsi que le cadre légal haïtien applicable aux jeux de hasard (autorisation du Ministère de l'Économie et des Finances).
          </p>
        </div>
      </div>

      {/* Security Architecture */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6 text-red-600" />
          Architecture de sécurité
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Côté serveur (Backend)</h4>
            {[
              'Source unique de vérité pour tous les gains',
              'Transactions ACID avec verrouillage pessimiste',
              'HMAC-SHA256 pour les codes secrets',
              'Rate limiting par IP et par utilisateur',
              'Journalisation complète (audit trail)',
              'Double écriture comptable obligatoire',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Côté client (Mobile/Web)</h4>
            {[
              'AUCUNE logique de gain côté client',
              'QR code = identifiant public uniquement',
              'Le gain est déterminé côté serveur',
              'Communication TLS 1.3 obligatoire',
              'Token JWT avec expiration courte',
              'Certificate pinning pour l\'app mobile',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SHARED COMPONENTS ====================

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const config: Record<TicketStatus, { label: string; className: string }> = {
    CREATED: { label: 'Créé', className: 'bg-gray-100 text-gray-600' },
    SOLD: { label: 'Vendu', className: 'bg-blue-100 text-blue-700' },
    REVEALED: { label: 'Révélé', className: 'bg-green-100 text-green-700' },
    REDEEMED: { label: 'Encaissé', className: 'bg-purple-100 text-purple-700' },
  };
  const { label, className } = config[status];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{label}</span>;
}

function WithdrawalStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'En attente', className: 'bg-yellow-100 text-yellow-700' },
    APPROVED: { label: 'Approuvé', className: 'bg-blue-100 text-blue-700' },
    COMPLETED: { label: 'Complété', className: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'Rejeté', className: 'bg-red-100 text-red-700' },
    FAILED: { label: 'Échoué', className: 'bg-red-100 text-red-700' },
  };
  const { label, className } = config[status] || { label: status, className: 'bg-gray-100 text-gray-600' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{label}</span>;
}

export default App;
