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
  const [net, setNet] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      if (initialData) {
        setDate(initialData.date);
        setNet(String(initialData.net));
        setNotes(initialData.notes || "");
      } else {
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setDate(localDateTime);
        setNet("");
        setNotes("");
      }
    }
  }, [open, initialData]);

  const handleSave = () => {
    if (!date || !net) return;
    
    onSave({
      date,
      net: Number(net),
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
            <Label htmlFor="net">Net Change (+/-)</Label>
            <Input
              id="net"
              type="number"
              placeholder="Enter amount (e.g., 400 or -1400)"
              value={net}
              onChange={(e) => setNet(e.target.value)}
              className="font-mono"
              data-testid="input-entry-net"
            />
          </div>
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
          <Button onClick={handleSave} disabled={!date || !net} data-testid="button-save">
            Save Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
