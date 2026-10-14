import { User, Wallet, Ticket, Transaction, Withdrawal, Batch, AuditLog } from './types';

export const mockUsers: User[] = [
  { id: 'u1', phone: '+50934567890', name: 'Jean Pierre', role: 'USER', createdAt: '2024-01-15', isSuspended: false },
  { id: 'u2', phone: '+50937891234', name: 'Marie Joseph', role: 'USER', createdAt: '2024-02-20', isSuspended: false },
  { id: 'u3', phone: '+50936123456', name: 'Ricardo Désir', role: 'DISTRIBUTOR', createdAt: '2024-01-10', isSuspended: false },
  { id: 'u4', phone: '+50934987654', name: 'Claudette François', role: 'USER', createdAt: '2024-03-01', isSuspended: false },
  { id: 'u5', phone: '+50932111222', name: 'Patrick Sylvain', role: 'USER', createdAt: '2024-03-15', isSuspended: true },
  { id: 'admin1', phone: '+50931000000', name: 'Admin Principal', role: 'ADMIN', createdAt: '2024-01-01', isSuspended: false },
];

export const mockWallets: Record<string, Wallet> = {
  u1: { userId: 'u1', balance: 2500, totalDeposits: 5000, totalWithdrawals: 1500, totalWinnings: 4000 },
  u2: { userId: 'u2', balance: 750, totalDeposits: 2000, totalWithdrawals: 1000, totalWinnings: 1750 },
  u4: { userId: 'u4', balance: 15000, totalDeposits: 10000, totalWithdrawals: 0, totalWinnings: 25000 },
};

export const mockTickets: Ticket[] = [
  { id: 't1', publicId: 'CHN-2024-00001', secretCode: 'AX7K9M2P', type: 'PHYSICAL', status: 'SOLD', price: 100, prizeAmount: null, ownerId: 'u1', purchasedAt: '2024-03-20', revealedAt: null, redeemedAt: null, batchId: 'b1' },
  { id: 't2', publicId: 'CHN-2024-00002', secretCode: 'BQ3L8N5R', type: 'PHYSICAL', status: 'REVEALED', price: 100, prizeAmount: 500, ownerId: 'u1', purchasedAt: '2024-03-20', revealedAt: '2024-03-21', redeemedAt: null, batchId: 'b1' },
  { id: 't3', publicId: 'CHN-2024-00003', secretCode: 'CW5M2K8T', type: 'PHYSICAL', status: 'REDEEMED', price: 100, prizeAmount: 10000, ownerId: 'u2', purchasedAt: '2024-03-22', revealedAt: '2024-03-23', redeemedAt: '2024-03-24', batchId: 'b1' },
  { id: 't4', publicId: 'CHN-2024-00004', secretCode: 'DY9P4J6V', type: 'VIRTUAL', status: 'SOLD', price: 100, prizeAmount: null, ownerId: 'u2', purchasedAt: '2024-03-25', revealedAt: null, redeemedAt: null, batchId: 'b2' },
  { id: 't5', publicId: 'CHN-2024-00005', secretCode: 'EZ1Q7H3W', type: 'VIRTUAL', status: 'REVEALED', price: 100, prizeAmount: 50, ownerId: 'u4', purchasedAt: '2024-03-26', revealedAt: '2024-03-27', redeemedAt: null, batchId: 'b2' },
  { id: 't6', publicId: 'CHN-2024-00006', secretCode: 'FR8S5G2X', type: 'PHYSICAL', status: 'CREATED', price: 100, prizeAmount: null, ownerId: null, purchasedAt: null, revealedAt: null, redeemedAt: null, batchId: 'b1' },
  { id: 't7', publicId: 'CHN-2024-00007', secretCode: 'GT4U6F9Y', type: 'VIRTUAL', status: 'REVEALED', price: 100, prizeAmount: 100000, ownerId: 'u4', purchasedAt: '2024-03-28', revealedAt: '2024-03-29', redeemedAt: null, batchId: 'b2' },
  { id: 't8', publicId: 'CHN-2024-00008', secretCode: 'HV2V8E1Z', type: 'PHYSICAL', status: 'SOLD', price: 100, prizeAmount: null, ownerId: 'u1', purchasedAt: '2024-03-30', revealedAt: null, redeemedAt: null, batchId: 'b1' },
  { id: 't9', publicId: 'CHN-2024-00009', secretCode: 'JW7X3D4A', type: 'VIRTUAL', status: 'REDEEMED', price: 100, prizeAmount: 1000, ownerId: 'u1', purchasedAt: '2024-04-01', revealedAt: '2024-04-02', redeemedAt: '2024-04-03', batchId: 'b2' },
  { id: 't10', publicId: 'CHN-2024-00010', secretCode: 'KY1Z9C6B', type: 'PHYSICAL', status: 'SOLD', price: 100, prizeAmount: null, ownerId: 'u4', purchasedAt: '2024-04-05', revealedAt: null, redeemedAt: null, batchId: 'b1' },
  { id: 't11', publicId: 'CHN-2024-00011', secretCode: 'LZ5A2B8C', type: 'VIRTUAL', status: 'REVEALED', price: 100, prizeAmount: 250, ownerId: 'u2', purchasedAt: '2024-04-06', revealedAt: '2024-04-07', redeemedAt: null, batchId: 'b2' },
  { id: 't12', publicId: 'CHN-2024-00012', secretCode: 'MA3D7E1F', type: 'PHYSICAL', status: 'REDEEMED', price: 100, prizeAmount: 5000, ownerId: 'u4', purchasedAt: '2024-04-08', revealedAt: '2024-04-09', redeemedAt: '2024-04-10', batchId: 'b1' },
];

