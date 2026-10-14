import { User, Wallet, Ticket, Transaction, Withdrawal, Batch, AuditLog } from './types';
import { Series, FinancialSnapshot, HourlyCycleExecution, WithdrawalRequest, SystemConfig } from './engine/types';

// ============================================================
// CONFIGURATION SYSTÈME
// ============================================================

export const systemConfig: SystemConfig = {
  ticketCategories: [
    { price: 100, targetWinRate: 0.30, enabled: true },
    { price: 250, targetWinRate: 0.40, enabled: true },
    { price: 500, targetWinRate: 0.50, enabled: true },
    { price: 1000, targetWinRate: 0.60, enabled: true },
  ],
  prizeGrid: [50, 100, 250, 500, 1000, 5000, 10000, 25000, 50000, 100000],
  maxPrizeAmount: 100000,
  minPrizeAmount: 50,
  maxDailyWithdrawal: 50000,
  maxWithdrawalWithoutKYC: 10000,
  minCoverageRatio: 1.2,
  alertCoverageRatio: 1.5,
  hourlyCycleEnabled: true,
  maxSeriesPerDay: 24,
  moncashEnabled: true,
  natcashEnabled: true,
};

// ============================================================
// UTILISATEURS
// ============================================================

export const mockUsers: User[] = [
  { id: 'u1', phone: '+50934567890', name: 'Jean Pierre', role: 'USER', createdAt: '2024-01-15', isSuspended: false },
  { id: 'u2', phone: '+50937891234', name: 'Marie Joseph', role: 'USER', createdAt: '2024-02-20', isSuspended: false },
  { id: 'u3', phone: '+50936123456', name: 'Ricardo Désir', role: 'DISTRIBUTOR', createdAt: '2024-01-10', isSuspended: false },
  { id: 'u4', phone: '+50934987654', name: 'Claudette François', role: 'USER', createdAt: '2024-03-01', isSuspended: false },
  { id: 'u5', phone: '+50932111222', name: 'Patrick Sylvain', role: 'USER', createdAt: '2024-03-15', isSuspended: true },
  { id: 'admin1', phone: '+50931000000', name: 'Admin Principal', role: 'ADMIN', createdAt: '2024-01-01', isSuspended: false },
  { id: 'cfo1', phone: '+50931000001', name: 'Marie-Claire Duval', role: 'ADMIN', createdAt: '2024-01-01', isSuspended: false },
];

// ============================================================
// PORTEFEUILLES
// ============================================================

export const mockWallets: Record<string, Wallet> = {
  u1: { userId: 'u1', balance: 2500, totalDeposits: 5000, totalWithdrawals: 1500, totalWinnings: 4000 },
  u2: { userId: 'u2', balance: 750, totalDeposits: 2000, totalWithdrawals: 1000, totalWinnings: 1750 },
  u4: { userId: 'u4', balance: 15000, totalDeposits: 10000, totalWithdrawals: 0, totalWinnings: 25000 },
};

// ============================================================
// SÉRIES DE TICKETS (NOUVEAU MODÈLE)
// ============================================================

