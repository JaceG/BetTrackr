import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Info, TrendingUp, TrendingDown, Flame, Zap, Target, BarChart3 } from 'lucide-react';

interface Entry {
  id: string;
  date: string;
  net: number;
  betAmount: number;
  winningAmount: number;
  notes?: string;
}

interface StreakAnalysisProps {
  entries: Entry[];
}

interface Streak {
  type: 'win' | 'loss' | 'push';
  count: number;
  startDate: string;
  endDate: string;
  totalNet: number;
  entries: Entry[];
}

interface StreakStats {
  currentStreak: Streak | null;
  longestWinStreak: Streak | null;
  longestLossStreak: Streak | null;
  allStreaks: Streak[];
  averageWinStreakLength: number;
  averageLossStreakLength: number;
  totalWinStreaks: number;
  totalLossStreaks: number;
  streakDistribution: { length: number; wins: number; losses: number }[];
}

function calculateStreaks(entries: Entry[]): StreakStats {
  if (entries.length === 0) {
    return {
      currentStreak: null,
      longestWinStreak: null,
      longestLossStreak: null,
      allStreaks: [],
      averageWinStreakLength: 0,
      averageLossStreakLength: 0,
      totalWinStreaks: 0,
      totalLossStreaks: 0,
      streakDistribution: [],
    };
  }

  // Sort entries by date (oldest first)
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const allStreaks: Streak[] = [];
  let currentStreakEntries: Entry[] = [];
  let currentStreakType: 'win' | 'loss' | 'push' | null = null;

  // Build streaks
  for (const entry of sortedEntries) {
    const entryType = entry.net > 0 ? 'win' : entry.net < 0 ? 'loss' : 'push';

    if (currentStreakType === null) {
      // Start first streak
      currentStreakType = entryType;
      currentStreakEntries = [entry];
    } else if (entryType === currentStreakType || entryType === 'push') {
      // Continue current streak (pushes don't break streaks)
      currentStreakEntries.push(entry);
    } else {
      // Streak broken - save current streak if it has wins/losses
      if (currentStreakEntries.length > 0 && currentStreakType !== 'push') {
        const streak: Streak = {
          type: currentStreakType,
          count: currentStreakEntries.filter(e => 
            currentStreakType === 'win' ? e.net > 0 : e.net < 0
          ).length,
          startDate: currentStreakEntries[0].date,
          endDate: currentStreakEntries[currentStreakEntries.length - 1].date,
          totalNet: currentStreakEntries.reduce((sum, e) => sum + e.net, 0),
          entries: [...currentStreakEntries],
        };
        allStreaks.push(streak);
      }
      // Start new streak
      currentStreakType = entryType;
      currentStreakEntries = [entry];
    }
  }

  // Don't forget the last streak
  if (currentStreakEntries.length > 0 && currentStreakType !== null && currentStreakType !== 'push') {
    const streak: Streak = {
      type: currentStreakType,
      count: currentStreakEntries.filter(e => 
        currentStreakType === 'win' ? e.net > 0 : e.net < 0
      ).length,
      startDate: currentStreakEntries[0].date,
      endDate: currentStreakEntries[currentStreakEntries.length - 1].date,
      totalNet: currentStreakEntries.reduce((sum, e) => sum + e.net, 0),
      entries: [...currentStreakEntries],
    };
    allStreaks.push(streak);
  }

  // Find longest streaks
  const winStreaks = allStreaks.filter((s) => s.type === 'win');
  const lossStreaks = allStreaks.filter((s) => s.type === 'loss');

  const longestWinStreak = winStreaks.length > 0
    ? winStreaks.reduce((max, s) => (s.count > max.count ? s : max), winStreaks[0])
    : null;

  const longestLossStreak = lossStreaks.length > 0
    ? lossStreaks.reduce((max, s) => (s.count > max.count ? s : max), lossStreaks[0])
    : null;

  // Calculate averages
  const averageWinStreakLength = winStreaks.length > 0
    ? winStreaks.reduce((sum, s) => sum + s.count, 0) / winStreaks.length
    : 0;

  const averageLossStreakLength = lossStreaks.length > 0
    ? lossStreaks.reduce((sum, s) => sum + s.count, 0) / lossStreaks.length
    : 0;

  // Calculate streak distribution
  const maxStreakLength = Math.max(
    ...allStreaks.map((s) => s.count),
    1
  );
  const streakDistribution: { length: number; wins: number; losses: number }[] = [];
  
  for (let i = 1; i <= Math.min(maxStreakLength, 10); i++) {
    streakDistribution.push({
      length: i,
      wins: winStreaks.filter((s) => s.count === i).length,
      losses: lossStreaks.filter((s) => s.count === i).length,
    });
  }

  // Current streak (most recent)
  const currentStreak = allStreaks.length > 0 ? allStreaks[allStreaks.length - 1] : null;

  return {
    currentStreak,
    longestWinStreak,
    longestLossStreak,
    allStreaks,
    averageWinStreakLength,
    averageLossStreakLength,
    totalWinStreaks: winStreaks.length,
    totalLossStreaks: lossStreaks.length,
    streakDistribution,
  };
}

