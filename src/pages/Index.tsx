import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getBorrowerSummaries, exportToCSV } from '@/lib/store';
import { BorrowerSummary } from '@/types';
import { StatsCards } from '@/components/StatsCards';
import { BorrowerList } from '@/components/BorrowerList';
import { AddBorrowerDialog } from '@/components/AddBorrowerDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, Wallet } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(getDashboardStats());
  const [borrowers, setBorrowers] = useState<BorrowerSummary[]>([]);
  const [search, setSearch] = useState('');

  const refresh = useCallback(() => {
    setStats(getDashboardStats());
    setBorrowers(getBorrowerSummaries());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = borrowers.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const csv = exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lending-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">LendTracker</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleExport} className="gap-2 hidden sm:flex">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <AddBorrowerDialog onAdded={refresh} />
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        <StatsCards {...stats} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Borrowers</h2>
            <Button variant="ghost" size="sm" onClick={handleExport} className="gap-2 sm:hidden">
              <Download className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search borrowers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <BorrowerList borrowers={filtered} onSelect={(id) => navigate(`/borrower/${id}`)} />
        </div>
      </main>
    </div>
  );
};

export default Index;
