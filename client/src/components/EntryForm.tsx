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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import BankrollSelector from "@/components/BankrollSelector";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { SPORTS, BET_TYPES } from "@shared/schema";

interface EntryFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (entry: { 
    date: string; 
    net: number; 
    betAmount: number; 
    winningAmount: number; 
    notes: string; 
    bankrollId?: string;
    sport?: string;
    league?: string;
    betType?: string;
  }) => void;
  initialData?: {
    date: string;
    net: number;
    betAmount?: number;
    winningAmount?: number;
    notes?: string;
    bankrollId?: string;
    sport?: string;
    league?: string;
    betType?: string;
  };
}

export default function EntryForm({
  open,
  onClose,
  onSave,
  initialData,
}: EntryFormProps) {
  const { user } = useAuth();
  const [date, setDate] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [winningAmount, setWinningAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [bankrollId, setBankrollId] = useState<string | undefined>(undefined);
  // Category fields
  const [sport, setSport] = useState<string>("");
  const [league, setLeague] = useState("");
  const [betType, setBetType] = useState<string>("");
  const [showCategories, setShowCategories] = useState(false);

  // Check if user has active subscription for bankroll feature
  const { data: subscriptionData } = useQuery({
    queryKey: ['/api/subscription-status'],
    enabled: !!user,
  });
  const hasActiveSubscription = (subscriptionData as any)?.hasActiveSubscription || false;

  useEffect(() => {
    if (open) {
      if (initialData) {
        setDate(initialData.date);
        if (initialData.betAmount !== undefined && initialData.winningAmount !== undefined) {
          setBetAmount(String(initialData.betAmount));
          setWinningAmount(String(initialData.winningAmount));
        } else {
          if (initialData.net >= 0) {
            setBetAmount("0");
            setWinningAmount(String(initialData.net));
          } else {
            setBetAmount(String(Math.abs(initialData.net)));
            setWinningAmount("0");
          }
        }
        setNotes(initialData.notes || "");
        setBankrollId(initialData.bankrollId);
        setSport(initialData.sport || "");
        setLeague(initialData.league || "");
        setBetType(initialData.betType || "");
        // Auto-expand categories if any are set
        setShowCategories(!!(initialData.sport || initialData.league || initialData.betType));
      } else {
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setDate(localDateTime);
        setBetAmount("");
        setWinningAmount("");
        setNotes("");
        setBankrollId(undefined);
        setSport("");
        setLeague("");
        setBetType("");
        setShowCategories(false);
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
      betAmount: Number(betAmount),
      winningAmount: Number(winningAmount),
      notes,
      bankrollId,
      sport: sport || undefined,
      league: league || undefined,
      betType: betType || undefined,
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
          {hasActiveSubscription && (
            <div className="space-y-2">
              <Label>Bankroll</Label>
              <BankrollSelector
                value={bankrollId}
                onChange={setBankrollId}
              />
            </div>
          )}
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
          
          {/* Category Section */}
          <Collapsible open={showCategories} onOpenChange={setShowCategories}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                type="button"
                className="w-full justify-between px-0 hover:bg-transparent"
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {sport || betType ? `${[sport, betType].filter(Boolean).join(' · ')}` : 'Add categories (optional)'}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sport" className="text-xs">Sport</Label>
                  <Select value={sport || "none"} onValueChange={(v) => setSport(v === "none" ? "" : v)}>
                    <SelectTrigger id="sport" className="h-9">
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {SPORTS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="betType" className="text-xs">Bet Type</Label>
                  <Select value={betType || "none"} onValueChange={(v) => setBetType(v === "none" ? "" : v)}>
                    <SelectTrigger id="betType" className="h-9">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {BET_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="league" className="text-xs">League/Event (Optional)</Label>
                <Input
                  id="league"
                  placeholder="e.g., Super Bowl, Premier League"
                  value={league}
                  onChange={(e) => setLeague(e.target.value)}
                  className="h-9"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

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
