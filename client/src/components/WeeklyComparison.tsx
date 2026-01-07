import { useMemo, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { useAnimatedCounter } from '@/hooks/use-animated-counter';

const CALC_STORAGE_KEY = 'bt.profitCalc.v1';

interface Entry {
	id: string;
	date: string;
	net: number;
	betAmount: number;
	winningAmount: number;
	notes?: string;
}

interface WeeklyComparisonProps {
	entries: Entry[];
}

// Parse date string in local timezone (avoids UTC offset issues)
function parseLocalDate(dateStr: string): Date {
	if (!dateStr) return new Date();
	const [year, month, day] = dateStr.split('-').map(Number);
	if (!year || !month || !day) return new Date();
	return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function getWeekBounds(
	date: Date,
	customWeekStart?: string
): { start: Date; end: Date } {
	// If custom week start is provided, use it
	if (customWeekStart) {
		const weekStart = parseLocalDate(customWeekStart);
		const now = new Date(date);
		now.setHours(0, 0, 0, 0);

		// Find which week cycle we're in based on the custom start date
		const daysSinceStart = Math.floor(
			(now.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000)
		);
		const weekNumber = Math.floor(daysSinceStart / 7);

		const start = new Date(weekStart);
		start.setDate(start.getDate() + weekNumber * 7);

		const end = new Date(start);
		end.setDate(start.getDate() + 6);
		end.setHours(23, 59, 59, 999);

		return { start, end };
	}

	// Default: Monday-Sunday week
	const day = date.getDay();
	const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
	const start = new Date(date);
	start.setDate(diff);
	start.setHours(0, 0, 0, 0);

	const end = new Date(start);
	end.setDate(start.getDate() + 6);
	end.setHours(23, 59, 59, 999);

	return { start, end };
}

function ComparisonStat({
	label,
	thisWeek,
	lastWeek,
	isCurrency = true,
	higherIsBetter = true,
}: {
	label: string;
	thisWeek: number;
	lastWeek: number;
	isCurrency?: boolean;
	higherIsBetter?: boolean;
}) {
	const animatedThisWeek = useAnimatedCounter(thisWeek, { duration: 600 });
	const animatedLastWeek = useAnimatedCounter(lastWeek, { duration: 600 });

	const difference = thisWeek - lastWeek;
	const percentChange =
		lastWeek !== 0
			? (difference / Math.abs(lastWeek)) * 100
			: thisWeek !== 0
			? 100
			: 0;

	const isImproved = higherIsBetter ? difference > 0 : difference < 0;
	const isDeclined = higherIsBetter ? difference < 0 : difference > 0;
	const isUnchanged = difference === 0;

	const formatValue = (value: number) => {
		if (isCurrency) {
			const absValue = Math.abs(value);
			return `${value >= 0 ? '+' : '-'}$${absValue.toLocaleString()}`;
		}
		return value.toLocaleString();
	};

	return (
		<div className='space-y-2'>
			<p className='text-xs text-muted-foreground font-medium uppercase tracking-wide'>
				{label}
			</p>
			<div className='flex items-center gap-3'>
				{/* Last week value */}
				<div className='text-center min-w-[60px]'>
					<p className='text-xs text-muted-foreground mb-0.5'>Last</p>
					<p className='text-sm font-mono font-medium text-muted-foreground'>
						{isCurrency
							? `${animatedLastWeek >= 0 ? '+' : '-'}$${Math.abs(
									animatedLastWeek
							  ).toLocaleString()}`
							: animatedLastWeek}
					</p>
				</div>

				{/* Arrow */}
				<ArrowRight className='w-4 h-4 text-muted-foreground flex-shrink-0' />

				{/* This week value */}
				<div className='text-center min-w-[60px]'>
					<p className='text-xs text-muted-foreground mb-0.5'>This</p>
					<p
						className={`text-sm font-mono font-bold ${
							isCurrency
								? thisWeek >= 0
									? 'text-profit'
									: 'text-loss'
								: 'text-foreground'
						}`}>
						{isCurrency
							? `${animatedThisWeek >= 0 ? '+' : '-'}$${Math.abs(
									animatedThisWeek
							  ).toLocaleString()}`
							: animatedThisWeek}
					</p>
				</div>

				{/* Trend indicator */}
				<div
					className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
						isUnchanged
							? 'bg-muted text-muted-foreground'
							: isImproved
							? 'bg-profit/10 text-profit'
							: 'bg-loss/10 text-loss'
					}`}>
					{isUnchanged ? (
						<Minus className='w-3 h-3' />
					) : isImproved ? (
						<TrendingUp className='w-3 h-3' />
					) : (
						<TrendingDown className='w-3 h-3' />
					)}
					<span>{Math.abs(percentChange).toFixed(0)}%</span>
				</div>
			</div>
		</div>
	);
}

export default function WeeklyComparison({ entries }: WeeklyComparisonProps) {
	// Load week start date from calculator settings in localStorage
	const [weekStartDate, setWeekStartDate] = useState<string | undefined>();

	useEffect(() => {
		const loadWeekStartDate = () => {
			try {
				const stored = localStorage.getItem(CALC_STORAGE_KEY);
				if (stored) {
					const parsed = JSON.parse(stored);
					if (parsed.weekStartDate) {
						setWeekStartDate(parsed.weekStartDate);
					}
				}
			} catch (e) {
				console.error('Failed to load calculator settings:', e);
			}
		};

		loadWeekStartDate();

		// Listen for storage changes (in case user updates calculator settings)
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === CALC_STORAGE_KEY) {
				loadWeekStartDate();
			}
		};

		window.addEventListener('storage', handleStorageChange);
		return () => window.removeEventListener('storage', handleStorageChange);
	}, []);

	const { thisWeekStats, lastWeekStats } = useMemo(() => {
		const now = new Date();
		const thisWeekBounds = getWeekBounds(now, weekStartDate);

		const lastWeekDate = new Date(now);
		lastWeekDate.setDate(lastWeekDate.getDate() - 7);
		const lastWeekBounds = getWeekBounds(lastWeekDate, weekStartDate);

		const thisWeekEntries = entries.filter((e) => {
			const date = new Date(e.date);
			return date >= thisWeekBounds.start && date <= thisWeekBounds.end;
		});

		const lastWeekEntries = entries.filter((e) => {
			const date = new Date(e.date);
			return date >= lastWeekBounds.start && date <= lastWeekBounds.end;
		});

		const calcStats = (weekEntries: Entry[]) => ({
			profit: weekEntries.reduce((sum, e) => sum + e.net, 0),
			betsPlaced: weekEntries.length,
			wins: weekEntries.filter((e) => e.net > 0).length,
			losses: weekEntries.filter((e) => e.net < 0).length,
			totalWagered: weekEntries.reduce((sum, e) => sum + e.betAmount, 0),
		});

		return {
			thisWeekStats: calcStats(thisWeekEntries),
			lastWeekStats: calcStats(lastWeekEntries),
		};
	}, [entries]);

	const hasData =
		thisWeekStats.betsPlaced > 0 || lastWeekStats.betsPlaced > 0;

	if (!hasData) {
		return (
			<Card className='p-4 sm:p-6 border-dashed bg-card/50'>
				<div className='text-center text-muted-foreground'>
					<p className='text-sm'>
						No betting data from the past two weeks
					</p>
					<p className='text-xs mt-1'>
						Start tracking bets to see weekly comparisons
					</p>
				</div>
			</Card>
		);
	}

	return (
		<Card className='p-4 sm:p-6 bg-card/50 backdrop-blur-sm border-border/50'>
			<h3 className='text-sm font-semibold mb-4 flex items-center gap-2'>
				<span>Weekly Performance</span>
				<span className='text-xs font-normal text-muted-foreground'>
					This week vs last week
				</span>
			</h3>

			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
				<ComparisonStat
					label='Profit/Loss'
					thisWeek={thisWeekStats.profit}
					lastWeek={lastWeekStats.profit}
					isCurrency={true}
					higherIsBetter={true}
				/>

				<ComparisonStat
					label='Bets Placed'
					thisWeek={thisWeekStats.betsPlaced}
					lastWeek={lastWeekStats.betsPlaced}
					isCurrency={false}
					higherIsBetter={true}
				/>

				<ComparisonStat
					label='Wins'
					thisWeek={thisWeekStats.wins}
					lastWeek={lastWeekStats.wins}
					isCurrency={false}
					higherIsBetter={true}
				/>

				<ComparisonStat
					label='Total Wagered'
					thisWeek={thisWeekStats.totalWagered}
					lastWeek={lastWeekStats.totalWagered}
					isCurrency={true}
					higherIsBetter={false}
				/>
			</div>
		</Card>
	);
}
