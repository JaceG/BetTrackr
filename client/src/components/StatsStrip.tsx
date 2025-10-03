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
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Balance</span>
          <Activity className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold font-mono" data-testid="text-current-balance">
          ${currentBalance.toLocaleString()}
        </p>
      </Card>

      <Card className={`p-4 space-y-2 ${isProfit ? "border-profit" : "border-loss"}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Net P/L</span>
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

      <Card className="p-4 space-y-2 border-profit">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Peak Balance</span>
          <Target className="w-4 h-4 text-profit" />
        </div>
        <p className="text-2xl font-bold font-mono text-profit" data-testid="text-peak-balance">
          ${peakBalance.toLocaleString()}
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