export const mockSeries: Series[] = [
  {
    id: 's1',
    name: 'Série 100 HTG - Mars 2024',
    ticketPrice: 100,
    totalTickets: 500,
    status: 'PUBLISHED',
    rules: {
      version: '1.0.0',
      algorithmVersion: 'v2.1',
      winRate: 0.30,
      maxPrize: 100000,
      minPrize: 50,
      prizeTiers: [
        { amount: 50, quantity: 60, probability: 0.40 },
        { amount: 100, quantity: 40, probability: 0.27 },
        { amount: 250, quantity: 20, probability: 0.13 },
        { amount: 500, quantity: 15, probability: 0.10 },
        { amount: 1000, quantity: 8, probability: 0.05 },
        { amount: 5000, quantity: 3, probability: 0.02 },
        { amount: 10000, quantity: 2, probability: 0.013 },
        { amount: 50000, quantity: 1, probability: 0.007 },
        { amount: 100000, quantity: 1, probability: 0.007 },
      ],
      createdAt: '2024-03-01T00:00:00Z',
      approvedBy: 'cfo1',
    },
    budget: {
      totalRevenue: 50000,
      maxPrizeCost: 175500,
      approvedBudget: 200000,
      reserveAllocation: 180000,
      operationalCosts: 5000,
      taxProvision: 3000,
      distributorCommissions: 5000,
      paymentFees: 2000,
      netExpected: -500,
      coverageRatio: 1.01,
    },
    ticketsSold: 320,
    ticketsRevealed: 180,
    winnersCount: 52,
    totalPrizesPaid: 28500,
    totalPrizesPending: 12000,
    publishedAt: '2024-03-01T08:00:00Z',
    salesStartAt: '2024-03-01T08:00:00Z',
    salesEndAt: null,
    closedAt: null,
    createdAt: '2024-02-28T10:00:00Z',
    createdBy: 'admin1',
    lastModifiedAt: '2024-04-10T12:00:00Z',
    resultSeedHash: 'sha256:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    isLocked: true,
    unsoldTicketsPolicy: 'HOLD',
  },
  {
    id: 's2',
    name: 'Série 250 HTG - Avril 2024',
    ticketPrice: 250,
    totalTickets: 300,
    status: 'PUBLISHED',
    rules: {
      version: '1.0.0',
      algorithmVersion: 'v2.1',
      winRate: 0.40,
      maxPrize: 100000,
      minPrize: 50,
      prizeTiers: [
        { amount: 50, quantity: 30, probability: 0.25 },
        { amount: 100, quantity: 35, probability: 0.29 },
        { amount: 250, quantity: 25, probability: 0.21 },
        { amount: 500, quantity: 15, probability: 0.125 },
        { amount: 1000, quantity: 8, probability: 0.067 },
        { amount: 5000, quantity: 4, probability: 0.033 },
        { amount: 10000, quantity: 2, probability: 0.017 },
        { amount: 25000, quantity: 1, probability: 0.008 },
      ],
      createdAt: '2024-04-01T00:00:00Z',
      approvedBy: 'cfo1',
    },
    budget: {
      totalRevenue: 75000,
      maxPrizeCost: 71500,
      approvedBudget: 80000,
      reserveAllocation: 75000,
      operationalCosts: 3000,
      taxProvision: 2000,
      distributorCommissions: 3750,
      paymentFees: 1500,
      netExpected: -250,
      coverageRatio: 1.05,
    },
    ticketsSold: 180,
    ticketsRevealed: 95,
    winnersCount: 38,
    totalPrizesPaid: 18000,
    totalPrizesPending: 8500,
    publishedAt: '2024-04-01T08:00:00Z',
    salesStartAt: '2024-04-01T08:00:00Z',
    salesEndAt: null,
    closedAt: null,
    createdAt: '2024-03-30T10:00:00Z',
    createdBy: 'admin1',
    lastModifiedAt: '2024-04-10T12:00:00Z',
    resultSeedHash: 'sha256:z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4',
    isLocked: true,
    unsoldTicketsPolicy: 'HOLD',
  },
  {
    id: 's3',
    name: 'Série 500 HTG - Avril 2024',
    ticketPrice: 500,
    totalTickets: 200,
    status: 'SUSPENDED',
    rules: {
      version: '1.0.0',
      algorithmVersion: 'v2.1',
      winRate: 0.50,
      maxPrize: 100000,
      minPrize: 50,
      prizeTiers: [
        { amount: 100, quantity: 30, probability: 0.30 },
        { amount: 250, quantity: 25, probability: 0.25 },
        { amount: 500, quantity: 20, probability: 0.20 },
        { amount: 1000, quantity: 12, probability: 0.12 },
        { amount: 5000, quantity: 6, probability: 0.06 },
        { amount: 10000, quantity: 4, probability: 0.04 },
        { amount: 50000, quantity: 2, probability: 0.02 },
        { amount: 100000, quantity: 1, probability: 0.01 },
      ],
      createdAt: '2024-04-05T00:00:00Z',
      approvedBy: 'cfo1',
    },
    budget: {
      totalRevenue: 100000,
      maxPrizeCost: 175000,
      approvedBudget: 180000,
      reserveAllocation: 175000,
      operationalCosts: 3000,
      taxProvision: 2000,
      distributorCommissions: 5000,
      paymentFees: 2000,
      netExpected: -2000,
      coverageRatio: 1.03,
    },
    ticketsSold: 45,
    ticketsRevealed: 12,
    winnersCount: 6,
    totalPrizesPaid: 3500,
    totalPrizesPending: 2000,
    publishedAt: '2024-04-05T08:00:00Z',
    salesStartAt: '2024-04-05T08:00:00Z',
    salesEndAt: '2024-04-08T08:00:00Z',
    closedAt: null,
    createdAt: '2024-04-04T10:00:00Z',
    createdBy: 'admin1',
    lastModifiedAt: '2024-04-08T08:00:00Z',
    resultSeedHash: 'sha256:m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6',
    isLocked: true,
    unsoldTicketsPolicy: 'HOLD',
  },
  {
    id: 's4',
    name: 'Série 1000 HTG - Avril 2024',
    ticketPrice: 1000,
    totalTickets: 100,
    status: 'DRAFT',
    rules: {
      version: '1.0.0',
      algorithmVersion: 'v2.1',
      winRate: 0.60,
      maxPrize: 100000,
      minPrize: 100,
      prizeTiers: [
        { amount: 100, quantity: 15, probability: 0.25 },
        { amount: 250, quantity: 12, probability: 0.20 },
        { amount: 500, quantity: 15, probability: 0.25 },
        { amount: 1000, quantity: 10, probability: 0.167 },
        { amount: 5000, quantity: 5, probability: 0.083 },
        { amount: 10000, quantity: 2, probability: 0.033 },
        { amount: 50000, quantity: 1, probability: 0.017 },
      ],
      createdAt: '2024-04-10T00:00:00Z',
      approvedBy: 'cfo1',
    },
    budget: {
      totalRevenue: 100000,
      maxPrizeCost: 127500,
      approvedBudget: 0,
      reserveAllocation: 0,
      operationalCosts: 2000,
      taxProvision: 1500,
      distributorCommissions: 5000,
      paymentFees: 2000,
      netExpected: 0,
      coverageRatio: 0,
    },
    ticketsSold: 0,
    ticketsRevealed: 0,
    winnersCount: 0,
    totalPrizesPaid: 0,
    totalPrizesPending: 0,
    publishedAt: null,
    salesStartAt: '2024-04-12T08:00:00Z',
    salesEndAt: null,
    closedAt: null,
    createdAt: '2024-04-10T10:00:00Z',
    createdBy: 'admin1',
    lastModifiedAt: '2024-04-10T10:00:00Z',
    resultSeedHash: '',
    isLocked: false,
    unsoldTicketsPolicy: 'HOLD',
  },
];

