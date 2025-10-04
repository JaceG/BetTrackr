import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Activity, DollarSign, Percent } from "lucide-react";

interface StatsStripProps {
  currentBalance: number;
  netPL: number;
  peakBalance: number;
  maxDrawdown: number;
  totalCapitalInvested: number;
  totalTipsPaid: number;
  trueROI: number;
}

export default function StatsStrip({
  currentBalance,
  netPL,
  peakBalance,
  maxDrawdown,
  totalCapitalInvested,
  totalTipsPaid,
  trueROI,
}: StatsStripProps) {
  const isProfit = netPL >= 0;
  const isBalancePositive = currentBalance >= 0;
  const isPeakPositive = peakBalance >= 0;
  const isROIPositive = trueROI >= 0;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
      <Card className={`p-2 sm:p-4 space-y-0.5 sm:space-y-2 ${isBalancePositive ? "border-profit" : "border-loss"}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-muted-foreground">Current Balance</span>
          {isBalancePositive ? (
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-profit" />
          ) : (
            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-loss" />
          )}
        </div>
        <p
          className={`text-base sm:text-2xl font-bold font-mono ${
            isBalancePositive ? "text-profit" : "text-loss"
          }`}
          data-testid="text-current-balance"
        >
          {isBalancePositive ? "+" : ""}${currentBalance.toLocaleString()}
        </p>
      </Card>

      <Card className={`p-2 sm:p-4 space-y-0.5 sm:space-y-2 ${isProfit ? "border-profit" : "border-loss"}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-muted-foreground">Net P/L</span>
          {isProfit ? (
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-profit" />
          ) : (
            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-loss" />
          )}
        </div>
        <p
          className={`text-base sm:text-2xl font-bold font-mono ${
            isProfit ? "text-profit" : "text-loss"
          }`}
          data-testid="text-net-pl"
        >
          {isProfit ? "+" : ""}${netPL.toLocaleString()}
        </p>
      </Card>

      <Card className={`p-2 sm:p-4 space-y-0.5 sm:space-y-2 ${isPeakPositive ? "border-profit" : "border-loss"}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-muted-foreground">Peak</span>
          {isPeakPositive ? (
            <Target className="w-3 h-3 sm:w-4 sm:h-4 text-profit" />
          ) : (
            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-loss" />
          )}
        </div>
        <p className={`text-base sm:text-2xl font-bold font-mono ${isPeakPositive ? "text-profit" : "text-loss"}`} data-testid="text-peak-balance">
          {isPeakPositive ? "" : ""}${peakBalance.toLocaleString()}
        </p>
      </Card>

      <Card className="p-2 sm:p-4 space-y-0.5 sm:space-y-2 border-loss">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-muted-foreground">Max Drawdown</span>
          <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-loss" />
        </div>
        <p className="text-base sm:text-2xl font-bold font-mono text-loss" data-testid="text-max-drawdown">
          ${maxDrawdown.toLocaleString()}
        </p>
      </Card>

      <Card className="p-2 sm:p-4 space-y-0.5 sm:space-y-2 border-muted">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-muted-foreground">Total Capital</span>
          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
        </div>
        <p className="text-base sm:text-2xl font-bold font-mono" data-testid="text-total-capital">
          ${totalCapitalInvested.toLocaleString()}
        </p>
      </Card>

      <Card className="p-2 sm:p-4 space-y-0.5 sm:space-y-2 border-loss">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-muted-foreground">Total Tips Paid</span>
          <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-loss" />
        </div>
        <p className="text-base sm:text-2xl font-bold font-mono text-loss" data-testid="text-total-tips">
          ${totalTipsPaid.toLocaleString()}
        </p>
      </Card>

      <Card className={`p-2 sm:p-4 space-y-0.5 sm:space-y-2 ${isROIPositive ? "border-profit" : "border-loss"}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-muted-foreground">True ROI</span>
          {isROIPositive ? (
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-profit" />
          ) : (
            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-loss" />
          )}
        </div>
        <p className={`text-base sm:text-2xl font-bold font-mono ${isROIPositive ? "text-profit" : "text-loss"}`} data-testid="text-true-roi">
          {isROIPositive ? "+" : ""}{trueROI.toFixed(1)}%
        </p>
      </Card>
    </div>
  );
}
