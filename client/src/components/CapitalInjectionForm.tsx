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

interface CapitalInjectionFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (injection: { date: string; amount: number; notes: string }) => void;
}

export default function CapitalInjectionForm({
  open,
  onClose,
  onSave,
}: CapitalInjectionFormProps) {
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDate(localDateTime);
      setAmount("");
      setNotes("");
    }
  }, [open]);

  const handleSave = () => {
    if (!date || !amount || Number(amount) <= 0) return;
    
    onSave({
      date,
      amount: Number(amount),
      notes,
    });
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Capital Injection</DialogTitle>
          <DialogDescription>
            Record additional capital added to your betting account
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="injection-date">Date & Time</Label>
            <Input
              id="injection-date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-testid="input-injection-date"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="injection-amount">Amount Added</Label>
            <Input
              id="injection-amount"
              type="number"
              placeholder="How much capital are you adding?"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-mono"
              data-testid="input-injection-amount"
              min="0"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="injection-notes">Notes (Optional)</Label>
            <Textarea
              id="injection-notes"
              placeholder="Reason for capital injection..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              data-testid="input-injection-notes"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-injection">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!date || !amount || Number(amount) <= 0} data-testid="button-save-injection">
            Add Capital
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