// ============================================================
// TICKETS
// ============================================================

export const mockTickets: Ticket[] = [
  { id: 't1', publicId: 'CHN-2024-00001', secretCode: 'AX7K9M2P', type: 'PHYSICAL', status: 'SOLD', price: 100, prizeAmount: null, ownerId: 'u1', purchasedAt: '2024-03-20', revealedAt: null, redeemedAt: null, batchId: 's1' },
  { id: 't2', publicId: 'CHN-2024-00002', secretCode: 'BQ3L8N5R', type: 'PHYSICAL', status: 'REVEALED', price: 100, prizeAmount: 500, ownerId: 'u1', purchasedAt: '2024-03-20', revealedAt: '2024-03-21', redeemedAt: null, batchId: 's1' },
  { id: 't3', publicId: 'CHN-2024-00003', secretCode: 'CW5M2K8T', type: 'PHYSICAL', status: 'REDEEMED', price: 100, prizeAmount: 10000, ownerId: 'u2', purchasedAt: '2024-03-22', revealedAt: '2024-03-23', redeemedAt: '2024-03-24', batchId: 's1' },
  { id: 't4', publicId: 'CHN-2024-00004', secretCode: 'DY9P4J6V', type: 'VIRTUAL', status: 'SOLD', price: 250, prizeAmount: null, ownerId: 'u2', purchasedAt: '2024-04-02', revealedAt: null, redeemedAt: null, batchId: 's2' },
  { id: 't5', publicId: 'CHN-2024-00005', secretCode: 'EZ1Q7H3W', type: 'VIRTUAL', status: 'REVEALED', price: 250, prizeAmount: 50, ownerId: 'u4', purchasedAt: '2024-04-03', revealedAt: '2024-04-04', redeemedAt: null, batchId: 's2' },
  { id: 't6', publicId: 'CHN-2024-00006', secretCode: 'FR8S5G2X', type: 'PHYSICAL', status: 'CREATED', price: 100, prizeAmount: null, ownerId: null, purchasedAt: null, revealedAt: null, redeemedAt: null, batchId: 's1' },
  { id: 't7', publicId: 'CHN-2024-00007', secretCode: 'GT4U6F9Y', type: 'VIRTUAL', status: 'REVEALED', price: 250, prizeAmount: 100000, ownerId: 'u4', purchasedAt: '2024-04-05', revealedAt: '2024-04-06', redeemedAt: null, batchId: 's2' },
  { id: 't8', publicId: 'CHN-2024-00008', secretCode: 'HV2V8E1Z', type: 'PHYSICAL', status: 'SOLD', price: 100, prizeAmount: null, ownerId: 'u1', purchasedAt: '2024-04-07', revealedAt: null, redeemedAt: null, batchId: 's1' },
  { id: 't9', publicId: 'CHN-2024-00009', secretCode: 'JW7X3D4A', type: 'VIRTUAL', status: 'REDEEMED', price: 250, prizeAmount: 1000, ownerId: 'u1', purchasedAt: '2024-04-08', revealedAt: '2024-04-09', redeemedAt: '2024-04-10', batchId: 's2' },
  { id: 't10', publicId: 'CHN-2024-00010', secretCode: 'KY1Z9C6B', type: 'PHYSICAL', status: 'SOLD', price: 500, prizeAmount: null, ownerId: 'u4', purchasedAt: '2024-04-06', revealedAt: null, redeemedAt: null, batchId: 's3' },
  { id: 't11', publicId: 'CHN-2024-00011', secretCode: 'LZ5A2B8C', type: 'VIRTUAL', status: 'REVEALED', price: 250, prizeAmount: 250, ownerId: 'u2', purchasedAt: '2024-04-07', revealedAt: '2024-04-08', redeemedAt: null, batchId: 's2' },
  { id: 't12', publicId: 'CHN-2024-00012', secretCode: 'MA3D7E1F', type: 'PHYSICAL', status: 'REDEEMED', price: 500, prizeAmount: 5000, ownerId: 'u4', purchasedAt: '2024-04-06', revealedAt: '2024-04-07', redeemedAt: '2024-04-08', batchId: 's3' },
];

