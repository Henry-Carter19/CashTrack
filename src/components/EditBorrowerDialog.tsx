import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBorrower } from "@/lib/store";
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
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { Borrower } from "@/types";

interface Props {
  borrower: Borrower;
}

export function EditBorrowerDialog({ borrower }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(borrower.name);
  const [phone, setPhone] = useState(borrower.phone ?? "");
  const [notes, setNotes] = useState(borrower.notes ?? "");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () =>
      updateBorrower(borrower.id, {
        name,
        phone,
        notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrowers"] });
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-muted-foreground hover:text-destructive" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Borrower</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="w-full"
          >
            {mutation.isPending ? "Updating..." : "Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}