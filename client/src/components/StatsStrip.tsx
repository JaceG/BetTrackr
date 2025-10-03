import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Activity } from "lucide-react";

interface StatsStripProps {
  currentBalance: number;
  netPL: number;
  peakBalance: number;
  maxDrawdown: number;
}

export default function StatsStrip({
  currentBalance,
  netPL,
  peakBalance,
  maxDrawdown,
}: StatsStripProps) {
  const isProfit = netPL >= 0;
  const isBalancePositive = currentBalance >= 0;
  const isPeakPositive = peakBalance >= 0;
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className={`p-4 space-y-2 ${isBalancePositive ? "border-profit" : "border-loss"}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Winnings/Losses</span>
          {isBalancePositive ? (
            <TrendingUp className="w-4 h-4 text-profit" />
          ) : (
            <TrendingDown className="w-4 h-4 text-loss" />
          )}
        </div>
        <p
          className={`text-2xl font-bold font-mono ${
            isBalancePositive ? "text-profit" : "text-loss"
          }`}
          data-testid="text-current-balance"
        >
          {isBalancePositive ? "+" : ""}${currentBalance.toLocaleString()}
        </p>
      </Card>

      <Card className={`p-4 space-y-2 ${isProfit ? "border-profit" : "border-loss"}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Net P/L vs Start</span>
          {isProfit ? (
            <TrendingUp className="w-4 h-4 text-profit" />
          ) : (
            <TrendingDown className="w-4 h-4 text-loss" />
          )}
        </div>
        <p
          className={`text-2xl font-bold font-mono ${
            isProfit ? "text-profit" : "text-loss"
          }`}
          data-testid="text-net-pl"
        >
          {isProfit ? "+" : ""}${netPL.toLocaleString()}
        </p>
      </Card>

      <Card className={`p-4 space-y-2 ${isPeakPositive ? "border-profit" : "border-loss"}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Peak Balance</span>
          {isPeakPositive ? (
            <Target className="w-4 h-4 text-profit" />
          ) : (
            <TrendingDown className="w-4 h-4 text-loss" />
          )}
        </div>
        <p className={`text-2xl font-bold font-mono ${isPeakPositive ? "text-profit" : "text-loss"}`} data-testid="text-peak-balance">
          {isPeakPositive ? "" : ""}${peakBalance.toLocaleString()}
        </p>
      </Card>

      <Card className="p-4 space-y-2 border-loss">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Max Drawdown</span>
          <TrendingDown className="w-4 h-4 text-loss" />
        </div>
        <p className="text-2xl font-bold font-mono text-loss" data-testid="text-max-drawdown">
          ${maxDrawdown.toLocaleString()}
        </p>
      </Card>
    </div>
  );
}