// ============================================================
// TRANSACTIONS (REGISTRE DOUBLE ÉCRITURE)
// ============================================================

export const mockTransactions: Transaction[] = [
  { id: 'tx1', type: 'TICKET_PURCHASE', debitAccount: 'u1-wallet', creditAccount: 'house-revenue', amount: 100, reference: 't2', description: 'Achat ticket CHN-2024-00002', createdAt: '2024-03-20T10:00:00', status: 'COMPLETED' },
  { id: 'tx2', type: 'WIN_CREDIT', debitAccount: 'house-prize-reserve', creditAccount: 'u1-wallet', amount: 500, reference: 't2', description: 'Gain ticket CHN-2024-00002', createdAt: '2024-03-21T14:30:00', status: 'COMPLETED' },
  { id: 'tx3', type: 'TICKET_PURCHASE', debitAccount: 'u2-wallet', creditAccount: 'house-revenue', amount: 100, reference: 't3', description: 'Achat ticket CHN-2024-00003', createdAt: '2024-03-22T09:15:00', status: 'COMPLETED' },
  { id: 'tx4', type: 'WIN_CREDIT', debitAccount: 'house-prize-reserve', creditAccount: 'u2-wallet', amount: 10000, reference: 't3', description: 'Gain ticket CHN-2024-00003', createdAt: '2024-03-23T16:45:00', status: 'COMPLETED' },
  { id: 'tx5', type: 'WITHDRAWAL_REQUEST', debitAccount: 'u2-wallet', creditAccount: 'pending-withdrawals', amount: 1000, reference: 'w1', description: 'Retrait MonCash +50937891234', createdAt: '2024-03-24T11:00:00', status: 'COMPLETED' },
  { id: 'tx6', type: 'WIN_CREDIT', debitAccount: 'house-prize-reserve', creditAccount: 'u4-wallet', amount: 100000, reference: 't7', description: 'Gain ticket CHN-2024-00007', createdAt: '2024-04-06T08:00:00', status: 'COMPLETED' },
  { id: 'tx7', type: 'WIN_CREDIT', debitAccount: 'house-prize-reserve', creditAccount: 'u1-wallet', amount: 1000, reference: 't9', description: 'Gain ticket CHN-2024-00009', createdAt: '2024-04-09T12:00:00', status: 'COMPLETED' },
  { id: 'tx8', type: 'WIN_CREDIT', debitAccount: 'house-prize-reserve', creditAccount: 'u4-wallet', amount: 5000, reference: 't12', description: 'Gain ticket CHN-2024-00012', createdAt: '2024-04-07T15:30:00', status: 'COMPLETED' },
  { id: 'tx9', type: 'RESERVE_ALLOCATION', debitAccount: 'house-cash', creditAccount: 'house-prize-reserve', amount: 180000, reference: 's1', description: 'Allocation réserve série s1', createdAt: '2024-03-01T07:00:00', status: 'COMPLETED' },
  { id: 'tx10', type: 'RESERVE_ALLOCATION', debitAccount: 'house-cash', creditAccount: 'house-prize-reserve', amount: 75000, reference: 's2', description: 'Allocation réserve série s2', createdAt: '2024-04-01T07:00:00', status: 'COMPLETED' },
];

