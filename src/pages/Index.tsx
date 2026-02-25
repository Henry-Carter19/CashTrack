import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBorrowers, getTransactionsByBorrower } from "@/lib/store";
import { BorrowerSummary } from "@/types";
import { StatsCards } from "@/components/StatsCards";
import { BorrowerList } from "@/components/BorrowerList";
import { AddBorrowerDialog } from "@/components/AddBorrowerDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Wallet } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";

const Index = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Fetch borrowers
  const { data: borrowers = [], refetch } = useQuery({
    queryKey: ["borrowers"],
    queryFn: getBorrowers,
  });

  // Fetch all transactions for each borrower
  const { data: transactions = [] } = useQuery({
    queryKey: ["all-transactions"],
    queryFn: async () => {
      const all = await Promise.all(
        borrowers.map((b) => getTransactionsByBorrower(b.id))
      );
      return all.flat();
    },
    enabled: borrowers.length > 0,
  });

  // Compute summaries
  const summaries: BorrowerSummary[] = useMemo(() => {
    return borrowers.map((b) => {
      const bTxns = transactions.filter(
        (t) => t.borrower_id === b.id
      );

      const totalLent = bTxns
        .filter((t) => t.type === "lent")
        .reduce((s, t) => s + t.amount, 0);

      const totalReceived = bTxns
        .filter((t) => t.type === "received")
        .reduce((s, t) => s + t.amount, 0);

      return {
        ...b,
        totalLent,
        totalReceived,
        balance: totalLent - totalReceived,
      };
    });
  }, [borrowers, transactions]);

  // Dashboard stats
  const stats = useMemo(() => {
    return {
      totalLent: summaries.reduce((s, b) => s + b.totalLent, 0),
      totalReceived: summaries.reduce((s, b) => s + b.totalReceived, 0),
      totalOutstanding: summaries.reduce((s, b) => s + b.balance, 0),
      activeBorrowers: summaries.filter((b) => b.balance > 0).length,
    };
  }, [summaries]);

  const filtered = summaries.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const lines = ["Borrower,Type,Amount,Date"];
    transactions.forEach((t) => {
      const borrower = borrowers.find(
        (b) => b.id === t.borrower_id
      );
      lines.push(
        `"${borrower?.name || "Unknown"}","${t.type}",${t.amount},"${t.date}"`
      );
    });

    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cashtrack-${new Date()
      .toISOString()
      .split("T")[0]}.csv`;
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
            <h1 className="text-lg font-bold tracking-tight">
              Cash Track
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="gap-2 hidden sm:flex"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>

            <AddBorrowerDialog />

            <div className="flex items-center gap-3">
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        <StatsCards {...stats} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Borrowers
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="gap-2 sm:hidden"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search borrowers..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="pl-9 bg-white/50 "
            />
          </div>

          <BorrowerList
            borrowers={filtered}
            onSelect={(id) =>
              navigate(`/borrower/${id}`)
            }
          />
        </div>
      </main>
    </div>
  );
};

export default Index;