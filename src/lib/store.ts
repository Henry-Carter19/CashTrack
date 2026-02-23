import { Borrower, Transaction, BorrowerSummary } from '@/types';

const BORROWERS_KEY = 'lendtracker_borrowers';
const TRANSACTIONS_KEY = 'lendtracker_transactions';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Borrowers
export function getBorrowers(): Borrower[] {
  const data = localStorage.getItem(BORROWERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function addBorrower(b: Omit<Borrower, 'id' | 'createdAt'>): Borrower {
  const borrowers = getBorrowers();
  const newB: Borrower = { ...b, id: generateId(), createdAt: new Date().toISOString() };
  borrowers.push(newB);
  localStorage.setItem(BORROWERS_KEY, JSON.stringify(borrowers));
  return newB;
}

export function updateBorrower(id: string, updates: Partial<Omit<Borrower, 'id' | 'createdAt'>>): void {
  const borrowers = getBorrowers();
  const idx = borrowers.findIndex(b => b.id === id);
  if (idx !== -1) {
    borrowers[idx] = { ...borrowers[idx], ...updates };
    localStorage.setItem(BORROWERS_KEY, JSON.stringify(borrowers));
  }
}

export function deleteBorrower(id: string): void {
  const borrowers = getBorrowers().filter(b => b.id !== id);
  localStorage.setItem(BORROWERS_KEY, JSON.stringify(borrowers));
  const txns = getTransactions().filter(t => t.borrowerId !== id);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txns));
}

// Transactions
export function getTransactions(): Transaction[] {
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getTransactionsByBorrower(borrowerId: string): Transaction[] {
  return getTransactions()
    .filter(t => t.borrowerId === borrowerId)
    .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime());
}

export function addTransaction(t: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
  const txns = getTransactions();
  const newT: Transaction = { ...t, id: generateId(), createdAt: new Date().toISOString() };
  txns.push(newT);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txns));
  return newT;
}

export function deleteTransaction(id: string): void {
  const txns = getTransactions().filter(t => t.id !== id);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txns));
}

// Summaries
export function getBorrowerSummaries(): BorrowerSummary[] {
  const borrowers = getBorrowers();
  const txns = getTransactions();

  return borrowers.map(b => {
    const bTxns = txns.filter(t => t.borrowerId === b.id);
    const totalLent = bTxns.filter(t => t.type === 'lent').reduce((s, t) => s + t.amount, 0);
    const totalReceived = bTxns.filter(t => t.type === 'received').reduce((s, t) => s + t.amount, 0);
    return { ...b, totalLent, totalReceived, balance: totalLent - totalReceived };
  });
}

export function getDashboardStats() {
  const summaries = getBorrowerSummaries();
  return {
    totalLent: summaries.reduce((s, b) => s + b.totalLent, 0),
    totalReceived: summaries.reduce((s, b) => s + b.totalReceived, 0),
    totalOutstanding: summaries.reduce((s, b) => s + b.balance, 0),
    activeBorrowers: summaries.filter(b => b.balance > 0).length,
  };
}

// CSV Export
export function exportToCSV(): string {
  const summaries = getBorrowerSummaries();
  const txns = getTransactions();
  const borrowerMap = Object.fromEntries(summaries.map(b => [b.id, b.name]));

  const lines = ['Borrower,Type,Amount,Date,Time,Notes'];
  txns
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .forEach(t => {
      lines.push(
        `"${borrowerMap[t.borrowerId] || 'Unknown'}","${t.type}",${t.amount},"${t.date}","${t.time}","${(t.notes || '').replace(/"/g, '""')}"`
      );
    });
  return lines.join('\n');
}