// ============================================================
// RETRAITS (NOUVEAU CYCLE DE VIE)
// ============================================================

export const mockWithdrawals: WithdrawalRequest[] = [
  {
    id: 'w1', userId: 'u2', amount: 1000, provider: 'MONCASH', phoneNumber: '+50937891234',
    status: 'PAID',
    requestedAt: '2024-03-24T11:00:00Z', validatedAt: '2024-03-24T12:00:00Z',
    processingAt: '2024-03-24T13:00:00Z', paidAt: '2024-03-24T14:00:00Z', failedAt: null,
    providerTransactionId: 'MC-TX-20240324-001', providerConfirmationCode: 'MC-CONF-ABC123',
    providerCallbackReceived: true, lastStatusCheckAt: '2024-03-24T14:05:00Z',
    idempotencyKey: 'idem-w1-abc123', retryCount: 0, maxRetries: 3,
    validatedBy: 'admin1', rejectionReason: null, adminNotes: 'Vérifié et payé',
  },
  {
    id: 'w2', userId: 'u1', amount: 1500, provider: 'NATCASH', phoneNumber: '+50934567890',
    status: 'REQUESTED',
    requestedAt: '2024-04-10T09:00:00Z', validatedAt: null,
    processingAt: null, paidAt: null, failedAt: null,
    providerTransactionId: null, providerConfirmationCode: null,
    providerCallbackReceived: false, lastStatusCheckAt: null,
    idempotencyKey: 'idem-w2-def456', retryCount: 0, maxRetries: 3,
    validatedBy: null, rejectionReason: null, adminNotes: '',
  },
  {
    id: 'w3', userId: 'u4', amount: 5000, provider: 'MONCASH', phoneNumber: '+50934987654',
    status: 'VALIDATED',
    requestedAt: '2024-04-10T10:30:00Z', validatedAt: '2024-04-10T11:00:00Z',
    processingAt: null, paidAt: null, failedAt: null,
    providerTransactionId: null, providerConfirmationCode: null,
    providerCallbackReceived: false, lastStatusCheckAt: null,
    idempotencyKey: 'idem-w3-ghi789', retryCount: 0, maxRetries: 3,
    validatedBy: 'admin1', rejectionReason: null, adminNotes: 'Approuvé - En attente envoi prestataire',
  },
  {
    id: 'w4', userId: 'u4', amount: 10000, provider: 'NATCASH', phoneNumber: '+50934987654',
    status: 'PROCESSING',
    requestedAt: '2024-04-09T16:00:00Z', validatedAt: '2024-04-09T16:30:00Z',
    processingAt: '2024-04-09T17:00:00Z', paidAt: null, failedAt: null,
    providerTransactionId: 'NC-TX-20240409-005', providerConfirmationCode: null,
    providerCallbackReceived: false, lastStatusCheckAt: '2024-04-10T09:00:00Z',
    idempotencyKey: 'idem-w4-jkl012', retryCount: 1, maxRetries: 3,
    validatedBy: 'admin1', rejectionReason: null, adminNotes: 'En attente de confirmation NatCash',
  },
  {
    id: 'w5', userId: 'u1', amount: 500, provider: 'MONCASH', phoneNumber: '+50934567890',
    status: 'REJECTED',
    requestedAt: '2024-04-08T14:00:00Z', validatedAt: null,
    processingAt: null, paidAt: null, failedAt: null,
    providerTransactionId: null, providerConfirmationCode: null,
    providerCallbackReceived: false, lastStatusCheckAt: null,
    idempotencyKey: 'idem-w5-mno345', retryCount: 0, maxRetries: 3,
    validatedBy: 'admin1', rejectionReason: 'Numéro MonCash invalide', adminNotes: 'Contact client pour correction',
  },
];

