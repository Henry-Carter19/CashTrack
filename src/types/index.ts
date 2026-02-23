export interface Borrower {
  id: string;
  name: string;
  phone: string;
  notes: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  borrowerId: string;
  type: 'lent' | 'received';
  amount: number;
  date: string;
  time: string;
  notes: string;
  createdAt: string;
}

export interface BorrowerSummary extends Borrower {
  totalLent: number;
  totalReceived: number;
  balance: number;
}
