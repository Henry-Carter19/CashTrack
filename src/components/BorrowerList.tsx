import { BorrowerSummary } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, ChevronRight } from 'lucide-react';

interface Props {
  borrowers: BorrowerSummary[];
  onSelect: (id: string) => void;
}

function formatCurrency(n: number) {
  return '₹' + n.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

export function BorrowerList({ borrowers, onSelect }: Props) {
  if (borrowers.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <p className="text-lg font-medium">No borrowers yet</p>
        <p className="text-sm mt-1">Add a borrower to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {borrowers.map((b, i) => (
        <Card
          key={b.id}
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/20 animate-fade-in"
          style={{ animationDelay: `${i * 50}ms` }}
          onClick={() => onSelect(b.id)}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
              {b.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{b.name}</p>
                {b.phone && <Phone className="h-3 w-3 text-muted-foreground shrink-0" />}
              </div>
              <div className="flex gap-3 mt-0.5 text-xs text-muted-foreground">
                <span>Lent: <span className="text-destructive font-mono">{formatCurrency(b.totalLent)}</span></span>
                <span>Received: <span className="text-primary font-mono">{formatCurrency(b.totalReceived)}</span></span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className={`font-mono font-semibold ${b.balance > 0 ? 'text-warning' : 'text-primary'}`}>
                {formatCurrency(b.balance)}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">balance</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
