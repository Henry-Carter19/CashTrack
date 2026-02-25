import { Transaction } from "@/types";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteTransaction } from "@/lib/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Props {
  transactions: Transaction[];
}

export function TransactionTimeline({ transactions }: Props) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      // Invalidate all transaction queries (including ["transactions", borrowerId])
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
        exact: false,
      });

      // Refresh borrower summaries
      queryClient.invalidateQueries({
        queryKey: ["borrowers"],
      });
    },
    onError: (error) => {
      console.error("Delete transaction failed:", error);
    },
  });

  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((t) => {
        const isLent = t.type === "lent";

const dateObj = new Date(t.date);

// Extract year-month-day safely
const yyyy = dateObj.getFullYear();
const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
const dd = String(dateObj.getDate()).padStart(2, "0");

// Combine with stored time
const combined = new Date(`${yyyy}-${mm}-${dd}T${t.time ?? "00:00"}`);

const formattedDate = format(
  combined,
  "MMM d, yyyy • hh:mm a"
);
        console.log("Rendering transaction:", t);

        return (
          <div
            key={t.id}
            className="flex items-start gap-4 rounded-lg border bg-card p-4"
          >
            {/* Icon */}
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                isLent
                  ? "bg-destructive/10 text-destructive"
                  : "bg-accent text-accent-foreground"
              }`}
            >
              {isLent ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownLeft className="h-4 w-4" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={`font-mono font-semibold text-lg ${
                    isLent ? "text-destructive" : "text-primary"
                  }`}
                >
                  {isLent ? "-" : "+"}₹
                  {t.amount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>

                <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                  {formattedDate}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mt-0.5">
                {isLent ? "Money lent" : "Payment received"}
              </p>
            </div>

            {/* Delete Button */}
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => deleteMutation.mutate(t.id)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}