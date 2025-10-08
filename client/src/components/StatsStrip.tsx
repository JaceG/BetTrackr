import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Activity, DollarSign, Percent, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatsStripProps {
  currentBalance: number;
  netPL: number;
  peakBalance: number;
  maxDrawdown: number;
  totalCapitalInvested: number;
  totalTipsPaid: number;
  trueProfitAfterTips: number;
}

export default function StatsStrip({
  currentBalance,
  netPL,
  peakBalance,
  maxDrawdown,
  totalCapitalInvested,
  totalTipsPaid,
  trueProfitAfterTips,
}: StatsStripProps) {
  const isProfit = netPL >= 0;
  const isBalancePositive = currentBalance >= 0;
  const isPeakPositive = peakBalance >= 0;
  const isTrueProfitPositive = trueProfitAfterTips >= 0;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
      <Card className={`p-2 sm:p-4 space-y-0.5 sm:space-y-2 ${isBalancePositive ? "border-profit" : "border-loss"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs sm:text-sm text-muted-foreground">Current Balance</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0" data-testid="info-current-balance">
                  <Info className="w-3 h-3 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Total money you have right now after all bets</p>
              </TooltipContent>
            </Tooltip>
          </div>
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
          <div className="flex items-center gap-1">
            <span className="text-xs sm:text-sm text-muted-foreground">Net P/L</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0" data-testid="info-net-pl">
                  <Info className="w-3 h-3 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Your profit/loss from betting (after recouping all capital injections) before paying tips.</p>
              </TooltipContent>
            </Tooltip>
          </div>
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
          <div className="flex items-center gap-1">
            <span className="text-xs sm:text-sm text-muted-foreground">Peak</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0" data-testid="info-peak">
                  <Info className="w-3 h-3 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>The highest balance you've reached during your betting history</p>
              </TooltipContent>
            </Tooltip>
          </div>
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
          <div className="flex items-center gap-1">
            <span className="text-xs sm:text-sm text-muted-foreground">Max Drawdown</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0" data-testid="info-max-drawdown">
                  <Info className="w-3 h-3 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>The biggest drop from your peak balance. Shows your worst losing streak.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-loss" />
        </div>
        <p className="text-base sm:text-2xl font-bold font-mono text-loss" data-testid="text-max-drawdown">
          ${maxDrawdown.toLocaleString()}
        </p>
      </Card>

      <Card className="p-2 sm:p-4 space-y-0.5 sm:space-y-2 border-muted">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs sm:text-sm text-muted-foreground">Total Capital</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0" data-testid="info-total-capital">
                  <Info className="w-3 h-3 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Total money invested: starting bet plus any money you added to keep betting</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
        </div>
        <p className="text-base sm:text-2xl font-bold font-mono" data-testid="text-total-capital">
          ${totalCapitalInvested.toLocaleString()}
        </p>
      </Card>

      <Card className="p-2 sm:p-4 space-y-0.5 sm:space-y-2 border-loss">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs sm:text-sm text-muted-foreground">Total Tips Paid</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0" data-testid="info-total-tips">
                  <Info className="w-3 h-3 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Total amount paid for tip services and betting advice</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-loss" />
        </div>
        <p className="text-base sm:text-2xl font-bold font-mono text-loss" data-testid="text-total-tips">
          ${totalTipsPaid.toLocaleString()}
        </p>
      </Card>

      <Card className={`p-2 sm:p-4 space-y-0.5 sm:space-y-2 ${isTrueProfitPositive ? "border-profit" : "border-loss"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs sm:text-sm text-muted-foreground">Net Profit After Tips</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0" data-testid="info-net-profit">
                  <Info className="w-3 h-3 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Your actual profit after paying for tips. This is your real take-home earnings.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          {isTrueProfitPositive ? (
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-profit" />
          ) : (
            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-loss" />
          )}
        </div>
        <p className={`text-base sm:text-2xl font-bold font-mono ${isTrueProfitPositive ? "text-profit" : "text-loss"}`} data-testid="text-true-profit">
          {isTrueProfitPositive ? "+" : ""}${trueProfitAfterTips.toLocaleString()}
        </p>
      </Card>
    </div>
  );
}
