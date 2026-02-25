import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addTransaction } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface Props {
  borrowerId: string;
  type: "lent" | "received";
}

export function AddTransactionDialog({ borrowerId, type }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const queryClient = useQueryClient();
  const isLent = type === "lent";

  const mutation = useMutation({
    mutationFn: async () => {
      const amt = parseFloat(amount);
      if (isNaN(amt) || amt <= 0) {
        throw new Error("Invalid amount");
      }

      return addTransaction({
        borrower_id: borrowerId,
        type,
        amount: amt,
        date,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions", borrowerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["borrowers"],
      });

      setAmount("");
      setOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isLent ? "default" : "outline"}
          size="sm"
          className="gap-2"
        >
          {isLent ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownLeft className="h-4 w-4" />
          )}
          {isLent ? "Lend Money" : "Record Payment"}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isLent ? "Lend Money" : "Record Repayment"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? "Recording..."
              : isLent
              ? "Record Lending"
              : "Record Payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}