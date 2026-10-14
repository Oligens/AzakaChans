import { useState } from 'react';
import { 
  LayoutDashboard, Ticket, Wallet, ShoppingCart, ArrowDownToLine, 
  Menu, X, ChevronRight, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle2, Clock, XCircle, Eye, QrCode, Sparkles,
  Database, Server, Shield, CreditCard, Lock, Globe, Smartphone,
  RefreshCw, Ban, DollarSign, PieChart as PieIcon, Activity,
  FileText, Zap, AlertCircle, Info
} from 'lucide-react';
import { 
  mockTickets, mockWallets, mockWithdrawals, mockBatches, 
  mockTransactions, mockUsers, mockAuditLogs, prizeDistribution,
  mockSeries, mockFinancialSnapshot, mockHourlyCycles, systemConfig
} from './data';
import { Ticket as TicketType, TicketStatus, WithdrawalStatus } from './types';
import { Series, FinancialSnapshot, HourlyCycleExecution, WithdrawalRequest } from './engine/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';

type Page = 
  | 'user-dashboard' | 'user-shop' | 'user-tickets' | 'user-wallet' | 'user-scan'
  | 'admin-dashboard' | 'admin-series' | 'admin-financial' | 'admin-withdrawals' 
  | 'admin-reports' | 'admin-audit' | 'admin-cycles' | 'admin-tests'
  | 'architecture';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('admin-dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'user' | 'admin' | 'archi'>('admin');

  const userMenuItems = [
    { id: 'user-dashboard' as Page, label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'user-shop' as Page, label: 'Boutique', icon: ShoppingCart },
    { id: 'user-tickets' as Page, label: 'Mes Tickets', icon: Ticket },
    { id: 'user-scan' as Page, label: 'Scanner QR', icon: QrCode },
    { id: 'user-wallet' as Page, label: 'Portefeuille', icon: Wallet },
  ];

  const adminMenuItems = [
    { id: 'admin-dashboard' as Page, label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'admin-series' as Page, label: 'Séries & Tickets', icon: Ticket },
    { id: 'admin-financial' as Page, label: 'Moteur Financier', icon: DollarSign },
    { id: 'admin-withdrawals' as Page, label: 'Retraits', icon: ArrowDownToLine },
    { id: 'admin-cycles' as Page, label: 'Cycles Horaires', icon: RefreshCw },
    { id: 'admin-tests' as Page, label: 'Tests Automatisés', icon: Zap },
    { id: 'admin-reports' as Page, label: 'Rapports', icon: PieIcon },
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
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-blue-900 to-blue-950 text-white transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-900" />
              </div>
              <div>
                <h1 className="font-bold text-lg">ChansAyiti</h1>
                <p className="text-xs text-blue-300">Loterie Sécurisée</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="px-4 mb-4">
          <div className="bg-blue-800/50 rounded-xl p-1 flex gap-1">
            <button onClick={() => { setViewMode('user'); setCurrentPage('user-dashboard'); }} className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition ${viewMode === 'user' ? 'bg-yellow-400 text-blue-900' : 'text-blue-200 hover:text-white'}`}>
              Utilisateur
            </button>
            <button onClick={() => { setViewMode('admin'); setCurrentPage('admin-dashboard'); }} className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition ${viewMode === 'admin' ? 'bg-yellow-400 text-blue-900' : 'text-blue-200 hover:text-white'}`}>
              Admin
            </button>
            <button onClick={() => { setViewMode('archi'); setCurrentPage('architecture'); }} className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition ${viewMode === 'archi' ? 'bg-yellow-400 text-blue-900' : 'text-blue-200 hover:text-white'}`}>
              Archi
            </button>
          </div>
        </div>

        <nav className="px-4 space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-hide">
          {getMenuItems().map(item => (
            <button key={item.id} onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${currentPage === item.id ? 'bg-white/15 text-yellow-400' : 'text-blue-200 hover:bg-white/5 hover:text-white'}`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-blue-800/50 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-blue-900">AP</div>
              <div>
                <p className="text-sm font-medium">Admin Principal</p>
                <p className="text-xs text-blue-300">+509 3100 0000</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-h-screen overflow-auto">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="hidden sm:inline">{viewMode === 'user' ? 'Espace Utilisateur' : viewMode === 'admin' ? 'Administration' : 'Architecture'}</span>
              <ChevronRight className="w-4 h-4" />
              <span className="font-medium text-gray-900">{getMenuItems().find(i => i.id === currentPage)?.label}</span>
            </div>
            <div className="flex items-center gap-3">
              {!mockFinancialSnapshot.isSolvent && (
                <div className="hidden sm:flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-xs font-medium animate-pulse">
                  <AlertCircle className="w-3 h-3" />
                  Alerte solvabilité
                </div>
              )}
              <div className="hidden sm:flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Système actif
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
          {currentPage === 'admin-series' && <AdminSeries />}
          {currentPage === 'admin-financial' && <AdminFinancial />}
          {currentPage === 'admin-withdrawals' && <AdminWithdrawals />}
          {currentPage === 'admin-cycles' && <AdminCycles />}
          {currentPage === 'admin-tests' && <AdminTests />}
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bonjour, Jean 👋</h1>
        <p className="text-gray-500">Voici votre activité récente</p>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Ticket} label="Tickets achetés" value={userTickets.length.toString()} color="blue" />
        <StatCard icon={Sparkles} label="Tickets gagnants" value={recentWins.length.toString()} color="yellow" />
        <StatCard icon={TrendingUp} label="Meilleur gain" value="1 000 HTG" color="green" />
        <StatCard icon={Clock} label="En attente" value={userTickets.filter(t => t.status === 'SOLD').length.toString()} color="purple" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Activité récente</h3>
        <div className="space-y-3">
          {userTickets.slice(0, 5).map(ticket => (
            <div key={ticket.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ticket.status === 'REVEALED' || ticket.status === 'REDEEMED' ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {ticket.status === 'REVEALED' || ticket.status === 'REDEEMED' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Ticket className="w-5 h-5 text-blue-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{ticket.publicId}</p>
                  <p className="text-xs text-gray-500">{ticket.type === 'PHYSICAL' ? '🎫 Physique' : '📱 Virtuel'} • {ticket.purchasedAt}</p>
                </div>
              </div>
              <div className="text-right">
                {ticket.prizeAmount ? <p className="text-sm font-bold text-green-600">+{ticket.prizeAmount.toLocaleString()} HTG</p> : <p className="text-sm text-gray-400">En attente</p>}
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
  const availableSeries = mockSeries.filter(s => s.status === 'PUBLISHED');

  const packs = systemConfig.ticketCategories.filter(c => c.enabled).map(cat => {
    const series = availableSeries.find(s => s.ticketPrice === cat.price);
    return {
      id: cat.price,
      name: `Ticket ${cat.price} HTG`,
      price: cat.price,
      winRate: Math.round(cat.targetWinRate * 100),
      available: series ? series.totalTickets - series.ticketsSold : 0,
      suspended: series?.status === 'SUSPENDED' || !series,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Boutique de Tickets</h1>
        <p className="text-gray-500">Choisissez votre catégorie et tentez votre chance</p>
      </div>

      {/* Financial Notice */}
      {!mockFinancialSnapshot.isSolvent && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Certaines catégories sont temporairement indisponibles</p>
            <p className="text-sm text-yellow-700 mt-1">Des mesures de protection financière sont en cours. Vos tickets existants restent valides et vos gains garantis.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {packs.map(pack => (
          <div key={pack.id} className={`relative bg-white rounded-2xl border-2 transition-all ${pack.suspended ? 'opacity-60 border-gray-200' : selectedPack === pack.id ? 'border-blue-500 shadow-lg cursor-pointer' : 'border-gray-200 cursor-pointer hover:shadow-md'}`} onClick={() => !pack.suspended && setSelectedPack(pack.id)}>
            <div className={`h-2 rounded-t-2xl ${pack.suspended ? 'bg-gray-300' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`} />
            <div className="p-5">
              <h3 className="font-semibold text-gray-900">{pack.name}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pack.price} <span className="text-sm text-gray-500">HTG</span></p>
              <div className="mt-3 space-y-1">
                <p className="text-sm text-gray-500">Taux de gain: <span className="font-medium text-green-600">{pack.winRate}%</span></p>
                {pack.suspended ? (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1"><Ban className="w-3 h-3" /> Catégorie suspendue</p>
                ) : (
                  <p className="text-xs text-gray-400">{pack.available} tickets disponibles</p>
                )}
              </div>
              {!pack.suspended && (
                <button className={`w-full mt-4 py-2.5 rounded-xl font-medium text-sm transition ${selectedPack === pack.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                  {selectedPack === pack.id ? '✓ Sélectionné' : 'Acheter'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Prize Distribution */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Lots possibles (50 HTG à 100 000 HTG)
        </h3>
        <div className="flex flex-wrap gap-2">
          {systemConfig.prizeGrid.map((amount, i) => (
            <span key={i} className="bg-white px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-sm border">
              {amount.toLocaleString()} HTG
            </span>
          ))}
        </div>
      </div>
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
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'CREATED', 'SOLD', 'REVEALED', 'REDEEMED'] as const).map(status => (
          <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === status ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {status === 'ALL' ? 'Tous' : status === 'CREATED' ? 'Créés' : status === 'SOLD' ? 'Vendus' : status === 'REVEALED' ? 'Révélés' : 'Encaissés'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}
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
            <p className="text-xs text-gray-500 mt-0.5">{ticket.type === 'PHYSICAL' ? '🎫 Physique' : '📱 Virtuel'} • {ticket.price} HTG</p>
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
            {ticket.status === 'REVEALED' && <button className="mt-2 text-xs text-blue-600 font-medium hover:underline">Demander le retrait →</button>}
            {ticket.status === 'REDEEMED' && <p className="mt-2 text-xs text-green-600 font-medium">✓ Gain encaissé</p>}
          </div>
        ) : (
          <div className="text-center py-3"><p className="text-sm text-gray-400">Ticket en attente</p></div>
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
      if (ticket) setResult({ success: true, ticket, message: 'Ticket valide ! Cliquez pour révéler.' });
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Scanner un Ticket</h1>
        <p className="text-gray-500">Scannez le QR code de votre ticket physique</p>
      </div>
      <div className="bg-gray-900 rounded-3xl p-8 aspect-square flex items-center justify-center relative overflow-hidden">
        {scanning ? (
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-sm">Vérification serveur...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-48 h-48 border-2 border-dashed border-white/30 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <QrCode className="w-16 h-16 text-white/50" />
            </div>
            <p className="text-white/70 text-sm">Placez le QR code dans le cadre</p>
          </div>
        )}
        <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-yellow-400 rounded-tl-lg" />
        <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-yellow-400 rounded-tr-lg" />
        <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-yellow-400 rounded-bl-lg" />
        <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-yellow-400 rounded-br-lg" />
      </div>
      <button onClick={simulateScan} disabled={scanning} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-medium hover:bg-blue-700 transition disabled:opacity-50">
        {scanning ? 'Vérification...' : '📸 Simuler un scan'}
      </button>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Saisie manuelle</h3>
        <div className="space-y-3">
          <input type="text" placeholder="ID public (ex: CHN-2024-00001)" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <input type="text" placeholder="Code secret" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition">Vérifier le ticket</button>
        </div>
      </div>
      {result && (
        <div className={`rounded-2xl p-6 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            {result.success ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <XCircle className="w-6 h-6 text-red-600" />}
            <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>{result.message}</p>
          </div>
          {result.ticket && (
            <div className="bg-white rounded-xl p-4 mt-3">
              <p className="font-mono text-sm">{result.ticket.publicId}</p>
              <p className="text-xs text-gray-500 mt-1">Statut: {result.ticket.status} • Série: {result.ticket.batchId}</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white lg:col-span-2">
          <p className="text-blue-200 text-sm">Solde disponible</p>
          <p className="text-4xl font-bold mt-1">{wallet.balance.toLocaleString()} HTG</p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowWithdraw(true)} className="bg-white text-blue-700 px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-50 transition">Retirer</button>
            <button className="bg-white/20 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-white/30 transition">Déposer</button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm text-gray-500 mb-3">Résumé</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-gray-500">Dépôts</span><span className="font-medium">{wallet.totalDeposits.toLocaleString()} HTG</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Gains</span><span className="font-medium text-green-600">{wallet.totalWinnings.toLocaleString()} HTG</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Retraits</span><span className="font-medium text-red-600">{wallet.totalWithdrawals.toLocaleString()} HTG</span></div>
          </div>
        </div>
      </div>

      {showWithdraw && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowWithdraw(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Demander un retrait</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Montant (HTG)</label>
                <input type="number" placeholder="Ex: 500" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                <p className="text-xs text-gray-400 mt-1">Disponible: {wallet.balance.toLocaleString()} HTG • Max/jour: {systemConfig.maxDailyWithdrawal.toLocaleString()} HTG</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Méthode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="border-2 border-blue-500 bg-blue-50 text-blue-700 py-3 rounded-xl font-medium text-sm">📱 MonCash</button>
                  <button className="border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-medium text-sm hover:border-gray-300">📱 NatCash</button>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Numéro de téléphone</label>
                <input type="tel" placeholder="+509 XXXX XXXX" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
                <p className="font-medium">Cycle de vie du retrait :</p>
                <p className="mt-1">REQUESTED → VALIDATED → PROCESSING → PAID</p>
                <p className="mt-1">La confirmation est obtenue directement du prestataire.</p>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition">Confirmer le retrait</button>
            </div>
          </div>
        </div>
      )}

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
                  <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString('fr-FR')} • {tx.type}</p>
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
  const snapshot = mockFinancialSnapshot;
  const totalRevenue = mockSeries.reduce((sum, s) => sum + (s.ticketsSold * s.ticketPrice), 0);
  const totalPrizes = mockSeries.reduce((sum, s) => sum + s.totalPrizesPaid + s.totalPrizesPending, 0);
  const pendingWithdrawals = mockWithdrawals.filter(w => w.status === 'REQUESTED' || w.status === 'VALIDATED').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Admin</h1>
          <p className="text-gray-500">Supervision financière et opérationnelle</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Dernière MAJ: {new Date(snapshot.timestamp).toLocaleString('fr-FR')}</span>
        </div>
      </div>

      {/* Solvency Alert */}
      {!snapshot.isSolvent && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-red-800">⚠️ Alerte de solvabilité</p>
              <p className="text-sm text-red-700 mt-1">Le ratio de couverture ({(snapshot.coverageRatio * 100).toFixed(0)}%) est inférieur au seuil minimum ({(systemConfig.minCoverageRatio * 100).toFixed(0)}%). Les nouvelles séries sont suspendues et certaines catégories de tickets ne sont plus disponibles à la vente.</p>
              <div className="flex gap-3 mt-3">
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700">Voir les détails</button>
                <button className="bg-white text-red-700 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50">Acquitter l'alerte</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Recettes nettes" value={`${(snapshot.netRevenue / 1000).toFixed(0)}k`} unit="HTG" icon={TrendingUp} color="green" />
        <KPICard label="Lots engagés" value={`${(totalPrizes / 1000).toFixed(0)}k`} unit="HTG" icon={TrendingDown} color="orange" />
        <KPICard label="Couverture" value={`${(snapshot.coverageRatio * 100).toFixed(0)}%`} unit="" icon={Shield} color={snapshot.coverageRatio >= systemConfig.minCoverageRatio ? 'green' : 'red'} />
        <KPICard label="Retraits en attente" value={pendingWithdrawals.toString()} unit="demandes" icon={Clock} color="yellow" />
        <KPICard label="Séries actives" value={mockSeries.filter(s => s.status === 'PUBLISHED').length.toString()} unit={`/${mockSeries.length}`} icon={Ticket} color="blue" />
      </div>

      {/* Financial Overview Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Flux financiers (HTG)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { label: 'Recettes', value: snapshot.confirmedCollections, fill: '#10B981' },
              { label: 'Frais', value: snapshot.variableFees + snapshot.distributorCommissions, fill: '#F59E0B' },
              { label: 'Lots payés', value: mockSeries.reduce((s, x) => s + x.totalPrizesPaid, 0), fill: '#3B82F6' },
              { label: 'Lots en attente', value: snapshot.validatedUnpaidGains, fill: '#8B5CF6' },
              { label: 'Opérations', value: snapshot.operationalCosts + snapshot.taxProvision, fill: '#EF4444' },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString()} HTG`} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {[
                  { fill: '#10B981' }, { fill: '#F59E0B' }, { fill: '#3B82F6' }, { fill: '#8B5CF6' }, { fill: '#EF4444' }
                ].map((entry, index) => <Cell key={index} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">État des séries</h3>
          <div className="space-y-3">
            {mockSeries.map(series => (
              <div key={series.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${series.status === 'PUBLISHED' ? 'bg-green-500' : series.status === 'SUSPENDED' ? 'bg-red-500' : series.status === 'DRAFT' ? 'bg-gray-400' : 'bg-yellow-500'}`} />
                  <div>
                    <p className="text-sm font-medium">{series.name}</p>
                    <p className="text-xs text-gray-500">{series.ticketPrice} HTG • {series.totalTickets} tickets</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{((series.ticketsSold / series.totalTickets) * 100).toFixed(0)}% vendu</p>
                  <SeriesStatusBadge status={series.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {snapshot.alerts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Alertes actives ({snapshot.alerts.length})
          </h3>
          <div className="space-y-3">
            {snapshot.alerts.map(alert => (
              <div key={alert.id} className={`p-4 rounded-xl border ${alert.level === 'CRITICAL' ? 'bg-red-50 border-red-200' : alert.level === 'WARNING' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-start gap-3">
                  {alert.level === 'CRITICAL' ? <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" /> : alert.level === 'WARNING' ? <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" /> : <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                  <div className="flex-1">
                    <p className={`font-medium ${alert.level === 'CRITICAL' ? 'text-red-800' : alert.level === 'WARNING' ? 'text-yellow-800' : 'text-blue-800'}`}>{alert.message}</p>
                    <p className={`text-sm mt-1 ${alert.level === 'CRITICAL' ? 'text-red-600' : alert.level === 'WARNING' ? 'text-yellow-600' : 'text-blue-600'}`}>{alert.details}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(alert.createdAt).toLocaleString('fr-FR')} {alert.acknowledged && `• Acquitté par ${alert.acknowledgedBy}`}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminSeries() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Séries & Tickets</h1>
          <p className="text-gray-500">Gestion des séries de tickets et de leurs règles</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition">
          + Nouvelle série
        </button>
      </div>

      {/* Series Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockSeries.map(series => (
          <div key={series.id} className={`bg-white rounded-2xl border-2 overflow-hidden ${series.status === 'SUSPENDED' ? 'border-red-200' : series.status === 'PUBLISHED' ? 'border-green-200' : series.status === 'DRAFT' ? 'border-gray-200' : 'border-yellow-200'}`}>
            <div className={`h-2 ${series.status === 'SUSPENDED' ? 'bg-red-400' : series.status === 'PUBLISHED' ? 'bg-green-400' : series.status === 'DRAFT' ? 'bg-gray-400' : 'bg-yellow-400'}`} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{series.name}</h3>
                  <p className="text-sm text-gray-500">{series.ticketPrice} HTG • {series.totalTickets} tickets • Taux gagnant: {(series.rules.winRate * 100).toFixed(0)}%</p>
                </div>
                <SeriesStatusBadge status={series.status} />
              </div>

              {/* Progress */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Vendus: {series.ticketsSold}/{series.totalTickets}</span>
                  <span>{((series.ticketsSold / series.totalTickets) * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(series.ticketsSold / series.totalTickets) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Révélés: {series.ticketsRevealed}</span>
                  <span>Gagnants: {series.winnersCount}</span>
                </div>
              </div>

              {/* Budget */}
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Recettes</p>
                    <p className="font-semibold text-sm text-green-600">{(series.ticketsSold * series.ticketPrice).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Lots payés</p>
                    <p className="font-semibold text-sm text-orange-600">{series.totalPrizesPaid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">En attente</p>
                    <p className="font-semibold text-sm text-purple-600">{series.totalPrizesPending.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Budget coverage */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Budget: {series.budget.approvedBudget.toLocaleString()} HTG</span>
                <span className={`font-medium ${series.budget.coverageRatio >= systemConfig.minCoverageRatio ? 'text-green-600' : 'text-red-600'}`}>
                  Couverture: {(series.budget.coverageRatio * 100).toFixed(0)}%
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button className="flex-1 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">Détails</button>
                {series.status === 'PUBLISHED' && (
                  <button className="flex-1 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">Suspendre</button>
                )}
                {series.status === 'DRAFT' && series.budget.approvedBudget === 0 && (
                  <button className="flex-1 py-2 text-sm font-medium text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition">Financer</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prize Grid Configuration */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Grille de lots configurée</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Montant</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Min</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Max</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50">
                <td className="py-3 px-4 font-medium">Plage autorisée</td>
                <td className="py-3 px-4">{systemConfig.minPrizeAmount.toLocaleString()} HTG</td>
                <td className="py-3 px-4">{systemConfig.maxPrizeAmount.toLocaleString()} HTG</td>
                <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Actif</span></td>
              </tr>
              {systemConfig.prizeGrid.map((amount, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{amount.toLocaleString()} HTG</td>
                  <td className="py-3 px-4 text-gray-500">-</td>
                  <td className="py-3 px-4 text-gray-500">-</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Disponible</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminFinancial() {
  const snapshot = mockFinancialSnapshot;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Moteur Financier</h1>
        <p className="text-gray-500">Contrôle de solvabilité et gestion des réserves</p>
      </div>

      {/* Solvency Dashboard */}
      <div className={`rounded-2xl p-6 ${snapshot.isSolvent ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center gap-3 mb-4">
          {snapshot.isSolvent ? <CheckCircle2 className="w-8 h-8 text-green-600" /> : <AlertCircle className="w-8 h-8 text-red-600" />}
          <div>
            <h2 className={`text-xl font-bold ${snapshot.isSolvent ? 'text-green-800' : 'text-red-800'}`}>
              {snapshot.isSolvent ? 'Système solvent' : '⚠️ Insuffisance de couverture'}
            </h2>
            <p className={`text-sm ${snapshot.isSolvent ? 'text-green-600' : 'text-red-600'}`}>
              Ratio de couverture: {(snapshot.coverageRatio * 100).toFixed(1)}% (minimum requis: {(systemConfig.minCoverageRatio * 100).toFixed(0)}%)
            </p>
          </div>
        </div>
      </div>

      {/* Financial Model */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Calcul des recettes nettes
          </h3>
          <div className="space-y-3">
            <FinRow label="Encaissements confirmés" value={snapshot.confirmedCollections} sign="+" color="green" />
            <FinRow label="Remboursements" value={snapshot.refunds} sign="-" color="red" />
            <FinRow label="Frais variables (paiements)" value={snapshot.variableFees} sign="-" color="red" />
            <FinRow label="Commissions distributeurs" value={snapshot.distributorCommissions} sign="-" color="red" />
            <div className="border-t border-gray-200 pt-3 mt-3">
              <FinRow label="Recettes nettes" value={snapshot.netRevenue} sign="=" color="blue" bold />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-orange-600" />
            Résultat estimé
          </h3>
          <div className="space-y-3">
            <FinRow label="Recettes nettes" value={snapshot.netRevenue} sign="+" color="green" />
            <FinRow label="Coûts opérationnels" value={snapshot.operationalCosts} sign="-" color="red" />
            <FinRow label="Taxes à provisionner" value={snapshot.taxProvision} sign="-" color="red" />
            <FinRow label="Coût des lots (payés + en attente)" value={snapshot.validatedUnpaidGains + mockSeries.reduce((s, x) => s + x.totalPrizesPaid, 0)} sign="-" color="red" />
            <div className="border-t border-gray-200 pt-3 mt-3">
              <FinRow label="Résultat estimé" value={snapshot.estimatedResult} sign="=" color={snapshot.estimatedResult >= 0 ? 'green' : 'red'} bold />
            </div>
          </div>
        </div>
      </div>

      {/* Coverage Analysis */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Analyse de couverture
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-600">Fonds affectés aux gains</p>
            <p className="text-2xl font-bold text-blue-800 mt-1">{snapshot.reservedForPrizes.toLocaleString()}</p>
            <p className="text-xs text-blue-500">HTG</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <p className="text-sm text-orange-600">Engagements restants</p>
            <p className="text-2xl font-bold text-orange-800 mt-1">{snapshot.totalEngagements.toLocaleString()}</p>
            <p className="text-xs text-orange-500">HTG</p>
          </div>
          <div className={`text-center p-4 rounded-xl ${snapshot.coverageRatio >= systemConfig.minCoverageRatio ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`text-sm ${snapshot.coverageRatio >= systemConfig.minCoverageRatio ? 'text-green-600' : 'text-red-600'}`}>Ratio de couverture</p>
            <p className={`text-2xl font-bold mt-1 ${snapshot.coverageRatio >= systemConfig.minCoverageRatio ? 'text-green-800' : 'text-red-800'}`}>{(snapshot.coverageRatio * 100).toFixed(1)}%</p>
            <p className={`text-xs ${snapshot.coverageRatio >= systemConfig.minCoverageRatio ? 'text-green-500' : 'text-red-500'}`}>
              Seuil min: {(systemConfig.minCoverageRatio * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Coverage formula */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 font-mono">
            couverture_gains = fonds_affectes_aux_gains / engagements_restants<br/>
            couverture_gains = {snapshot.reservedForPrizes.toLocaleString()} / {snapshot.totalEngagements.toLocaleString()} = {(snapshot.coverageRatio).toFixed(2)}<br/>
            {snapshot.totalEngagements === 0 ? '⚠️ Dénominateur nul : aucun engagement (cas traité explicitement)' : `Seuil minimum: ${systemConfig.minCoverageRatio} → ${snapshot.coverageRatio >= systemConfig.minCoverageRatio ? '✅ OK' : '❌ INSUFFISANT'}`}
          </p>
        </div>
      </div>

      {/* Double Entry Ledger */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-600" />
          Registre en double écriture (dernières opérations)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Date</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Type</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Débit</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Crédit</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Montant</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Statut</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.slice(-8).map(tx => (
                <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3">{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="py-2 px-3"><span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">{tx.type}</span></td>
                  <td className="py-2 px-3 font-mono text-red-600">{tx.debitAccount}</td>
                  <td className="py-2 px-3 font-mono text-green-600">{tx.creditAccount}</td>
                  <td className="py-2 px-3 text-right font-medium">{tx.amount.toLocaleString()}</td>
                  <td className="py-2 px-3"><span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">{tx.status}</span></td>
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
  const [filter, setFilter] = useState<string>('ALL');
  const filtered = filter === 'ALL' ? mockWithdrawals : mockWithdrawals.filter(w => w.status === filter);

  const getUserName = (userId: string) => mockUsers.find(u => u.id === userId)?.name || userId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Retraits</h1>
        <p className="text-gray-500">Cycle: REQUESTED → VALIDATED → PROCESSING → PAID</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
          <p className="text-xs text-yellow-700">REQUESTED</p>
          <p className="text-xl font-bold text-yellow-800">{mockWithdrawals.filter(w => w.status === 'REQUESTED').length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <p className="text-xs text-blue-700">VALIDATED</p>
          <p className="text-xl font-bold text-blue-800">{mockWithdrawals.filter(w => w.status === 'VALIDATED').length}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
          <p className="text-xs text-purple-700">PROCESSING</p>
          <p className="text-xl font-bold text-purple-800">{mockWithdrawals.filter(w => w.status === 'PROCESSING').length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <p className="text-xs text-green-700">PAID</p>
          <p className="text-xl font-bold text-green-800">{mockWithdrawals.filter(w => w.status === 'PAID').length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <p className="text-xs text-red-700">REJECTED/FAILED</p>
          <p className="text-xl font-bold text-red-800">{mockWithdrawals.filter(w => w.status === 'REJECTED' || w.status === 'FAILED').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'REQUESTED', 'VALIDATED', 'PROCESSING', 'PAID', 'REJECTED', 'FAILED', 'RECONCILED'].map(status => (
          <button key={status} onClick={() => setFilter(status)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === status ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {status === 'ALL' ? 'Tous' : status}
          </button>
        ))}
      </div>

      {/* Withdrawals List */}
      <div className="space-y-3">
        {filtered.map(w => (
          <WithdrawalCard key={w.id} withdrawal={w} userName={getUserName(w.userId)} />
        ))}
      </div>
    </div>
  );
}

function WithdrawalCard({ withdrawal: w, userName }: { withdrawal: WithdrawalRequest; userName: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${w.provider === 'MONCASH' ? 'bg-blue-100' : 'bg-green-100'}`}>
            <CreditCard className={`w-6 h-6 ${w.provider === 'MONCASH' ? 'text-blue-600' : 'text-green-600'}`} />
          </div>
          <div>
            <p className="font-medium text-gray-900">{userName}</p>
            <p className="text-sm text-gray-500">{w.provider} • {w.phoneNumber}</p>
            <p className="text-xs text-gray-400 mt-0.5">ID: {w.id} • Clé idempotence: {w.idempotencyKey.substring(0, 15)}...</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold">{w.amount.toLocaleString()} HTG</p>
          <WithdrawalStatusBadge status={w.status} />
        </div>
      </div>

      {/* Lifecycle Timeline */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1 text-xs">
          <TimelineStep label="Requested" done={true} time={w.requestedAt} />
          <div className="flex-1 h-0.5 bg-gray-200"><div className={`h-full ${['VALIDATED', 'PROCESSING', 'PAID'].includes(w.status) ? 'bg-blue-500' : 'bg-gray-200'}`} /></div>
          <TimelineStep label="Validated" done={['VALIDATED', 'PROCESSING', 'PAID'].includes(w.status)} time={w.validatedAt} />
          <div className="flex-1 h-0.5 bg-gray-200"><div className={`h-full ${['PROCESSING', 'PAID'].includes(w.status) ? 'bg-blue-500' : 'bg-gray-200'}`} /></div>
          <TimelineStep label="Processing" done={['PROCESSING', 'PAID'].includes(w.status)} time={w.processingAt} />
          <div className="flex-1 h-0.5 bg-gray-200"><div className={`h-full ${w.status === 'PAID' ? 'bg-green-500' : 'bg-gray-200'}`} /></div>
          <TimelineStep label="Paid" done={w.status === 'PAID'} time={w.paidAt} />
        </div>
      </div>

      {/* Provider Info */}
      {w.providerTransactionId && (
        <div className="mt-3 bg-gray-50 rounded-lg p-2 text-xs text-gray-500">
          <span className="font-medium">Prestataire:</span> {w.providerTransactionId}
          {w.providerCallbackReceived && <span className="ml-2 text-green-600">✓ Callback reçu</span>}
          {w.retryCount > 0 && <span className="ml-2 text-yellow-600">• Tentatives: {w.retryCount}/{w.maxRetries}</span>}
        </div>
      )}

      {/* Actions */}
      {(w.status === 'REQUESTED' || w.status === 'VALIDATED') && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          {w.status === 'REQUESTED' && <button className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-medium text-sm hover:bg-blue-700 transition">Valider</button>}
          {w.status === 'VALIDATED' && <button className="flex-1 bg-purple-600 text-white py-2 rounded-xl font-medium text-sm hover:bg-purple-700 transition">Envoyer au prestataire</button>}
          <button className="flex-1 bg-red-600 text-white py-2 rounded-xl font-medium text-sm hover:bg-red-700 transition">Rejeter</button>
        </div>
      )}

      {w.status === 'PROCESSING' && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
          <button className="flex-1 bg-green-600 text-white py-2 rounded-xl font-medium text-sm hover:bg-green-700 transition">Confirmer paiement</button>
          <button className="flex-1 bg-yellow-600 text-white py-2 rounded-xl font-medium text-sm hover:bg-yellow-700 transition">Vérifier statut prestataire</button>
          <button className="flex-1 bg-red-600 text-white py-2 rounded-xl font-medium text-sm hover:bg-red-700 transition">Signaler échec</button>
        </div>
      )}

      {w.adminNotes && <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">Note: {w.adminNotes}</p>}
      {w.rejectionReason && <p className="mt-3 text-xs text-red-600 bg-red-50 rounded-lg p-2">Motif: {w.rejectionReason}</p>}
    </div>
  );
}

function AdminCycles() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cycles Horaires</h1>
          <p className="text-gray-500">Renouvellement automatique des séries (idempotent)</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${mockHourlyCycles.some(c => c.status === 'RUNNING') ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-sm text-gray-600">{mockHourlyCycles.some(c => c.status === 'RUNNING') ? 'Cycle en cours' : 'En attente'}</span>
        </div>
      </div>

      {/* Cycle Configuration */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Intervalle</p>
            <p className="font-semibold">1 heure</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Max séries/jour</p>
            <p className="font-semibold">{systemConfig.maxSeriesPerDay}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Couverture min</p>
            <p className="font-semibold">{(systemConfig.minCoverageRatio * 100).toFixed(0)}%</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Idempotence</p>
            <p className="font-semibold text-green-600">Active</p>
          </div>
        </div>
      </div>

      {/* Cycle Execution Log */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Historique des exécutions</h3>
        <div className="space-y-3">
          {mockHourlyCycles.map(cycle => (
            <div key={cycle.id} className={`p-4 rounded-xl border ${cycle.status === 'RUNNING' ? 'border-yellow-200 bg-yellow-50' : cycle.status === 'FAILED' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cycle.status === 'RUNNING' ? 'bg-yellow-200' : cycle.status === 'COMPLETED' ? 'bg-green-200' : 'bg-red-200'}`}>
                    {cycle.status === 'RUNNING' ? <RefreshCw className="w-4 h-4 text-yellow-700 animate-spin" /> : cycle.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4 text-green-700" /> : <XCircle className="w-4 h-4 text-red-700" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">Cycle #{cycle.cycleNumber}</p>
                    <p className="text-xs text-gray-500">{new Date(cycle.startedAt).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${cycle.status === 'RUNNING' ? 'bg-yellow-200 text-yellow-800' : cycle.status === 'COMPLETED' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {cycle.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  {cycle.financialCheckPassed ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <XCircle className="w-3 h-3 text-red-600" />}
                  <span className="text-gray-600">Vérif. financière</span>
                </div>
                <div className="flex items-center gap-1">
                  {cycle.previousSeriesReviewed ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <Clock className="w-3 h-3 text-gray-400" />}
                  <span className="text-gray-600">Séries vérifiées</span>
                </div>
                <div className="flex items-center gap-1">
                  {cycle.newSeriesPublished ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <Ban className="w-3 h-3 text-gray-400" />}
                  <span className="text-gray-600">Nouvelle publiée</span>
                </div>
                <div>
                  <span className="text-gray-600">Alertes: {cycle.alertsGenerated}</span>
                </div>
              </div>
              {cycle.errorsEncountered.length > 0 && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 rounded p-2">
                  {cycle.errorsEncountered.map((err, i) => <p key={i}>• {err}</p>)}
                </div>
              )}
              <p className="text-[10px] text-gray-400 mt-2 font-mono">Idempotency: {cycle.idempotencyKey}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Process Description */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Processus du cycle horaire</h3>
        <div className="space-y-3">
          {[
            { step: 1, title: 'Acquisition du verrou', desc: 'Verrou distribué pour empêcher les exécutions simultanées (idempotence)' },
            { step: 2, title: 'Calcul des recettes', desc: 'Ventes confirmées et encaissements réellement reçus' },
            { step: 3, title: 'Mise à jour engagements', desc: 'Gains validés, retraits en cours, réserves' },
            { step: 4, title: 'Vérification séries', desc: 'Résultats des séries précédentes, tickets invendus' },
            { step: 5, title: 'Contrôle solvabilité', desc: 'Ratio de couverture vs seuils configurés' },
            { step: 6, title: 'Publication (si OK)', desc: 'Nouvelle série avec budget vérifié et résultats pré-générés' },
            { step: 7, title: 'Journalisation', desc: 'Enregistrement des paramètres, version algorithme, contrôles' },
          ].map(item => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{item.step}</div>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminTests() {
  const [testsRun, setTestsRun] = useState(false);
  const [testResults, setTestResults] = useState<{ total: number; passed: number; failed: number; results: { name: string; passed: boolean; error?: string }[] } | null>(null);

  const runTests = () => {
    // Importer et exécuter les tests
    import('./engine/tests').then(({ getTestResults }) => {
      const results = getTestResults();
      setTestResults(results);
      setTestsRun(true);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tests Automatisés</h1>
          <p className="text-gray-500">Validation du moteur de loterie et des contrôles financiers</p>
        </div>
        <button onClick={runTests} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Exécuter les tests
        </button>
      </div>

      {/* Test Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-blue-600" />
            Tests de tickets
          </h3>
          <ul className="text-sm text-gray-600 space-y-1.5">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> Quotas gagnants/perdants</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> Arrondis petites séries</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> Plafond 100 000 HTG</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> Révélations répétées</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> Reproductibilité graine</li>
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Tests financiers
          </h3>
          <ul className="text-sm text-gray-600 space-y-1.5">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Budget maximal des lots</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Refus série sous-financée</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Couverture / dénominateur nul</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Doubles crédits</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Doubles retraits (idempotence)</li>
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-purple-600" />
            Tests système
          </h3>
          <ul className="text-sm text-gray-600 space-y-1.5">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full" /> Cycles horaires idempotents</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full" /> Publications répétées</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full" /> Pannes et reprises</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full" /> Tickets invendus</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full" /> Cohérence registre/portefeuilles</li>
          </ul>
        </div>
      </div>

      {/* Results */}
      {testsRun && testResults && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Résultats</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Total: {testResults.total}</span>
              <span className="text-sm text-green-600 font-medium">✓ {testResults.passed}</span>
              <span className="text-sm text-red-600 font-medium">✗ {testResults.failed}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(testResults.passed / testResults.total) * 100}%` }} />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.results.map((result, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${result.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                {result.passed ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${result.passed ? 'text-green-800' : 'text-red-800'}`}>{result.name}</p>
                  {result.error && <p className="text-xs text-red-600 mt-0.5">{result.error}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!testsRun && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
          <Zap className="w-12 h-12 text-blue-400 mx-auto mb-3" />
          <p className="text-blue-700 font-medium">Cliquez sur "Exécuter les tests" pour lancer la suite de tests</p>
          <p className="text-blue-500 text-sm mt-1">Les tests valident le moteur financier, le générateur de tickets et le service de cycle horaire</p>
        </div>
      )}
    </div>
  );
}

function AdminReports() {
  const snapshot = mockFinancialSnapshot;
  const monthlyData = [
    { month: 'Jan', ventes: 45000, lots: 27000, marge: 18000 },
    { month: 'Fév', ventes: 62000, lots: 38000, marge: 24000 },
    { month: 'Mar', ventes: 97000, lots: 58000, marge: 39000 },
    { month: 'Avr', ventes: 21500, lots: 25500, marge: -4000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rapports Financiers</h1>
        <p className="text-gray-500">Analyse des performances et prévisions</p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white">
          <p className="text-green-100 text-xs">Recettes nettes</p>
          <p className="text-2xl font-bold mt-1">{snapshot.netRevenue.toLocaleString()}</p>
          <p className="text-green-200 text-xs">HTG</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
          <p className="text-orange-100 text-xs">Lots versés</p>
          <p className="text-2xl font-bold mt-1">{mockSeries.reduce((s, x) => s + x.totalPrizesPaid, 0).toLocaleString()}</p>
          <p className="text-orange-200 text-xs">HTG</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white">
          <p className="text-purple-100 text-xs">Lots en attente</p>
          <p className="text-2xl font-bold mt-1">{snapshot.validatedUnpaidGains.toLocaleString()}</p>
          <p className="text-purple-200 text-xs">HTG</p>
        </div>
        <div className={`bg-gradient-to-br ${snapshot.estimatedResult >= 0 ? 'from-blue-500 to-blue-600' : 'from-red-500 to-red-600'} rounded-2xl p-5 text-white`}>
          <p className="text-blue-100 text-xs">Résultat estimé</p>
          <p className="text-2xl font-bold mt-1">{snapshot.estimatedResult.toLocaleString()}</p>
          <p className="text-blue-200 text-xs">HTG</p>
        </div>
      </div>

      {/* Trend */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Évolution mensuelle</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="ventes" stroke="#3B82F6" fill="#DBEAFE" name="Ventes" />
            <Area type="monotone" dataKey="lots" stroke="#F59E0B" fill="#FEF3C7" name="Lots" />
            <Area type="monotone" dataKey="marge" stroke="#10B981" fill="#D1FAE5" name="Marge" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Forecasts */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          Prévisions (prochaines 24h)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-sm text-blue-600">Recettes attendues</p>
            <p className="text-xl font-bold text-blue-800">~8 500 HTG</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <p className="text-sm text-orange-600">Lots probables</p>
            <p className="text-xl font-bold text-orange-800">~4 200 HTG</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-sm text-green-600">Marge estimée</p>
            <p className="text-xl font-bold text-green-800">~2 100 HTG</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Hypothèses :</p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Basé sur la moyenne des 7 derniers jours</li>
            <li>• Taux de gain moyen observé: 42%</li>
            <li>• Pas de nouvelle série publiée (couverture insuffisante)</li>
            <li>• Confiance: <span className="font-medium text-yellow-600">MOYENNE</span></li>
          </ul>
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
        <p className="text-gray-500">Journal d'audit, détection de fraude et intégrité</p>
      </div>

      {/* Security Alerts */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-medium text-red-800">Alerte sécurité active</p>
            <p className="text-sm text-red-600">Compte u5 suspendu - Tentatives multiples depuis IP suspecte. Série s3 suspendue pour couverture insuffisante.</p>
          </div>
        </div>
      </div>

      {/* Security Measures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Mesures anti-fraude
          </h3>
          <div className="space-y-2">
            {[
              'Protection brute-force (max 5 tentatives/15min)',
              'Détection comptes multiples (fingerprint device)',
              'Limite de retrait journalier configurable',
              'Vérification KYC pour retraits > seuil',
              'Cooldown entre révélations suspectes',
              'Clés d\'idempotence sur achats et retraits',
              'Aucune logique de gain côté client',
              'Séparation des rôles (opérateur/admin/CFO)',
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-green-50">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{m}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-600" />
            Intégrité des tickets
          </h3>
          <div className="space-y-2">
            {[
              'Codes secrets: hash SHA-256 côté serveur',
              'QR codes signés HMAC-SHA256',
              'Machine à états: CREATED→SOLD→REVEALED→REDEEMED',
              'SELECT FOR UPDATE sur les transactions',
              'Résultats pré-générés et verrouillés',
              'Graine aléatoire cryptographique (preuve)',
              'Aucun résultat modifiable après vente',
              'Audit trail immuable',
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-purple-50">
                <Lock className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{m}</span>
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
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${log.action.includes('FAILED') || log.action.includes('SUSPENDED') ? 'bg-red-100' : log.action.includes('WITHDRAWAL') || log.action.includes('RESERVE') ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                {log.action.includes('FAILED') || log.action.includes('SUSPENDED') ? <XCircle className="w-4 h-4 text-red-600" /> : <FileText className="w-4 h-4 text-blue-600" />}
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
        <p className="text-gray-500 mt-1">Documentation complète du moteur de loterie ChansAyiti</p>
      </div>

      {/* System Overview */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Server className="w-6 h-6 text-blue-600" />
          Composants du système
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <Smartphone className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-semibold text-blue-900 text-sm">Mobile</h3>
            <p className="text-xs text-blue-700 mt-1">React Native / Expo</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <Globe className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-semibold text-green-900 text-sm">Web</h3>
            <p className="text-xs text-green-700 mt-1">React / Next.js</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <Database className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-semibold text-purple-900 text-sm">API</h3>
            <p className="text-xs text-purple-700 mt-1">FastAPI / Python</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <Zap className="w-8 h-8 text-orange-600 mb-2" />
            <h3 className="font-semibold text-orange-900 text-sm">Moteur</h3>
            <p className="text-xs text-orange-700 mt-1">Lotterie + Finance</p>
          </div>
        </div>
      </div>

      {/* Database Schema */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-6 h-6 text-purple-600" />
          Schéma PostgreSQL (Séries + Tickets + Finance)
        </h2>
        <div className="bg-gray-900 rounded-xl p-5 overflow-x-auto">
          <pre className="text-xs text-green-400 font-mono whitespace-pre">{`-- Séries de tickets avec budget et règles
CREATE TABLE series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    ticket_price INTEGER NOT NULL, -- 100, 250, 500, 1000 HTG
    total_tickets INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    -- DRAFT → PUBLISHED → SOLD_OUT | SUSPENDED → CLOSED
    
    -- Règles (immuables après publication)
    rules_version VARCHAR(20) NOT NULL,
    algorithm_version VARCHAR(20) NOT NULL,
    win_rate DECIMAL(5,4) NOT NULL CHECK (win_rate BETWEEN 0 AND 1),
    prize_grid JSONB NOT NULL, -- [{amount, quantity, probability}]
    
    -- Budget
    max_prize_cost BIGINT NOT NULL,
    approved_budget BIGINT NOT NULL CHECK (approved_budget >= max_prize_cost),
    reserve_allocation BIGINT NOT NULL,
    
    -- Compteurs
    tickets_sold INTEGER DEFAULT 0,
    tickets_revealed INTEGER DEFAULT 0,
    winners_count INTEGER DEFAULT 0,
    total_prizes_paid BIGINT DEFAULT 0,
    total_prizes_pending BIGINT DEFAULT 0,
    
    -- Sécurité
    result_seed_hash VARCHAR(256) NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE,
    
    -- Dates
    published_at TIMESTAMPTZ,
    sales_start_at TIMESTAMPTZ NOT NULL,
    sales_end_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    CONSTRAINT valid_series_budget CHECK (
        approved_budget >= max_prize_cost OR status = 'DRAFT'
    )
);

-- Tickets avec machine à états stricte
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    series_id UUID NOT NULL REFERENCES series(id),
    public_id VARCHAR(50) UNIQUE NOT NULL,
    secret_hash VARCHAR(256) NOT NULL,
    type VARCHAR(20) NOT NULL, -- PHYSICAL | VIRTUAL
    status VARCHAR(20) NOT NULL DEFAULT 'CREATED',
    price INTEGER NOT NULL,
    prize_amount BIGINT,
    prize_tier_index INTEGER,
    owner_id UUID REFERENCES users(id),
    purchased_at TIMESTAMPTZ,
    revealed_at TIMESTAMPTZ,
    redeemed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_ticket_status CHECK (
        status IN ('CREATED','SOLD','REVEALED','REDEEMED')
    ),
    CONSTRAINT valid_transitions CHECK (
        (status = 'CREATED' AND owner_id IS NULL AND prize_amount IS NULL) OR
        (status = 'SOLD' AND owner_id IS NOT NULL AND prize_amount IS NOT NULL) OR
        (status = 'REVEALED' AND owner_id IS NOT NULL AND prize_amount IS NOT NULL AND revealed_at IS NOT NULL) OR
        (status = 'REDEEMED' AND owner_id IS NOT NULL AND prize_amount IS NOT NULL AND redeemed_at IS NOT NULL)
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
    series_id UUID REFERENCES series(id),
    description TEXT,
    status VARCHAR(20) DEFAULT 'COMPLETED',
    idempotency_key VARCHAR(100) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Retraits avec cycle de vie complet
CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount BIGINT NOT NULL CHECK (amount > 0),
    provider VARCHAR(20) NOT NULL, -- MONCASH | NATCASH
    phone_number VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    -- REQUESTED → VALIDATED → PROCESSING → PAID | FAILED | REJECTED | RECONCILED
    
    provider_transaction_id VARCHAR(100),
    provider_confirmation_code VARCHAR(100),
    provider_callback_received BOOLEAN DEFAULT FALSE,
    
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    validated_at TIMESTAMPTZ,
    processing_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    validated_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    admin_notes TEXT
);

-- Cycles horaires (idempotence)
CREATE TABLE hourly_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_number INTEGER NOT NULL UNIQUE,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL,
    financial_check_passed BOOLEAN,
    new_series_id UUID REFERENCES series(id),
    alerts_generated INTEGER DEFAULT 0,
    errors JSONB DEFAULT '[]',
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    lock_acquired_at TIMESTAMPTZ
);

-- Alertes financières
CREATE TABLE financial_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(20) NOT NULL, -- INFO | WARNING | CRITICAL
    series_id UUID REFERENCES series(id),
    message TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES users(id)
);`}</pre>
        </div>
      </div>

      {/* State Machine */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Machine à états</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Tickets</h3>
            <div className="flex flex-wrap items-center gap-2">
              {['CREATED', 'SOLD', 'REVEALED', 'REDEEMED'].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-mono font-medium">{s}</span>
                  {i < 3 && <span className="text-gray-400">→</span>}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Retraits</h3>
            <div className="flex flex-wrap items-center gap-2">
              {['REQUESTED', 'VALIDATED', 'PROCESSING', 'PAID'].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-mono font-medium">{s}</span>
                  {i < 3 && <span className="text-gray-400">→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Rules */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          Règles financières obligatoires
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'Aucun ticket gagnant publié si son gain compromet les engagements',
            'Les gains validés sont couverts par des fonds dédiés et vérifiables',
            'Les fonds de lots ne financent pas les dépenses opérationnelles',
            'Chaque série a une limite maximale d\'engagement financier',
            'Refus de série non financée intégralement',
            'Suspension automatique si couverture insuffisante',
            'Aucun gain validé ne peut être annulé ou diminué',
            'Distinction: encaissé / net / bénéfice / disponible',
          ].map((rule, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
              <Shield className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{rule}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== SHARED COMPONENTS ====================

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600', yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600', purple: 'bg-purple-100 text-purple-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]} mb-3`}><Icon className="w-5 h-5" /></div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function KPICard({ label, value, unit, icon: Icon, color }: { label: string; value: string; unit: string; icon: any; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-100 text-green-600', orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600', yellow: 'bg-yellow-100 text-yellow-600', red: 'bg-red-100 text-red-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]}`}><Icon className="w-4 h-4" /></div>
      </div>
      <p className="text-xl font-bold text-gray-900">{value} <span className="text-xs text-gray-400">{unit}</span></p>
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

function SeriesStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    DRAFT: { label: 'Brouillon', className: 'bg-gray-100 text-gray-600' },
    PUBLISHED: { label: 'Publiée', className: 'bg-green-100 text-green-700' },
    SOLD_OUT: { label: 'Épuisée', className: 'bg-yellow-100 text-yellow-700' },
    SUSPENDED: { label: 'Suspendue', className: 'bg-red-100 text-red-700' },
    CLOSED: { label: 'Fermée', className: 'bg-gray-100 text-gray-600' },
  };
  const { label, className } = config[status] || { label: status, className: 'bg-gray-100 text-gray-600' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{label}</span>;
}

function WithdrawalStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    REQUESTED: { label: 'Demandé', className: 'bg-yellow-100 text-yellow-700' },
    VALIDATED: { label: 'Validé', className: 'bg-blue-100 text-blue-700' },
    PROCESSING: { label: 'En cours', className: 'bg-purple-100 text-purple-700' },
    PAID: { label: 'Payé', className: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'Rejeté', className: 'bg-red-100 text-red-700' },
    FAILED: { label: 'Échoué', className: 'bg-red-100 text-red-700' },
    RECONCILED: { label: 'Rapproché', className: 'bg-gray-100 text-gray-700' },
  };
  const { label, className } = config[status] || { label: status, className: 'bg-gray-100 text-gray-600' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{label}</span>;
}

function FinRow({ label, value, sign, color, bold }: { label: string; value: number; sign: string; color: string; bold?: boolean }) {
  const colors: Record<string, string> = { green: 'text-green-600', red: 'text-red-600', blue: 'text-blue-600' };
  return (
    <div className={`flex justify-between items-center ${bold ? 'pt-1' : ''}`}>
      <span className={`text-sm ${bold ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{label}</span>
      <span className={`font-mono text-sm ${bold ? 'font-bold' : 'font-medium'} ${colors[color]}`}>
        {sign} {Math.abs(value).toLocaleString()} HTG
      </span>
    </div>
  );
}

function TimelineStep({ label, done, time }: { label: string; done: boolean; time: string | null }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-4 h-4 rounded-full border-2 ${done ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`} />
      <span className={`text-[10px] mt-1 ${done ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{label}</span>
      {time && <span className="text-[9px] text-gray-400">{new Date(time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>}
    </div>
  );
}

export default App;
