import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBorrowers, getTransactionsByBorrower, getBorrowerSummaries, deleteBorrower } from '@/lib/store';
import { BorrowerSummary, Transaction } from '@/types';
import { TransactionTimeline } from '@/components/TransactionTimeline';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Phone, Trash2, Wallet } from 'lucide-react';

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

const BorrowerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [borrower, setBorrower] = useState<BorrowerSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const refresh = useCallback(() => {
    if (!id) return;
    const summaries = getBorrowerSummaries();
    const found = summaries.find(b => b.id === id);
    setBorrower(found || null);
    setTransactions(getTransactionsByBorrower(id));
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);

  if (!borrower) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Borrower not found</p>
          <Button variant="outline" onClick={() => navigate('/')}>Go Back</Button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm(`Delete ${borrower.name} and all their transactions?`)) {
      deleteBorrower(borrower.id);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex items-center h-14 md:h-16 gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">LendTracker</h1>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Borrower info */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl">
              {borrower.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{borrower.name}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                {borrower.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {borrower.phone}
                  </span>
                )}
              </div>
              {borrower.notes && <p className="text-sm text-muted-foreground mt-1">{borrower.notes}</p>}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleDelete} className="text-muted-foreground hover:text-destructive shrink-0">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Lent</p>
              <p className="font-mono font-bold text-lg text-destructive">{formatCurrency(borrower.totalLent)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Received</p>
              <p className="font-mono font-bold text-lg text-primary">{formatCurrency(borrower.totalReceived)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Balance</p>
              <p className={`font-mono font-bold text-lg ${borrower.balance > 0 ? 'text-warning' : 'text-primary'}`}>{formatCurrency(borrower.balance)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <AddTransactionDialog borrowerId={borrower.id} type="lent" onAdded={refresh} />
          <AddTransactionDialog borrowerId={borrower.id} type="received" onAdded={refresh} />
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <h3 className="font-semibold">Transaction History</h3>
          <TransactionTimeline transactions={transactions} onUpdate={refresh} />
        </div>
      </main>
    </div>
  );
};

export default BorrowerPage;
