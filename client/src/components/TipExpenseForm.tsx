import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TipExpense {
  id: string;
  date: string;
  amount: number;
  provider?: string;
  notes?: string;
}

interface TipExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (expense: { date: string; amount: number; provider: string; notes: string }) => void;
  initialData?: TipExpense;
}

export default function TipExpenseForm({
  open,
  onClose,
  onSave,
  initialData,
}: TipExpenseFormProps) {
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      if (initialData) {
        setDate(initialData.date);
        setAmount(initialData.amount.toString());
        setProvider(initialData.provider || "");
        setNotes(initialData.notes || "");
      } else {
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setDate(localDateTime);
        setAmount("");
        setProvider("");
        setNotes("");
      }
    }
  }, [open, initialData]);

  const handleSave = () => {
    if (!date || !amount) return;
    
    onSave({
      date,
      amount: Number(amount),
      provider,
      notes,
    });
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit" : "Add"} Tip Payment</DialogTitle>
          <DialogDescription>
            {initialData ? "Update" : "Record"} a payment for betting tips or services
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tip-date">Date & Time</Label>
            <Input
              id="tip-date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-testid="input-tip-date"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tip-amount">Amount</Label>
            <Input
              id="tip-amount"
              type="number"
              placeholder="How much did you pay?"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-mono"
              data-testid="input-tip-amount"
              min="0"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tip-provider">Provider (Optional)</Label>
            <Input
              id="tip-provider"
              placeholder="e.g., Premium Tips Service"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              data-testid="input-tip-provider"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tip-notes">Notes (Optional)</Label>
            <Textarea
              id="tip-notes"
              placeholder="Add notes about this payment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              data-testid="input-tip-notes"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-tip">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!date || !amount} data-testid="button-save-tip">
            Save Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
