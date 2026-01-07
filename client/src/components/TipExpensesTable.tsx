import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Pencil,
	Trash2,
	DollarSign,
	ChevronLeft,
	ChevronRight,
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

interface TipExpense {
	id: string;
	date: string;
	amount: number;
	provider?: string;
	notes?: string;
}

interface TipExpensesTableProps {
	tipExpenses: TipExpense[];
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	onAddTipPayment: () => void;
}

export default function TipExpensesTable({
	tipExpenses,
	onEdit,
	onDelete,
	onAddTipPayment,
}: TipExpensesTableProps) {
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [groupBy, setGroupBy] = useState<'individual' | 'week' | 'month'>(
		'individual'
	);

	// Sort state
	type SortColumn = 'date' | 'amount';
	const [sortColumn, setSortColumn] = useState<SortColumn>('date');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

	// Sort tip expenses
	const sortedTipExpenses = useMemo(() => {
		return [...tipExpenses].sort((a, b) => {
			let comparison = 0;

			switch (sortColumn) {
				case 'date':
					comparison =
						new Date(a.date).getTime() - new Date(b.date).getTime();
					break;
				case 'amount':
					comparison = a.amount - b.amount;
					break;
			}

			return sortDirection === 'asc' ? comparison : -comparison;
		});
	}, [tipExpenses, sortColumn, sortDirection]);

	// Toggle sort for a column
	const handleSort = (column: SortColumn) => {
		if (sortColumn === column) {
			setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortColumn(column);
			setSortDirection('desc');
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

	useEffect(() => {
		const totalPages = Math.ceil(sortedTipExpenses.length / itemsPerPage);
		if (currentPage > totalPages && totalPages > 0) {
			setCurrentPage(totalPages);
		}
	}, [sortedTipExpenses.length, itemsPerPage, currentPage]);

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

	const groupTipExpenses = () => {
		if (groupBy === 'individual') {
			return sortedTipExpenses.map((expense) => ({
				key: expense.id,
				label: formatDate(expense.date),
				expenses: [expense],
				totalAmount: expense.amount,
			}));
		}

		const groups = new Map<string, TipExpense[]>();

		sortedTipExpenses.forEach((expense) => {
			const key =
				groupBy === 'week'
					? getWeekKey(expense.date)
					: getMonthKey(expense.date);
			if (!groups.has(key)) {
				groups.set(key, []);
			}
			groups.get(key)!.push(expense);
		});

		return Array.from(groups.entries()).map(([key, groupExpenses]) => {
			const totalAmount = groupExpenses.reduce(
				(sum, e) => sum + e.amount,
				0
			);

			let label = '';
			if (groupBy === 'week') {
				const [year, week] = key.split('-W');
				const firstExpense = groupExpenses[0];
				label = `Week ${week}, ${year} (${formatDate(
					firstExpense.date
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
				expenses: groupExpenses,
				totalAmount,
			};
		});
	};

	const totalTipExpenses = tipExpenses.reduce(
		(sum, expense) => sum + expense.amount,
		0
	);

	if (tipExpenses.length === 0) {
		return (
			<Card className='p-8 text-center'>
				<p className='text-muted-foreground'>
					No tip expenses yet. Add your first tip payment to track
					costs!
				</p>
			</Card>
		);
	}

	const groupedData = groupTipExpenses();
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
		<Card className='p-3 sm:p-4 lg:p-6'>
			<div className='flex justify-between items-center mb-3 sm:mb-4'>
				<h2 className='text-base sm:text-lg font-semibold'>
					Tip Expenses
				</h2>
				<Button
					onClick={onAddTipPayment}
					size='sm'
					data-testid='button-add-tip-table'>
					<DollarSign className='w-4 h-4 mr-2' />
					Add Tip Payment
				</Button>
			</div>

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
						<SelectItem value='date-desc'>Date (Newest)</SelectItem>
						<SelectItem value='date-asc'>Date (Oldest)</SelectItem>
						<SelectItem value='amount-desc'>
							Amount (Highest)
						</SelectItem>
						<SelectItem value='amount-asc'>
							Amount (Lowest)
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
						data-testid={`row-tip-group-${group.key}`}>
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
											onEdit(group.expenses[0].id)
										}
										data-testid={`button-edit-tip-mobile-${group.expenses[0].id}`}>
										<Pencil className='w-4 h-4' />
									</Button>
									<Button
										size='icon'
										variant='ghost'
										onClick={() =>
											onDelete(group.expenses[0].id)
										}
										data-testid={`button-delete-tip-mobile-${group.expenses[0].id}`}>
										<Trash2 className='w-4 h-4 text-destructive' />
									</Button>
								</div>
							)}
						</div>
						<div className='space-y-2'>
							<div>
								<p className='text-xs text-muted-foreground mb-0.5'>
									{groupBy === 'individual'
										? 'Amount'
										: 'Total Amount'}
								</p>
								<p
									className='text-lg font-bold font-mono text-destructive'
									data-testid={`text-amount-mobile-${group.key}`}>
									${group.totalAmount.toLocaleString()}
								</p>
							</div>
							{groupBy === 'individual' &&
								group.expenses[0].provider && (
									<div>
										<p className='text-xs text-muted-foreground mb-0.5'>
											Provider
										</p>
										<p className='text-sm'>
											{group.expenses[0].provider}
										</p>
									</div>
								)}
							{groupBy === 'individual' &&
								group.expenses[0].notes && (
									<p className='text-sm text-muted-foreground italic'>
										{group.expenses[0].notes}
									</p>
								)}
							{groupBy !== 'individual' && (
								<p className='text-xs text-muted-foreground'>
									{group.expenses.length}{' '}
									{group.expenses.length === 1
										? 'payment'
										: 'payments'}
								</p>
							)}
						</div>
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
										onClick={() => handleSort('amount')}
										className='flex items-center hover:text-foreground transition-colors'>
										Amount
										<SortIcon column='amount' />
									</button>
								) : (
									'Total Amount'
								)}
							</TableHead>
							<TableHead>
								{groupBy === 'individual'
									? 'Provider'
									: 'Payments'}
							</TableHead>
							<TableHead className='hidden lg:table-cell'>
								Notes
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
								data-testid={`row-tip-${group.key}`}>
								<TableCell className='font-medium'>
									{group.label}
								</TableCell>
								<TableCell>
									<span
										className='font-mono font-semibold text-destructive'
										data-testid={`text-amount-${group.key}`}>
										${group.totalAmount.toLocaleString()}
									</span>
								</TableCell>
								<TableCell className='text-muted-foreground'>
									{groupBy === 'individual'
										? group.expenses[0].provider || '—'
										: `${group.expenses.length} ${
												group.expenses.length === 1
													? 'payment'
													: 'payments'
										  }`}
								</TableCell>
								<TableCell className='hidden lg:table-cell text-muted-foreground max-w-xs truncate'>
									{groupBy === 'individual'
										? group.expenses[0].notes || '—'
										: '—'}
								</TableCell>
								{groupBy === 'individual' && (
									<TableCell className='text-right'>
										<div className='flex justify-end gap-2'>
											<Button
												size='icon'
												variant='ghost'
												onClick={() =>
													onEdit(group.expenses[0].id)
												}
												data-testid={`button-edit-tip-${group.expenses[0].id}`}>
												<Pencil className='w-4 h-4' />
											</Button>
											<Button
												size='icon'
												variant='ghost'
												onClick={() =>
													onDelete(
														group.expenses[0].id
													)
												}
												data-testid={`button-delete-tip-${group.expenses[0].id}`}>
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
			<div className='flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t'>
				<div className='flex flex-wrap items-center gap-3'>
					<div className='flex items-center gap-2'>
						<span className='text-sm text-muted-foreground'>
							Group by:
						</span>
						<Select
							value={groupBy}
							onValueChange={handleGroupByChange}>
							<SelectTrigger
								className='w-32'
								data-testid='select-tip-group-by'>
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
						<span className='text-sm text-muted-foreground'>
							Rows per page:
						</span>
						<Select
							value={String(itemsPerPage)}
							onValueChange={handleItemsPerPageChange}>
							<SelectTrigger
								className='w-20'
								data-testid='select-tips-per-page'>
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
				<div className='flex items-center gap-2'>
					<span className='text-sm text-muted-foreground'>
						Page {currentPage} of {totalPages} ({groupedData.length}{' '}
						{groupBy === 'individual' ? 'payments' : 'groups'})
					</span>
					<div className='flex gap-1'>
						<Button
							variant='outline'
							size='icon'
							onClick={() => handlePageChange(currentPage - 1)}
							disabled={currentPage === 1}
							data-testid='button-prev-tip-page'
							aria-label='Previous page'>
							<ChevronLeft className='h-4 w-4' />
						</Button>
						<Button
							variant='outline'
							size='icon'
							onClick={() => handlePageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
							data-testid='button-next-tip-page'
							aria-label='Next page'>
							<ChevronRight className='h-4 w-4' />
						</Button>
					</div>
				</div>
			</div>
		</Card>
	);
}