export const mockTransactions: Transaction[] = [
  { id: 'tx1', type: 'TICKET_PURCHASE', debitAccount: 'u1-wallet', creditAccount: 'house', amount: 100, reference: 't2', description: 'Achat ticket CHN-2024-00002', createdAt: '2024-03-20T10:00:00', status: 'COMPLETED' },
  { id: 'tx2', type: 'WIN_CREDIT', debitAccount: 'house', creditAccount: 'u1-wallet', amount: 500, reference: 't2', description: 'Gain ticket CHN-2024-00002', createdAt: '2024-03-21T14:30:00', status: 'COMPLETED' },
  { id: 'tx3', type: 'TICKET_PURCHASE', debitAccount: 'u2-wallet', creditAccount: 'house', amount: 100, reference: 't3', description: 'Achat ticket CHN-2024-00003', createdAt: '2024-03-22T09:15:00', status: 'COMPLETED' },
  { id: 'tx4', type: 'WIN_CREDIT', debitAccount: 'house', creditAccount: 'u2-wallet', amount: 10000, reference: 't3', description: 'Gain ticket CHN-2024-00003', createdAt: '2024-03-23T16:45:00', status: 'COMPLETED' },
  { id: 'tx5', type: 'WITHDRAWAL_REQUEST', debitAccount: 'u2-wallet', creditAccount: 'pending-withdrawals', amount: 1000, reference: 'w1', description: 'Retrait MonCash +50937891234', createdAt: '2024-03-24T11:00:00', status: 'COMPLETED' },
  { id: 'tx6', type: 'WIN_CREDIT', debitAccount: 'house', creditAccount: 'u4-wallet', amount: 100000, reference: 't7', description: 'Gain ticket CHN-2024-00007', createdAt: '2024-03-29T08:00:00', status: 'COMPLETED' },
  { id: 'tx7', type: 'WIN_CREDIT', debitAccount: 'house', creditAccount: 'u1-wallet', amount: 1000, reference: 't9', description: 'Gain ticket CHN-2024-00009', createdAt: '2024-04-02T12:00:00', status: 'COMPLETED' },
  { id: 'tx8', type: 'WIN_CREDIT', debitAccount: 'house', creditAccount: 'u4-wallet', amount: 5000, reference: 't12', description: 'Gain ticket CHN-2024-00012', createdAt: '2024-04-09T15:30:00', status: 'COMPLETED' },
];