function StreakIndicator({ streak }: { streak: Streak | null }) {
  if (!streak) {
    return (
      <div className="text-muted-foreground text-sm">No streak data</div>
    );
  }

  const isWin = streak.type === 'win';
  const Icon = isWin ? Flame : TrendingDown;
  const colorClass = isWin ? 'text-profit' : 'text-loss';
  const bgClass = isWin ? 'bg-profit/10' : 'bg-loss/10';

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bgClass}`}>
      <Icon className={`w-5 h-5 ${colorClass}`} />
      <div>
        <span className={`text-2xl font-bold ${colorClass}`}>{streak.count}</span>
        <span className={`text-sm ml-1 ${colorClass}`}>
          {isWin ? 'Win' : 'Loss'} Streak
        </span>
      </div>
    </div>
  );
}

function StreakBar({ 
  length, 
  wins, 
  losses, 
  maxCount 
}: { 
  length: number; 
  wins: number; 
  losses: number; 
  maxCount: number;
}) {
  const total = wins + losses;
  if (total === 0) return null;

  const winWidth = maxCount > 0 ? (wins / maxCount) * 100 : 0;
  const lossWidth = maxCount > 0 ? (losses / maxCount) * 100 : 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 text-right text-muted-foreground">{length}</span>
      <div className="flex-1 flex gap-0.5 h-6">
        {wins > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="bg-profit rounded-l transition-all hover:brightness-110 flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${winWidth}%`, minWidth: wins > 0 ? '24px' : '0' }}
              >
                {wins}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {wins} winning streak{wins !== 1 ? 's' : ''} of {length} bet{length !== 1 ? 's' : ''}
            </TooltipContent>
          </Tooltip>
        )}
        {losses > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="bg-loss transition-all hover:brightness-110 flex items-center justify-center text-white text-xs font-medium"
                style={{ 
                  width: `${lossWidth}%`, 
                  minWidth: losses > 0 ? '24px' : '0',
                  borderRadius: wins === 0 ? '4px 0 0 4px' : '0',
                }}
              >
                {losses}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {losses} losing streak{losses !== 1 ? 's' : ''} of {length} bet{length !== 1 ? 's' : ''}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export default function StreakAnalysis({ entries }: StreakAnalysisProps) {
  const stats = useMemo(() => calculateStreaks(entries), [entries]);

  const maxDistributionCount = useMemo(() => {
    return Math.max(
      ...stats.streakDistribution.map((d) => Math.max(d.wins, d.losses)),
      1
    );
  }, [stats.streakDistribution]);

  if (entries.length < 2) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Streak Analysis</h3>
        </div>
        <div className="text-center text-muted-foreground py-8">
          <Zap className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Add more bets to see streak patterns</p>
          <p className="text-sm">At least 2 bets are needed for streak analysis</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Streak Analysis</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
              <Info className="w-4 h-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Analyze your winning and losing patterns to understand your betting behavior.</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Current & Best Streaks */}
        <div className="space-y-4">
          {/* Current Streak */}
          <div>
            <div className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
              <Zap className="w-4 h-4" />
              Current Streak
            </div>
            <StreakIndicator streak={stats.currentStreak} />
          </div>

          {/* Record Streaks */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-profit/5 border border-profit/20">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <TrendingUp className="w-3 h-3" />
                Best Win Streak
              </div>
              {stats.longestWinStreak ? (
                <>
                  <div className="text-2xl font-bold text-profit">
                    {stats.longestWinStreak.count}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    +${stats.longestWinStreak.totalNet.toLocaleString()}
                  </div>
                </>
              ) : (
                <div className="text-lg text-muted-foreground">-</div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-loss/5 border border-loss/20">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <TrendingDown className="w-3 h-3" />
                Worst Loss Streak
              </div>
              {stats.longestLossStreak ? (
                <>
                  <div className="text-2xl font-bold text-loss">
                    {stats.longestLossStreak.count}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${stats.longestLossStreak.totalNet.toLocaleString()}
                  </div>
                </>
              ) : (
                <div className="text-lg text-muted-foreground">-</div>
              )}
            </div>
          </div>

          {/* Streak Averages */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">Avg Win Streak</div>
              <div className="text-lg font-semibold">
                {stats.averageWinStreakLength.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">
                ({stats.totalWinStreaks} total)
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">Avg Loss Streak</div>
              <div className="text-lg font-semibold">
                {stats.averageLossStreakLength.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">
                ({stats.totalLossStreaks} total)
              </div>
            </div>
          </div>
        </div>

        {/* Streak Distribution */}
        <div>
          <div className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
            <Target className="w-4 h-4" />
            Streak Length Distribution
          </div>
          <div className="space-y-1.5">
            {stats.streakDistribution.map((item) => (
              <StreakBar
                key={item.length}
                length={item.length}
                wins={item.wins}
                losses={item.losses}
                maxCount={maxDistributionCount}
              />
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-profit rounded" />
              <span>Win Streaks</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-loss rounded" />
              <span>Loss Streaks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Streaks Timeline */}
      {stats.allStreaks.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <div className="text-sm text-muted-foreground mb-3">Recent Streak History</div>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {stats.allStreaks.slice(-20).map((streak, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div
                    className={`flex-shrink-0 rounded cursor-pointer transition-transform hover:scale-110 ${
                      streak.type === 'win' ? 'bg-profit' : 'bg-loss'
                    }`}
                    style={{
                      width: `${Math.max(streak.count * 8, 16)}px`,
                      height: '24px',
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <div className="font-medium">
                      {streak.count} {streak.type === 'win' ? 'Win' : 'Loss'} Streak
                    </div>
                    <div className={streak.type === 'win' ? 'text-profit' : 'text-loss'}>
                      {streak.totalNet >= 0 ? '+' : ''}${streak.totalNet.toLocaleString()}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {new Date(streak.startDate).toLocaleDateString()}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
