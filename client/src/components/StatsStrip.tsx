import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, DollarSign, Info, Sparkles, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";

interface StatsStripProps {
  currentBalance: number;
  peakBalance: number;
  maxDrawdown: number;
  totalCapitalInvested: number;
  totalTipsPaid: number;
  trueProfitAfterTips: number;
  // New props for win rate and ROI
  winCount?: number;
  lossCount?: number;
}

// Animated stat card component
function AnimatedStatCard({ 
  label, 
  numericValue,
  prefix = "",
  suffix = "",
  tooltip, 
  icon: Icon, 
  isPositive, 
  isNeutral = false,
  featured = false,
  testId,
  subtitle,
}: { 
  label: string; 
  numericValue: number;
  prefix?: string;
  suffix?: string;
  tooltip: string; 
  icon: React.ElementType; 
  isPositive?: boolean; 
  isNeutral?: boolean;
  featured?: boolean;
  testId: string;
  subtitle?: string;
}) {
  const animatedValue = useAnimatedCounter(numericValue, { duration: 600 });
  
  const colorClass = isNeutral 
    ? "text-foreground" 
    : isPositive 
      ? "text-profit" 
      : "text-loss";
  
  const borderClass = isNeutral 
    ? "border-border" 
    : isPositive 
      ? "border-profit/30" 
      : "border-loss/30";

  const iconColorClass = isNeutral 
    ? "text-muted-foreground" 
    : isPositive 
      ? "text-profit" 
      : "text-loss";

  const displayValue = `${prefix}$${Math.abs(animatedValue).toLocaleString()}${suffix}`;

  if (featured) {
    return (
      <Card 
        className={`relative overflow-hidden p-3 sm:p-5 space-y-1 sm:space-y-2 
          ${isPositive ? 'border-profit/40' : 'border-loss/40'}
          ${isPositive ? 'bg-gradient-to-br from-profit/5 via-profit/[0.02] to-transparent' : 'bg-gradient-to-br from-loss/5 via-loss/[0.02] to-transparent'}
          hover-lift transition-smooth`}
      >
        <div className={`absolute inset-0 opacity-30 ${isPositive ? 'bg-gradient-to-br from-profit/10 to-transparent' : 'bg-gradient-to-br from-loss/10 to-transparent'}`} />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className={`w-3.5 h-3.5 ${iconColorClass}`} />
            <span className="text-xs sm:text-sm font-medium text-foreground">{label}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0" data-testid={`info-${testId}`}>
                  <Info className="w-3 h-3 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColorClass}`} />
        </div>
        <p
          className={`relative text-xl sm:text-3xl font-bold font-mono tracking-tight ${colorClass}`}
          data-testid={`text-${testId}`}
        >
          {displayValue}
        </p>
        {subtitle && (
          <p className="relative text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {subtitle}
          </p>
        )}
      </Card>
    );
  }

  return (
    <Card className={`p-2.5 sm:p-4 space-y-0.5 sm:space-y-2 ${borderClass} hover-lift transition-smooth`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-xs sm:text-sm text-muted-foreground">{label}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0" data-testid={`info-${testId}`}>
                <Info className="w-3 h-3 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${iconColorClass}`} />
      </div>
      <p
        className={`text-lg sm:text-2xl font-bold font-mono tracking-tight ${colorClass}`}
        data-testid={`text-${testId}`}
      >
        {displayValue}
      </p>
    </Card>
  );
}

// Mini donut chart for win rate visualization
function WinRateDonut({ winRate, wins, losses }: { winRate: number; wins: number; losses: number }) {
  const total = wins + losses;
  const circumference = 2 * Math.PI * 18; // radius = 18
  const winStroke = (winRate / 100) * circumference;
  const animatedWinRate = useAnimatedCounter(winRate, { duration: 800, decimals: 1 });
  
  if (total === 0) {
    return (
      <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20">
        <div className="text-center">
          <p className="text-lg font-bold text-muted-foreground">--</p>
          <p className="text-[10px] text-muted-foreground">No bets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
        {/* Background circle */}
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-loss/30"
        />
        {/* Win rate arc */}
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={`${winStroke} ${circumference}`}
          strokeLinecap="round"
          className="text-profit transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm sm:text-base font-bold">{animatedWinRate.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}

export default function StatsStrip({
  currentBalance,
  peakBalance,
  maxDrawdown,
  totalCapitalInvested,
  totalTipsPaid,
  trueProfitAfterTips,
  winCount = 0,
  lossCount = 0,
}: StatsStripProps) {
  const isBalancePositive = currentBalance >= 0;
  const isPeakPositive = peakBalance >= 0;
  const isTrueProfitPositive = trueProfitAfterTips >= 0;
  
  // Calculate win rate and ROI
  const totalBets = winCount + lossCount;
  const winRate = totalBets > 0 ? (winCount / totalBets) * 100 : 0;
  const roi = totalCapitalInvested > 0 
    ? ((trueProfitAfterTips / totalCapitalInvested) * 100) 
    : 0;
  const isRoiPositive = roi >= 0;
  
  // Animated ROI value
  const animatedRoi = useAnimatedCounter(Math.abs(roi), { duration: 800, decimals: 1 });
  
  return (
    <div className="space-y-3">
      {/* Top row - Featured profit + Win Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Featured stat - Net Profit After Tips */}
        <div className="lg:col-span-2">
          <AnimatedStatCard
            label="Net Profit After Tips"
            numericValue={trueProfitAfterTips}
            prefix={isTrueProfitPositive ? "+" : "-"}
            tooltip="Your actual profit after paying for tips. This is your real take-home earnings."
            icon={isTrueProfitPositive ? TrendingUp : TrendingDown}
            isPositive={isTrueProfitPositive}
            featured={true}
            testId="true-profit"
            subtitle="Your real earnings"
          />
        </div>
        
        {/* Win Rate Card with Donut */}
        <Card className="p-3 sm:p-4 border-border hover-lift transition-smooth">
          <div className="flex items-center gap-4">
            <WinRateDonut winRate={winRate} wins={winCount} losses={lossCount} />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-1">
                <span className="text-xs sm:text-sm text-muted-foreground">Win Rate</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-4 w-4 p-0" data-testid="info-win-rate">
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Percentage of winning bets out of total bets placed</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-profit font-medium">{winCount}W</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-loss font-medium">{lossCount}L</span>
              </div>
              {/* ROI inline */}
              <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                <Percent className={`w-3 h-3 ${isRoiPositive ? 'text-profit' : 'text-loss'}`} />
                <span className="text-xs text-muted-foreground">ROI:</span>
                <span className={`text-sm font-bold font-mono ${isRoiPositive ? 'text-profit' : 'text-loss'}`}>
                  {isRoiPositive ? '+' : '-'}{animatedRoi.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        <AnimatedStatCard
          label="Balance"
          numericValue={currentBalance}
          prefix={isBalancePositive ? "+" : "-"}
          tooltip="Total money you have right now after all bets"
          icon={isBalancePositive ? TrendingUp : TrendingDown}
          isPositive={isBalancePositive}
          testId="current-balance"
        />

        <AnimatedStatCard
          label="Peak"
          numericValue={peakBalance}
          tooltip="The highest balance you've reached during your betting history"
          icon={isPeakPositive ? Target : TrendingDown}
          isPositive={isPeakPositive}
          testId="peak-balance"
        />

        <AnimatedStatCard
          label="Max Drawdown"
          numericValue={Math.abs(maxDrawdown)}
          prefix="-"
          tooltip="The biggest drop from your peak balance. Shows your worst losing streak."
          icon={TrendingDown}
          isPositive={false}
          testId="max-drawdown"
        />

        <AnimatedStatCard
          label="Invested"
          numericValue={totalCapitalInvested}
          tooltip="Total money invested: starting bet plus any money you added to keep betting"
          icon={DollarSign}
          isNeutral={true}
          testId="total-capital"
        />

        <AnimatedStatCard
          label="Tips Paid"
          numericValue={totalTipsPaid}
          tooltip="Total amount paid for tip services and betting advice"
          icon={TrendingDown}
          isPositive={false}
          testId="total-tips"
        />
      </div>
    </div>
  );
}
