import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBorrowers,
  getTransactionsByBorrower,
  deleteBorrower,
} from "@/lib/store";
import { Transaction } from "@/types";
import { TransactionTimeline } from "@/components/TransactionTimeline";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Phone, Trash2, Wallet } from "lucide-react";
import { Pencil } from "lucide-react";
import { EditBorrowerDialog } from "@/components/EditBorrowerDialog";

function formatCurrency(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

const BorrowerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch borrower
  const { data: borrowers = [] } = useQuery({
    queryKey: ["borrowers"],
    queryFn: getBorrowers,
  });

  const borrower = borrowers.find((b) => b.id === id);

  // Fetch transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions", id],
    queryFn: () => getTransactionsByBorrower(id!),
    enabled: !!id,
  });

  // Compute totals
  const { totalLent, totalReceived, balance } = useMemo(() => {
    const lent = transactions
      .filter((t) => t.type === "lent")
      .reduce((s, t) => s + t.amount, 0);

    const received = transactions
      .filter((t) => t.type === "received")
      .reduce((s, t) => s + t.amount, 0);

    return {
      totalLent: lent,
      totalReceived: received,
      balance: lent - received,
    };
  }, [transactions]);

  // Delete borrower mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteBorrower(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrowers"] });
      navigate("/");
    },
  });

  if (!borrower) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Borrower not found</p>
          <Button variant="outline" onClick={() => navigate("/")}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  console.log("Transactions for borrower:", borrower);

  const handleDelete = () => {
    if (
      confirm(
        `Delete ${borrower.name} and all their transactions?`
      )
    ) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex items-center h-14 md:h-16 gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              Cash Track
            </h1>
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
              <h2 className="text-2xl font-bold">
                {borrower.name}
              </h2>
              {borrower.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Phone className="h-3 w-3" />
                  {borrower.phone}
                </div>
              )}
              {borrower.notes && (
                <p className="text-sm text-muted-foreground mt-1">
                  {borrower.notes}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <EditBorrowerDialog borrower={borrower} />

            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>


        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase mb-1">
                Lent
              </p>
              <p className="font-mono font-bold text-lg text-destructive">
                {formatCurrency(totalLent)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase mb-1">
                Received
              </p>
              <p className="font-mono font-bold text-lg text-primary">
                {formatCurrency(totalReceived)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase mb-1">
                Balance
              </p>
              <p
                className={`font-mono font-bold text-lg ${balance > 0
                    ? "text-warning"
                    : "text-primary"
                  }`}
              >
                {formatCurrency(balance)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <AddTransactionDialog
            borrowerId={borrower.id}
            type="lent"
          />
          <AddTransactionDialog
            borrowerId={borrower.id}
            type="received"
          />
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <h3 className="font-semibold">
            Transaction History
          </h3>
          <TransactionTimeline transactions={transactions} />
        </div>
      </main>
    </div>
  );
};

export default BorrowerPage;