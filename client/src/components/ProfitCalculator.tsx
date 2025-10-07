import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Entry {
  id: string;
  date: string;
  net: number;
  betAmount: number;
  winningAmount: number;
  notes?: string;
}

interface TipExpense {
  id: string;
  date: string;
  amount: number;
  provider?: string;
  notes?: string;
}

interface ProfitCalculatorProps {
  entries: Entry[];
  tipExpenses: TipExpense[];
}

const CALC_STORAGE_KEY = "bt.profitCalc.v1";

interface CalculatorSettings {
  weeklyProfitGoal: number;
  tipPricingType: "weekly" | "per-bet";
  weeklyPackagePrice: number;
  perBetTipPrice: number;
  estimatedBetsPerWeek: number;
}

export default function ProfitCalculator({ entries, tipExpenses }: ProfitCalculatorProps) {
  const [settings, setSettings] = useState<CalculatorSettings>({
    weeklyProfitGoal: 500,
    tipPricingType: "weekly",
    weeklyPackagePrice: 100,
    perBetTipPrice: 10,
    estimatedBetsPerWeek: 10,
  });

  useEffect(() => {
    const stored = localStorage.getItem(CALC_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
      } catch (e) {
        console.error("Failed to load calculator settings:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CALC_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getCurrentWeekEntries = () => {
    const now = new Date();
    const startOfWeek = getStartOfWeek(now);
    startOfWeek.setHours(0, 0, 0, 0);

    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfWeek;
    });
  };

  const getCurrentWeekTipExpenses = () => {
    const now = new Date();
    const startOfWeek = getStartOfWeek(now);
    startOfWeek.setHours(0, 0, 0, 0);

    return tipExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startOfWeek;
    });
  };

  const weekEntries = getCurrentWeekEntries();
  const weekTipExpenses = getCurrentWeekTipExpenses();
  const betsThisWeek = weekEntries.length;
  const profitThisWeek = weekEntries.reduce((sum, entry) => sum + entry.net, 0);
  const tipsSpentThisWeek = weekTipExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const calculateRequiredProfitPerBet = () => {
    const { weeklyProfitGoal, tipPricingType, weeklyPackagePrice, perBetTipPrice, estimatedBetsPerWeek } = settings;
    
    let totalTipCost = 0;
    if (tipPricingType === "weekly") {
      totalTipCost = weeklyPackagePrice;
    } else {
      totalTipCost = perBetTipPrice * estimatedBetsPerWeek;
    }

    const totalNeeded = weeklyProfitGoal + totalTipCost;
    const profitPerBet = totalNeeded / estimatedBetsPerWeek;

    return {
      totalNeeded,
      totalTipCost,
      profitPerBet,
    };
  };

  const calculateAdjustedRequired = () => {
    const { weeklyProfitGoal, tipPricingType, weeklyPackagePrice, perBetTipPrice, estimatedBetsPerWeek } = settings;
    
    let totalTipCostExpected = 0;
    if (tipPricingType === "weekly") {
      totalTipCostExpected = weeklyPackagePrice;
    } else {
      totalTipCostExpected = perBetTipPrice * estimatedBetsPerWeek;
    }

    const remainingBets = Math.max(0, estimatedBetsPerWeek - betsThisWeek);
    
    if (remainingBets === 0) {
      return {
        remainingBets: 0,
        profitNeeded: 0,
        requiredPerBet: 0,
        netAfterTips: profitThisWeek - tipsSpentThisWeek,
        shortfall: weeklyProfitGoal - (profitThisWeek - tipsSpentThisWeek),
      };
    }

    const netProfitSoFar = profitThisWeek - tipsSpentThisWeek;
    const remainingToGoal = weeklyProfitGoal - netProfitSoFar;

    let remainingTipCost = 0;
    if (tipPricingType === "weekly") {
      remainingTipCost = tipsSpentThisWeek >= weeklyPackagePrice ? 0 : (weeklyPackagePrice - tipsSpentThisWeek);
    } else {
      remainingTipCost = perBetTipPrice * remainingBets;
    }

    const totalStillNeeded = remainingToGoal + remainingTipCost;
    const requiredPerBet = totalStillNeeded / remainingBets;

    return {
      remainingBets,
      profitNeeded: totalStillNeeded,
      requiredPerBet,
      netAfterTips: netProfitSoFar,
      shortfall: remainingToGoal,
    };
  };

  const baseline = calculateRequiredProfitPerBet();
  const adjusted = calculateAdjustedRequired();

  return (
    <Card className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Profit Calculator</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="weeklyGoal" className="text-sm">Weekly Profit Goal ($)</Label>
            <Input
              id="weeklyGoal"
              type="number"
              value={settings.weeklyProfitGoal}
              onChange={(e) => setSettings({ ...settings, weeklyProfitGoal: parseFloat(e.target.value) || 0 })}
              data-testid="input-weekly-goal"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="tipType" className="text-sm">Tip Pricing Type</Label>
            <Select
              value={settings.tipPricingType}
              onValueChange={(value: "weekly" | "per-bet") => setSettings({ ...settings, tipPricingType: value })}
            >
              <SelectTrigger id="tipType" data-testid="select-tip-type" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly Package</SelectItem>
                <SelectItem value="per-bet">Per-Bet Tip</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.tipPricingType === "weekly" ? (
            <div>
              <Label htmlFor="weeklyPackage" className="text-sm">Weekly Package Price ($)</Label>
              <Input
                id="weeklyPackage"
                type="number"
                value={settings.weeklyPackagePrice}
                onChange={(e) => setSettings({ ...settings, weeklyPackagePrice: parseFloat(e.target.value) || 0 })}
                data-testid="input-weekly-package"
                className="mt-1"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="perBetTip" className="text-sm">Per-Bet Tip Price ($)</Label>
              <Input
                id="perBetTip"
                type="number"
                value={settings.perBetTipPrice}
                onChange={(e) => setSettings({ ...settings, perBetTipPrice: parseFloat(e.target.value) || 0 })}
                data-testid="input-per-bet-tip"
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label htmlFor="betsPerWeek" className="text-sm">Estimated Bets Per Week</Label>
            <Input
              id="betsPerWeek"
              type="number"
              value={settings.estimatedBetsPerWeek}
              onChange={(e) => setSettings({ ...settings, estimatedBetsPerWeek: parseInt(e.target.value) || 0 })}
              data-testid="input-bets-per-week"
              className="mt-1"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4 bg-muted/50">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Baseline Calculation
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weekly Goal:</span>
                <span className="font-mono">${settings.weeklyProfitGoal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tip Costs:</span>
                <span className="font-mono text-destructive">-${baseline.totalTipCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Total Needed:</span>
                <span className="font-mono font-bold">${baseline.totalNeeded.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1 bg-primary/10 -mx-2 px-2 py-2 rounded">
                <span className="font-semibold">Profit Per Bet:</span>
                <span className="font-mono font-bold text-primary" data-testid="text-baseline-per-bet">
                  ${baseline.profitPerBet.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          <Card className={`p-4 ${adjusted.shortfall > 0 ? 'bg-loss/10 border-loss' : 'bg-profit/10 border-profit'}`}>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              {adjusted.shortfall > 0 ? (
                <AlertCircle className="w-4 h-4 text-loss" />
              ) : (
                <TrendingUp className="w-4 h-4 text-profit" />
              )}
              This Week (Adjusted)
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bets Made:</span>
                <span className="font-mono">{betsThisWeek} / {settings.estimatedBetsPerWeek}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profit So Far:</span>
                <span className={`font-mono ${profitThisWeek >= 0 ? 'text-profit' : 'text-loss'}`}>
                  ${profitThisWeek.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tips Spent:</span>
                <span className="font-mono text-destructive">-${tipsSpentThisWeek.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Net After Tips:</span>
                <span className={`font-mono font-bold ${adjusted.netAfterTips >= 0 ? 'text-profit' : 'text-loss'}`}>
                  ${adjusted.netAfterTips.toLocaleString()}
                </span>
              </div>
              {adjusted.remainingBets > 0 && (
                <>
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Still Need:</span>
                    <span className={`font-mono ${adjusted.shortfall > 0 ? 'text-loss' : 'text-profit'}`}>
                      ${adjusted.shortfall.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 bg-background/50 -mx-2 px-2 py-2 rounded">
                    <span className="font-semibold">Required Per Bet:</span>
                    <span className={`font-mono font-bold ${adjusted.requiredPerBet > baseline.profitPerBet ? 'text-loss' : 'text-profit'}`} data-testid="text-adjusted-per-bet">
                      ${adjusted.requiredPerBet.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
              {adjusted.remainingBets === 0 && (
                <div className="pt-2 text-center">
                  <p className={`font-semibold ${adjusted.shortfall > 0 ? 'text-loss' : 'text-profit'}`}>
                    {adjusted.shortfall > 0 
                      ? `Goal missed by $${Math.abs(adjusted.shortfall).toLocaleString()}`
                      : `Goal exceeded by $${Math.abs(adjusted.shortfall).toLocaleString()}`
                    }
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          Calculator shows baseline profit needed per bet and adjusts in real-time based on this week's results. 
          {adjusted.requiredPerBet > baseline.profitPerBet && adjusted.remainingBets > 0 && 
            " Red adjusted value means you need more profit per bet to recover from losses."
          }
        </p>
      </div>
    </Card>
  );
}