// ============================================================
// SNAPSHOT FINANCIER
// ============================================================

export const mockFinancialSnapshot: FinancialSnapshot = {
  timestamp: '2024-04-10T12:00:00Z',
  grossRevenue: 225000,
  confirmedCollections: 218000,
  refunds: 2000,
  variableFees: 5500,
  distributorCommissions: 13750,
  netRevenue: 196750,
  validatedUnpaidGains: 20500,
  pendingWithdrawals: 6500,
  reservedForPrizes: 255000,
  operationalCosts: 15000,
  taxProvision: 8000,
  estimatedResult: -29750,
  availableLiquidity: 228000,
  totalEngagements: 275500,
  coverageRatio: 0.83,
  isSolvent: false,
  alerts: [
    {
      id: 'alert1', level: 'CRITICAL', seriesId: 's3',
      message: 'Série 500 HTG suspendue - Couverture insuffisante',
      details: 'Le ratio de couverture (0.83) est inférieur au seuil minimum (1.2). Les ventes de la série s3 sont suspendues.',
      createdAt: '2024-04-08T08:00:00Z', acknowledged: true, acknowledgedBy: 'cfo1',
    },
    {
      id: 'alert2', level: 'WARNING', seriesId: null,
      message: 'Ratio de couverture global en dessous du seuil d\'alerte',
      details: 'Ratio actuel: 0.83. Seuil d\'alerte: 1.5. Seuil minimum: 1.2. Augmenter les réserves ou réduire les engagements.',
      createdAt: '2024-04-08T08:00:00Z', acknowledged: false, acknowledgedBy: null,
    },
    {
      id: 'alert3', level: 'INFO', seriesId: 's4',
      message: 'Série 1000 HTG en attente de financement',
      details: 'Le budget approuvé est de 0 HTG. Budget requis: 127 500 HTG. La série ne peut pas être publiée.',
      createdAt: '2024-04-10T10:00:00Z', acknowledged: false, acknowledgedBy: null,
    },
  ],
};

// ============================================================
// CYCLES HORAIRES
// ============================================================

export const mockHourlyCycles: HourlyCycleExecution[] = [
  {
    id: 'hc1', cycleNumber: 1, startedAt: '2024-04-10T08:00:00Z', completedAt: '2024-04-10T08:02:30Z',
    status: 'COMPLETED', financialCheckPassed: false, previousSeriesReviewed: true,
    newSeriesPublished: false, seriesPublishedId: null, alertsGenerated: 2,
    errorsEncountered: ['Coverage ratio below minimum threshold'],
    idempotencyKey: 'cycle-20240410-08', lockAcquiredAt: '2024-04-10T08:00:01Z',
  },
  {
    id: 'hc2', cycleNumber: 2, startedAt: '2024-04-10T09:00:00Z', completedAt: '2024-04-10T09:01:45Z',
    status: 'COMPLETED', financialCheckPassed: false, previousSeriesReviewed: true,
    newSeriesPublished: false, seriesPublishedId: null, alertsGenerated: 0,
    errorsEncountered: ['Coverage ratio below minimum threshold'],
    idempotencyKey: 'cycle-20240410-09', lockAcquiredAt: '2024-04-10T09:00:01Z',
  },
  {
    id: 'hc3', cycleNumber: 3, startedAt: '2024-04-10T10:00:00Z', completedAt: '2024-04-10T10:03:12Z',
    status: 'COMPLETED', financialCheckPassed: false, previousSeriesReviewed: true,
    newSeriesPublished: false, seriesPublishedId: null, alertsGenerated: 1,
    errorsEncountered: ['Series s4 insufficient budget'],
    idempotencyKey: 'cycle-20240410-10', lockAcquiredAt: '2024-04-10T10:00:01Z',
  },
  {
    id: 'hc4', cycleNumber: 4, startedAt: '2024-04-10T11:00:00Z', completedAt: null,
    status: 'RUNNING', financialCheckPassed: false, previousSeriesReviewed: false,
    newSeriesPublished: false, seriesPublishedId: null, alertsGenerated: 0,
    errorsEncountered: [],
    idempotencyKey: 'cycle-20240410-11', lockAcquiredAt: '2024-04-10T11:00:01Z',
  },
];

