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

interface EntryFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (entry: { date: string; net: number; notes: string }) => void;
  initialData?: {
    date: string;
    net: number;
    notes?: string;
  };
}

export default function EntryForm({
  open,
  onClose,
  onSave,
  initialData,
}: EntryFormProps) {
  const [date, setDate] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [winningAmount, setWinningAmount] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      if (initialData) {
        setDate(initialData.date);
        if (initialData.net >= 0) {
          setBetAmount("0");
          setWinningAmount(String(initialData.net));
        } else {
          setBetAmount(String(Math.abs(initialData.net)));
          setWinningAmount("0");
        }
        setNotes(initialData.notes || "");
      } else {
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setDate(localDateTime);
        setBetAmount("");
        setWinningAmount("");
        setNotes("");
      }
    }
  }, [open, initialData]);

  const netChange = betAmount && winningAmount 
    ? Number(winningAmount) - Number(betAmount)
    : null;

  const handleSave = () => {
    if (!date || !betAmount || winningAmount === "") return;
    
    onSave({
      date,
      net: Number(winningAmount) - Number(betAmount),
      notes,
    });
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Entry" : "Add New Entry"}</DialogTitle>
          <DialogDescription>
            Enter the details of your bet entry
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date & Time</Label>
            <Input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-testid="input-entry-date"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="betAmount">Bet Amount</Label>
            <Input
              id="betAmount"
              type="number"
              placeholder="How much did you wager?"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="font-mono"
              data-testid="input-entry-bet-amount"
              min="0"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="winningAmount">Winning Amount</Label>
            <Input
              id="winningAmount"
              type="number"
              placeholder="How much did you win? (0 if lost)"
              value={winningAmount}
              onChange={(e) => setWinningAmount(e.target.value)}
              className="font-mono"
              data-testid="input-entry-winning-amount"
              min="0"
              step="0.01"
            />
          </div>
          {netChange !== null && (
            <div className="p-3 rounded-md bg-muted">
              <div className="text-sm text-muted-foreground">Net Change</div>
              <div className={`text-lg font-semibold font-mono ${netChange >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="text-net-change">
                {netChange >= 0 ? '+' : ''}{netChange.toFixed(2)}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about this bet..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              data-testid="input-entry-notes"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!date || !betAmount || winningAmount === ""} data-testid="button-save">
            Save Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
