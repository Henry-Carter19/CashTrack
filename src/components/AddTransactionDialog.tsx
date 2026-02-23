import { useState } from 'react';
import { addTransaction } from '@/lib/store';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Props {
  borrowerId: string;
  type: 'lent' | 'received';
  onAdded: () => void;
}

export function AddTransactionDialog({ borrowerId, type, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return;
    addTransaction({ borrowerId, type, amount: amt, date, time, notes: notes.trim(), });
    setAmount('');
    setNotes('');
    setOpen(false);
    onAdded();
  };

  const isLent = type === 'lent';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isLent ? "default" : "outline"} size="sm" className="gap-2">
          {isLent ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
          {isLent ? 'Lend Money' : 'Record Payment'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isLent ? 'Lend Money' : 'Record Repayment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input id="amount" type="number" step="0.01" min="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="txnotes">Notes</Label>
            <Textarea id="txnotes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." rows={3} />
          </div>
          <Button type="submit" className="w-full">
            {isLent ? 'Record Lending' : 'Record Payment'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
