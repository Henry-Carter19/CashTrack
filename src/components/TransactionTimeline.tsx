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
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["borrowers"],
      });
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
      {transactions.map((t, i) => {
        const isLent = t.type === "lent";

        return (
          <div
            key={t.id}
            className="flex items-start gap-4 rounded-lg border bg-card p-4"
          >
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

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={`font-mono font-semibold text-lg ${
                    isLent
                      ? "text-destructive"
                      : "text-primary"
                  }`}
                >
                  {isLent ? "-" : "+"}₹
                  {t.amount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>

                <span className="text-xs text-muted-foreground shrink-0">
                  {format(new Date(t.date), "MMM d, yyyy")}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mt-0.5">
                {isLent
                  ? "Money lent"
                  : "Payment received"}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() =>
                deleteMutation.mutate(t.id)
              }
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