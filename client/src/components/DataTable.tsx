import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
	Pencil,
	Trash2,
	Plus,
	ChevronLeft,
	ChevronRight,
	Search,
	X,
	Filter,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
} from 'lucide-react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { SPORTS, BET_TYPES } from '@shared/schema';

interface Entry {
	id: string;
	date: string;
	betAmount?: number;
	net: number;
	running: number;
	notes?: string;
	sport?: string;
	league?: string;
	betType?: string;
}

interface DataTableProps {
	entries: Entry[];
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	onAddEntry: () => void;
}

export default function DataTable({
	entries,
	onEdit,
	onDelete,
	onAddEntry,
}: DataTableProps) {
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [groupBy, setGroupBy] = useState<'individual' | 'week' | 'month'>(
		'individual'
	);

	// Search and filter state
	const [searchQuery, setSearchQuery] = useState('');
	const [filterSport, setFilterSport] = useState<string>('');
	const [filterBetType, setFilterBetType] = useState<string>('');
	const [filterResult, setFilterResult] = useState<'all' | 'wins' | 'losses'>(
		'all'
	);

	// Sort state
	type SortColumn = 'date' | 'betAmount' | 'net' | 'running';
	const [sortColumn, setSortColumn] = useState<SortColumn>('date');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

	// Filter and sort entries
	const filteredEntries = useMemo(() => {
		// First filter
		const filtered = entries.filter((entry) => {
			// Search query filter (notes, league)
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				const matchesNotes = entry.notes?.toLowerCase().includes(query);
				const matchesLeague = entry.league
					?.toLowerCase()
					.includes(query);
				const matchesSport = entry.sport?.toLowerCase().includes(query);
				if (!matchesNotes && !matchesLeague && !matchesSport) {
					return false;
				}
			}

			// Sport filter
			if (filterSport && entry.sport !== filterSport) {
				return false;
			}

			// Bet type filter
			if (filterBetType && entry.betType !== filterBetType) {
				return false;
			}

			// Result filter
			if (filterResult === 'wins' && entry.net <= 0) {
				return false;
			}
			if (filterResult === 'losses' && entry.net >= 0) {
				return false;
			}

			return true;
		});

		// Then sort
		return [...filtered].sort((a, b) => {
			let comparison = 0;

			switch (sortColumn) {
				case 'date':
					comparison =
						new Date(a.date).getTime() - new Date(b.date).getTime();
					break;
				case 'betAmount':
					comparison = (a.betAmount || 0) - (b.betAmount || 0);
					break;
				case 'net':
					comparison = a.net - b.net;
					break;
				case 'running':
					comparison = a.running - b.running;
					break;
			}

			return sortDirection === 'asc' ? comparison : -comparison;
		});
	}, [
		entries,
		searchQuery,
		filterSport,
		filterBetType,
		filterResult,
		sortColumn,
		sortDirection,
	]);

	// Toggle sort for a column
	const handleSort = (column: SortColumn) => {
		if (sortColumn === column) {
			// Toggle direction if same column
			setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
		} else {
			// New column, default to descending for most columns, ascending for date
			setSortColumn(column);
			setSortDirection(column === 'date' ? 'desc' : 'desc');
		}
		setCurrentPage(1);
	};

	// Get sort icon for a column
	const SortIcon = ({ column }: { column: SortColumn }) => {
		if (sortColumn !== column) {
			return <ArrowUpDown className='w-4 h-4 ml-1 opacity-50' />;
		}
		return sortDirection === 'asc' ? (
			<ArrowUp className='w-4 h-4 ml-1' />
		) : (
			<ArrowDown className='w-4 h-4 ml-1' />
		);
	};

	const hasActiveFilters =
		searchQuery || filterSport || filterBetType || filterResult !== 'all';

	const clearFilters = () => {
		setSearchQuery('');
		setFilterSport('');
		setFilterBetType('');
		setFilterResult('all');
	};

	// Get unique sports and bet types from entries for filter options
	const availableSports = useMemo(() => {
		const sports = new Set(entries.map((e) => e.sport).filter(Boolean));
		return Array.from(sports) as string[];
	}, [entries]);

	const availableBetTypes = useMemo(() => {
		const types = new Set(entries.map((e) => e.betType).filter(Boolean));
		return Array.from(types) as string[];
	}, [entries]);

	useEffect(() => {
		const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
		if (currentPage > totalPages && totalPages > 0) {
			setCurrentPage(totalPages);
		}
	}, [filteredEntries.length, itemsPerPage, currentPage]);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	const getWeekKey = (dateString: string) => {
		const date = new Date(dateString);
		const year = date.getFullYear();
		const firstDayOfYear = new Date(year, 0, 1);
		const pastDaysOfYear =
			(date.getTime() - firstDayOfYear.getTime()) / 86400000;
		const weekNumber = Math.ceil(
			(pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
		);
		return `${year}-W${String(weekNumber).padStart(2, '0')}`;
	};

	const getMonthKey = (dateString: string) => {
		const date = new Date(dateString);
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
			2,
			'0'
		)}`;
	};

	const groupEntries = () => {
		if (groupBy === 'individual') {
			return filteredEntries.map((entry) => ({
				key: entry.id,
				label: formatDate(entry.date),
				entries: [entry],
				totalBet: entry.betAmount || 0,
				totalNet: entry.net,
				endBalance: entry.running,
			}));
		}

		const groups = new Map<string, Entry[]>();

		filteredEntries.forEach((entry) => {
			const key =
				groupBy === 'week'
					? getWeekKey(entry.date)
					: getMonthKey(entry.date);
			if (!groups.has(key)) {
				groups.set(key, []);
			}
			groups.get(key)!.push(entry);
		});

		return Array.from(groups.entries()).map(([key, groupEntries]) => {
			const totalBet = groupEntries.reduce(
				(sum, e) => sum + (e.betAmount || 0),
				0
			);
			const totalNet = groupEntries.reduce((sum, e) => sum + e.net, 0);
			const endBalance = groupEntries[groupEntries.length - 1].running;

			let label = '';
			if (groupBy === 'week') {
				const [year, week] = key.split('-W');
				const firstEntry = groupEntries[0];
				label = `Week ${week}, ${year} (${formatDate(
					firstEntry.date
				)})`;
			} else {
				const date = new Date(key + '-01');
				label = date.toLocaleDateString('en-US', {
					month: 'long',
					year: 'numeric',
				});
			}

			return {
				key,
				label,
				entries: groupEntries,
				totalBet,
				totalNet,
				endBalance,
			};
		});
	};

	if (entries.length === 0) {
		return (
			<Card className='p-8 sm:p-12 text-center border-dashed bg-card/50'>
				<div className='max-w-sm mx-auto space-y-4'>
					<div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto'>
						<Plus className='w-6 h-6 text-primary' />
					</div>
					<div className='space-y-2'>
						<h3 className='font-semibold text-foreground'>
							No entries yet
						</h3>
						<p className='text-sm text-muted-foreground'>
							Start tracking your betting performance by adding
							your first entry.
						</p>
					</div>
					<Button onClick={onAddEntry} className='gap-2'>
						<Plus className='w-4 h-4' />
						Add First Entry
					</Button>
				</div>
			</Card>
		);
	}

	const groupedData = groupEntries();
	const totalPages = Math.ceil(groupedData.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedGroups = groupedData.slice(startIndex, endIndex);

	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage);
	};

	const handleItemsPerPageChange = (value: string) => {
		setItemsPerPage(Number(value));
		setCurrentPage(1);
	};

	const handleGroupByChange = (value: string) => {
		setGroupBy(value as 'individual' | 'week' | 'month');
		setCurrentPage(1);
	};

	return (
		<Card className='overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm'>
			<div className='flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4'>
				<div className='space-y-0.5'>
					<h2 className='text-base sm:text-lg font-semibold'>
						Entry History
					</h2>
					<p className='text-xs text-muted-foreground'>
						{filteredEntries.length}{' '}
						{filteredEntries.length === 1 ? 'entry' : 'entries'}
						{hasActiveFilters &&
							` (filtered from ${entries.length})`}
					</p>
				</div>
				<Button
					onClick={onAddEntry}
					size='sm'
					className='gap-1.5'
					data-testid='button-add-entry-table'>
					<Plus className='w-4 h-4' />
					<span className='hidden sm:inline'>Add Entry</span>
					<span className='sm:hidden'>Add</span>
				</Button>
			</div>

			{/* Search and Filter Bar */}
			<div className='px-4 sm:px-6 pb-3 space-y-2'>
				<div className='flex gap-2'>
					{/* Search Input */}
					<div className='relative flex-1'>
						<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
						<Input
							type='search'
							placeholder='Search notes, leagues...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='pl-9 h-9'
						/>
					</div>

					{/* Filter Popover */}
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant={
									hasActiveFilters ? 'default' : 'outline'
								}
								size='sm'
								className='gap-1.5 h-9'>
								<Filter className='w-4 h-4' />
								<span className='hidden sm:inline'>
									Filters
								</span>
								{hasActiveFilters && (
									<Badge
										variant='secondary'
										className='ml-1 h-5 px-1.5 text-xs'>
										{
											[
												filterSport,
												filterBetType,
												filterResult !== 'all',
											].filter(Boolean).length
										}
									</Badge>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-72' align='end'>
							<div className='space-y-4'>
								<h4 className='font-medium text-sm'>Filters</h4>

								{/* Sport Filter */}
								<div className='space-y-1.5'>
									<label className='text-xs text-muted-foreground'>
										Sport
									</label>
									<Select
										value={filterSport || 'all'}
										onValueChange={(v) =>
											setFilterSport(v === 'all' ? '' : v)
										}>
										<SelectTrigger className='h-8'>
											<SelectValue placeholder='All sports' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='all'>
												All sports
											</SelectItem>
											{availableSports.map((sport) => (
												<SelectItem
													key={sport}
													value={sport}>
													{sport}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{/* Bet Type Filter */}
								<div className='space-y-1.5'>
									<label className='text-xs text-muted-foreground'>
										Bet Type
									</label>
									<Select
										value={filterBetType || 'all'}
										onValueChange={(v) =>
											setFilterBetType(
												v === 'all' ? '' : v
											)
										}>
										<SelectTrigger className='h-8'>
											<SelectValue placeholder='All types' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='all'>
												All types
											</SelectItem>
											{availableBetTypes.map((type) => (
												<SelectItem
													key={type}
													value={type}>
													{type}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{/* Result Filter */}
								<div className='space-y-1.5'>
									<label className='text-xs text-muted-foreground'>
										Result
									</label>
									<Select
										value={filterResult}
										onValueChange={(v) =>
											setFilterResult(
												v as 'all' | 'wins' | 'losses'
											)
										}>
										<SelectTrigger className='h-8'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='all'>
												All results
											</SelectItem>
											<SelectItem value='wins'>
												Wins only
											</SelectItem>
											<SelectItem value='losses'>
												Losses only
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{hasActiveFilters && (
									<Button
										variant='ghost'
										size='sm'
										className='w-full'
										onClick={clearFilters}>
										<X className='w-4 h-4 mr-2' />
										Clear all filters
									</Button>
								)}
							</div>
						</PopoverContent>
					</Popover>
				</div>

				{/* Active Filter Tags */}
				{hasActiveFilters && (
					<div className='flex flex-wrap gap-1.5'>
						{searchQuery && (
							<Badge variant='secondary' className='gap-1 pr-1'>
								Search: {searchQuery}
								<button
									onClick={() => setSearchQuery('')}
									className='ml-1 hover:bg-muted rounded'>
									<X className='w-3 h-3' />
								</button>
							</Badge>
						)}
						{filterSport && (
							<Badge variant='secondary' className='gap-1 pr-1'>
								{filterSport}
								<button
									onClick={() => setFilterSport('')}
									className='ml-1 hover:bg-muted rounded'>
									<X className='w-3 h-3' />
								</button>
							</Badge>
						)}
						{filterBetType && (
							<Badge variant='secondary' className='gap-1 pr-1'>
								{filterBetType}
								<button
									onClick={() => setFilterBetType('')}
									className='ml-1 hover:bg-muted rounded'>
									<X className='w-3 h-3' />
								</button>
							</Badge>
						)}
						{filterResult !== 'all' && (
							<Badge variant='secondary' className='gap-1 pr-1'>
								{filterResult === 'wins' ? 'Wins' : 'Losses'}
								<button
									onClick={() => setFilterResult('all')}
									className='ml-1 hover:bg-muted rounded'>
									<X className='w-3 h-3' />
								</button>
							</Badge>
						)}
					</div>
				)}
			</div>

			<div className='px-4 sm:px-6 pb-4 sm:pb-6'>
				{/* Mobile Sort Control */}
				<div className='sm:hidden flex items-center gap-2 mb-3'>
					<span className='text-xs text-muted-foreground'>Sort:</span>
					<Select
						value={`${sortColumn}-${sortDirection}`}
						onValueChange={(value) => {
							const [col, dir] = value.split('-') as [
								SortColumn,
								'asc' | 'desc'
							];
							setSortColumn(col);
							setSortDirection(dir);
							setCurrentPage(1);
						}}>
						<SelectTrigger className='flex-1 h-8 text-xs'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='date-desc'>
								Date (Newest)
							</SelectItem>
							<SelectItem value='date-asc'>
								Date (Oldest)
							</SelectItem>
							<SelectItem value='net-desc'>
								Net (Highest)
							</SelectItem>
							<SelectItem value='net-asc'>
								Net (Lowest)
							</SelectItem>
							<SelectItem value='betAmount-desc'>
								Bet Amount (Highest)
							</SelectItem>
							<SelectItem value='betAmount-asc'>
								Bet Amount (Lowest)
							</SelectItem>
							<SelectItem value='running-desc'>
								Balance (Highest)
							</SelectItem>
							<SelectItem value='running-asc'>
								Balance (Lowest)
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Mobile Card Layout */}
				<div className='sm:hidden space-y-3'>
					{paginatedGroups.map((group) => (
						<Card
							key={group.key}
							className='p-3'
							data-testid={`row-group-${group.key}`}>
							<div className='flex justify-between items-start mb-2'>
								<span className='text-sm font-medium'>
									{group.label}
								</span>
								{groupBy === 'individual' && (
									<div className='flex gap-1'>
										<Button
											size='icon'
											variant='ghost'
											onClick={() =>
												onEdit(group.entries[0].id)
											}
											className='min-h-[48px] min-w-[48px]'
											data-testid={`button-edit-${group.entries[0].id}`}>
											<Pencil className='w-4 h-4' />
										</Button>
										<Button
											size='icon'
											variant='ghost'
											onClick={() =>
												onDelete(group.entries[0].id)
											}
											className='min-h-[48px] min-w-[48px]'
											data-testid={`button-delete-${group.entries[0].id}`}>
											<Trash2 className='w-4 h-4 text-destructive' />
										</Button>
									</div>
								)}
							</div>
							<div className='grid grid-cols-3 gap-2'>
								<div>
									<p className='text-xs text-muted-foreground mb-0.5'>
										{groupBy === 'individual'
											? 'Bet Amount'
											: 'Total Bets'}
									</p>
									<p
										className='text-lg font-bold font-mono'
										data-testid={`text-bet-${group.key}`}>
										${group.totalBet.toLocaleString()}
									</p>
								</div>
								<div>
									<p className='text-xs text-muted-foreground mb-0.5'>
										{groupBy === 'individual'
											? 'Net Change'
											: 'Total Net'}
									</p>
									<p
										className={`text-lg font-bold font-mono ${
											group.totalNet >= 0
												? 'text-profit'
												: 'text-loss'
										}`}
										data-testid={`text-net-${group.key}`}>
										{group.totalNet >= 0 ? '+' : ''}$
										{group.totalNet.toLocaleString()}
									</p>
								</div>
								<div>
									<p className='text-xs text-muted-foreground mb-0.5'>
										{groupBy === 'individual'
											? 'Balance'
											: 'End Balance'}
									</p>
									<p
										className='text-lg font-bold font-mono'
										data-testid={`text-running-${group.key}`}>
										${group.endBalance.toLocaleString()}
									</p>
								</div>
							</div>
							{groupBy === 'individual' &&
								group.entries[0].notes && (
									<p className='text-sm text-muted-foreground mt-2 italic'>
										{group.entries[0].notes}
									</p>
								)}
							{groupBy !== 'individual' && (
								<p className='text-xs text-muted-foreground mt-2'>
									{group.entries.length}{' '}
									{group.entries.length === 1
										? 'entry'
										: 'entries'}
								</p>
							)}
						</Card>
					))}
				</div>

				{/* Desktop Table Layout */}
				<div className='hidden sm:block overflow-x-auto'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>
									{groupBy === 'individual' ? (
										<button
											onClick={() => handleSort('date')}
											className='flex items-center hover:text-foreground transition-colors'>
											Date
											<SortIcon column='date' />
										</button>
									) : (
										'Period'
									)}
								</TableHead>
								<TableHead>
									{groupBy === 'individual' ? (
										<button
											onClick={() =>
												handleSort('betAmount')
											}
											className='flex items-center hover:text-foreground transition-colors'>
											Bet Amount
											<SortIcon column='betAmount' />
										</button>
									) : (
										'Total Bets'
									)}
								</TableHead>
								<TableHead>
									{groupBy === 'individual' ? (
										<button
											onClick={() => handleSort('net')}
											className='flex items-center hover:text-foreground transition-colors'>
											Net Change
											<SortIcon column='net' />
										</button>
									) : (
										'Total Net'
									)}
								</TableHead>
								<TableHead>
									{groupBy === 'individual' ? (
										<button
											onClick={() =>
												handleSort('running')
											}
											className='flex items-center hover:text-foreground transition-colors'>
											Running Balance
											<SortIcon column='running' />
										</button>
									) : (
										'End Balance'
									)}
								</TableHead>
								<TableHead className='hidden lg:table-cell'>
									{groupBy === 'individual'
										? 'Notes'
										: 'Entries'}
								</TableHead>
								{groupBy === 'individual' && (
									<TableHead className='text-right'>
										Actions
									</TableHead>
								)}
							</TableRow>
						</TableHeader>
						<TableBody>
							{paginatedGroups.map((group) => (
								<TableRow
									key={group.key}
									data-testid={`row-group-${group.key}`}>
									<TableCell className='font-medium'>
										{group.label}
									</TableCell>
									<TableCell>
										<span
											className='font-mono font-semibold'
											data-testid={`text-bet-${group.key}`}>
											${group.totalBet.toLocaleString()}
										</span>
									</TableCell>
									<TableCell>
										<span
											className={`font-mono font-semibold ${
												group.totalNet >= 0
													? 'text-profit'
													: 'text-loss'
											}`}
											data-testid={`text-net-${group.key}`}>
											{group.totalNet >= 0 ? '+' : ''}$
											{group.totalNet.toLocaleString()}
										</span>
									</TableCell>
									<TableCell>
										<span
											className='font-mono font-semibold'
											data-testid={`text-running-${group.key}`}>
											${group.endBalance.toLocaleString()}
										</span>
									</TableCell>
									<TableCell className='hidden lg:table-cell text-muted-foreground max-w-xs truncate'>
										{groupBy === 'individual'
											? group.entries[0].notes || '—'
											: `${group.entries.length} ${
													group.entries.length === 1
														? 'entry'
														: 'entries'
											  }`}
									</TableCell>
									{groupBy === 'individual' && (
										<TableCell className='text-right'>
											<div className='flex justify-end gap-2'>
												<Button
													size='icon'
													variant='ghost'
													onClick={() =>
														onEdit(
															group.entries[0].id
														)
													}
													data-testid={`button-edit-${group.entries[0].id}`}>
													<Pencil className='w-4 h-4' />
												</Button>
												<Button
													size='icon'
													variant='ghost'
													onClick={() =>
														onDelete(
															group.entries[0].id
														)
													}
													data-testid={`button-delete-${group.entries[0].id}`}>
													<Trash2 className='w-4 h-4 text-destructive' />
												</Button>
											</div>
										</TableCell>
									)}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				{/* Pagination Controls */}
				<div className='flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-border/50'>
					<div className='flex flex-wrap items-center gap-3'>
						<div className='flex items-center gap-2'>
							<span className='text-xs text-muted-foreground'>
								Group:
							</span>
							<Select
								value={groupBy}
								onValueChange={handleGroupByChange}>
								<SelectTrigger
									className='w-28 h-8 text-xs'
									data-testid='select-group-by'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='individual'>
										Individual
									</SelectItem>
									<SelectItem value='week'>Week</SelectItem>
									<SelectItem value='month'>Month</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className='flex items-center gap-2'>
							<span className='text-xs text-muted-foreground'>
								Show:
							</span>
							<Select
								value={String(itemsPerPage)}
								onValueChange={handleItemsPerPageChange}>
								<SelectTrigger
									className='w-16 h-8 text-xs'
									data-testid='select-items-per-page'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='10'>10</SelectItem>
									<SelectItem value='25'>25</SelectItem>
									<SelectItem value='50'>50</SelectItem>
									<SelectItem value='100'>100</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className='flex items-center gap-3'>
						<span className='text-xs text-muted-foreground'>
							{currentPage} of {totalPages}
						</span>
						<div className='flex gap-1'>
							<Button
								variant='outline'
								size='icon'
								className='h-8 w-8'
								onClick={() =>
									handlePageChange(currentPage - 1)
								}
								disabled={currentPage === 1}
								data-testid='button-prev-page'
								aria-label='Previous page'>
								<ChevronLeft className='h-4 w-4' />
							</Button>
							<Button
								variant='outline'
								size='icon'
								className='h-8 w-8'
								onClick={() =>
									handlePageChange(currentPage + 1)
								}
								disabled={currentPage === totalPages}
								data-testid='button-next-page'
								aria-label='Next page'>
								<ChevronRight className='h-4 w-4' />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</Card>
	);
}
