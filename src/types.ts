export type TicketStatus = 'CREATED' | 'SOLD' | 'REVEALED' | 'REDEEMED';
export type TicketType = 'PHYSICAL' | 'VIRTUAL';
export type WithdrawalStatus = 'REQUESTED' | 'VALIDATED' | 'PROCESSING' | 'PAID' | 'REJECTED' | 'FAILED' | 'RECONCILED';
export type WithdrawalProvider = 'MONCASH' | 'NATCASH';
export type TransactionType = 'TICKET_PURCHASE' | 'WIN_CREDIT' | 'WITHDRAWAL_REQUEST' | 'WITHDRAWAL_COMPLETED' | 'WITHDRAWAL_FAILED' | 'DEPOSIT' | 'REFUND' | 'RESERVE_ALLOCATION';
export type SeriesStatus = 'DRAFT' | 'PUBLISHED' | 'SOLD_OUT' | 'SUSPENDED' | 'CLOSED';
export type FinancialAlertLevel = 'INFO' | 'WARNING' | 'CRITICAL';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'DISTRIBUTOR';
  createdAt: string;
  isSuspended: boolean;
}

export interface Wallet {
  userId: string;
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalWinnings: number;
}

export interface Ticket {
  id: string;
  publicId: string;
  secretCode: string;
  type: TicketType;
  status: TicketStatus;
  price: number;
  prizeAmount: number | null;
  ownerId: string | null;
  purchasedAt: string | null;
  revealedAt: string | null;
  redeemedAt: string | null;
  batchId: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  reference: string;
  description: string;
  createdAt: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  provider: WithdrawalProvider;
  phoneNumber: string;
  status: WithdrawalStatus;
  requestedAt: string;
  completedAt: string | null;
  adminNote: string;
}

export interface Batch {
  id: string;
  name: string;
  totalTickets: number;
  soldTickets: number;
  revealedTickets: number;
  totalPrizes: number;
  totalRevenue: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}