// ============================================================
// BATCHES (COMPATIBILITÉ ANCIEN MODÈLE)
// ============================================================

export const mockBatches: Batch[] = [
  { id: 'b1', name: 'Lot Mars 2024 - Physique', totalTickets: 500, soldTickets: 320, revealedTickets: 180, totalPrizes: 45000, totalRevenue: 32000, createdAt: '2024-03-01' },
  { id: 'b2', name: 'Lot Mars 2024 - Virtuel', totalTickets: 1000, soldTickets: 650, revealedTickets: 420, totalPrizes: 125000, totalRevenue: 65000, createdAt: '2024-03-15' },
  { id: 'b3', name: 'Lot Avril 2024 - Physique', totalTickets: 300, soldTickets: 45, revealedTickets: 12, totalPrizes: 5000, totalRevenue: 4500, createdAt: '2024-04-01' },
];

// ============================================================
// AUDIT LOGS
// ============================================================

export const mockAuditLogs: AuditLog[] = [
  { id: 'a1', action: 'TICKET_REVEALED', userId: 'u1', details: 'Ticket t2 révélé - Gain: 500 HTG', ipAddress: '192.168.1.45', createdAt: '2024-03-21T14:30:00' },
  { id: 'a2', action: 'WITHDRAWAL_REQUESTED', userId: 'u2', details: 'Retrait 1000 HTG vers MonCash', ipAddress: '192.168.1.78', createdAt: '2024-03-24T11:00:00' },
  { id: 'a3', action: 'TICKET_REVEALED', userId: 'u4', details: 'Ticket t7 révélé - Gain: 100000 HTG', ipAddress: '192.168.1.12', createdAt: '2024-04-06T08:00:00' },
  { id: 'a4', action: 'LOGIN_FAILED', userId: 'u5', details: 'Tentative de connexion échouée (compte suspendu)', ipAddress: '10.0.0.55', createdAt: '2024-04-05T22:15:00' },
  { id: 'a5', action: 'WITHDRAWAL_VALIDATED', userId: 'admin1', details: 'Retrait w3 validé - 5000 HTG', ipAddress: '192.168.1.1', createdAt: '2024-04-10T11:00:00' },
  { id: 'a6', action: 'SERIES_SUSPENDED', userId: 'system', details: 'Série s3 suspendue - Couverture insuffisante (0.83 < 1.2)', ipAddress: 'system', createdAt: '2024-04-08T08:00:00' },
  { id: 'a7', action: 'HOURLY_CYCLE', userId: 'system', details: 'Cycle hc3 exécuté - Série s4 non publiée (budget insuffisant)', ipAddress: 'system', createdAt: '2024-04-10T10:03:12' },
  { id: 'a8', action: 'RESERVE_ALLOCATION', userId: 'cfo1', details: 'Réserve de 75 000 HTG allouée à la série s2', ipAddress: '192.168.1.1', createdAt: '2024-04-01T07:00:00' },
];

// ============================================================
// DISTRIBUTION DES PRIX (pour affichage)
// ============================================================

export const prizeDistribution = [
  { amount: 50, probability: 0.30, label: '50 HTG' },
  { amount: 100, probability: 0.25, label: '100 HTG' },
  { amount: 250, probability: 0.15, label: '250 HTG' },
  { amount: 500, probability: 0.12, label: '500 HTG' },
  { amount: 1000, probability: 0.08, label: '1 000 HTG' },
  { amount: 5000, probability: 0.05, label: '5 000 HTG' },
  { amount: 10000, probability: 0.03, label: '10 000 HTG' },
  { amount: 50000, probability: 0.015, label: '50 000 HTG' },
  { amount: 100000, probability: 0.005, label: '100 000 HTG' },
];