export const mockWithdrawals: Withdrawal[] = [
  { id: 'w1', userId: 'u2', userName: 'Marie Joseph', amount: 1000, provider: 'MONCASH', phoneNumber: '+50937891234', status: 'COMPLETED', requestedAt: '2024-03-24T11:00:00', completedAt: '2024-03-24T14:00:00', adminNote: 'Vérifié' },
  { id: 'w2', userId: 'u1', userName: 'Jean Pierre', amount: 1500, provider: 'NATCASH', phoneNumber: '+50934567890', status: 'PENDING', requestedAt: '2024-04-10T09:00:00', completedAt: null, adminNote: '' },
  { id: 'w3', userId: 'u4', userName: 'Claudette François', amount: 5000, provider: 'MONCASH', phoneNumber: '+50934987654', status: 'PENDING', requestedAt: '2024-04-10T10:30:00', completedAt: null, adminNote: '' },
  { id: 'w4', userId: 'u4', userName: 'Claudette François', amount: 10000, provider: 'NATCASH', phoneNumber: '+50934987654', status: 'APPROVED', requestedAt: '2024-04-09T16:00:00', completedAt: null, adminNote: 'En attente de confirmation passerelle' },
  { id: 'w5', userId: 'u1', userName: 'Jean Pierre', amount: 500, provider: 'MONCASH', phoneNumber: '+50934567890', status: 'REJECTED', requestedAt: '2024-04-08T14:00:00', completedAt: null, adminNote: 'Numéro MonCash invalide' },
];

export const mockBatches: Batch[] = [
  { id: 'b1', name: 'Lot Mars 2024 - Physique', totalTickets: 500, soldTickets: 320, revealedTickets: 180, totalPrizes: 45000, totalRevenue: 32000, createdAt: '2024-03-01' },
  { id: 'b2', name: 'Lot Mars 2024 - Virtuel', totalTickets: 1000, soldTickets: 650, revealedTickets: 420, totalPrizes: 125000, totalRevenue: 65000, createdAt: '2024-03-15' },
  { id: 'b3', name: 'Lot Avril 2024 - Physique', totalTickets: 300, soldTickets: 45, revealedTickets: 12, totalPrizes: 5000, totalRevenue: 4500, createdAt: '2024-04-01' },
];

export const mockAuditLogs: AuditLog[] = [
  { id: 'a1', action: 'TICKET_REVEALED', userId: 'u1', details: 'Ticket t2 révélé - Gain: 500 HTG', ipAddress: '192.168.1.45', createdAt: '2024-03-21T14:30:00' },
  { id: 'a2', action: 'WITHDRAWAL_REQUESTED', userId: 'u2', details: 'Retrait 1000 HTG vers MonCash', ipAddress: '192.168.1.78', createdAt: '2024-03-24T11:00:00' },
  { id: 'a3', action: 'TICKET_REVEALED', userId: 'u4', details: 'Ticket t7 révélé - Gain: 100000 HTG', ipAddress: '192.168.1.12', createdAt: '2024-03-29T08:00:00' },
  { id: 'a4', action: 'LOGIN_FAILED', userId: 'u5', details: 'Tentative de connexion échouée (compte suspendu)', ipAddress: '10.0.0.55', createdAt: '2024-04-05T22:15:00' },
  { id: 'a5', action: 'WITHDRAWAL_APPROVED', userId: 'admin1', details: 'Retrait w4 approuvé - 10000 HTG', ipAddress: '192.168.1.1', createdAt: '2024-04-09T16:30:00' },
];

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
