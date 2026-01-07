import { useState } from 'react';
import {
	Plus,
	Upload,
	Download,
	Trash2,
	Info,
	ChevronDown,
	ChevronUp,
	DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';

interface ControlsProps {
	baseline: number | null;
	onBaselineChange: (value: number | null) => void;
	viewMode: 'per-bet' | 'per-day';
	onViewModeChange: (mode: 'per-bet' | 'per-day') => void;
	onAddEntry: () => void;
	onAddTipExpense: () => void;
	onImportCsv: () => void;
	onExportCsv: () => void;
	onClear: () => void;
	hasEntries: boolean;
}

export default function Controls({
	baseline,
	onBaselineChange,
	viewMode,
	onViewModeChange,
	onAddEntry,
	onAddTipExpense,
	onImportCsv,
	onExportCsv,
	onClear,
	hasEntries,
}: ControlsProps) {
	// Initialize expanded on desktop (>= 768px), collapsed on mobile
	const [isExpanded, setIsExpanded] = useState(() => {
		if (typeof window === 'undefined') return false; // SSR fallback
		return window.innerWidth >= 768; // Desktop breakpoint
	});

	return (
		<div className='sticky top-0 z-50 backdrop-blur-md bg-background/90 border-b'>
			{!isExpanded ? (
				<div className='p-2 flex items-center gap-2'>
					<Button
						size='icon'
						variant='ghost'
						onClick={() => setIsExpanded(true)}
						className='h-9 w-9 flex-shrink-0'
						data-testid='button-expand-controls'>
						<ChevronDown className='w-4 h-4' />
					</Button>
					<span className='text-sm font-semibold flex-shrink-0'>
						Betting Tracker
					</span>
					{baseline !== null && (
						<Badge
							variant='outline'
							className='text-xs font-mono flex-shrink-0'>
							${Math.abs(baseline).toLocaleString()}
						</Badge>
					)}
					<div className='flex gap-1.5 ml-auto'>
						<Button
							size='icon'
							onClick={onAddEntry}
							className='h-9 w-9'
							data-testid='button-add-entry-mini'>
							<Plus className='w-4 h-4' />
						</Button>
						<Button
							size='icon'
							variant='outline'
							onClick={onImportCsv}
							className='h-9 w-9'
							data-testid='button-import-csv-mini'>
							<Upload className='w-4 h-4' />
						</Button>
						<Button
							size='icon'
							variant='outline'
							onClick={onExportCsv}
							className='h-9 w-9'
							data-testid='button-export-csv-mini'>
							<Download className='w-4 h-4' />
						</Button>
						<Button
							size='icon'
							variant='destructive'
							onClick={onClear}
							className='h-9 w-9'
							data-testid='button-clear-mini'>
							<Trash2 className='w-4 h-4' />
						</Button>
					</div>
				</div>
			) : (
				<div className='p-2 sm:p-4'>
					<div className='max-w-7xl mx-auto space-y-2 sm:space-y-4'>
						<div className='flex items-center justify-between gap-2 sm:gap-4'>
							<div className='flex items-center gap-2'>
								<Button
									size='icon'
									variant='ghost'
									onClick={() => setIsExpanded(false)}
									className='h-8 w-8 sm:h-9 sm:w-9'
									data-testid='button-collapse-controls'>
									<ChevronUp className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
								</Button>
								<h1 className='text-lg sm:text-xl font-bold'>
									Betting Tracker
								</h1>
							</div>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										size='icon'
										variant='ghost'
										className='h-8 w-8 sm:h-9 sm:w-9'
										data-testid='button-info'>
										<Info className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p className='text-sm'>
										Track your betting balance with detailed
										analytics
									</p>
								</TooltipContent>
							</Tooltip>
						</div>

						<div className='grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4'>
							<div className='space-y-1 sm:space-y-2'>
								<Label
									htmlFor='baseline'
									className='text-xs sm:text-sm font-medium'>
									Starting Bet ($)
								</Label>
								<Input
									id='baseline'
									type='number'
									value={
										baseline !== null
											? Math.abs(baseline)
											: ''
									}
									onChange={(e) => {
										const value = e.target.value;
										if (value === '') {
											onBaselineChange(null);
										} else {
											const num = Math.abs(Number(value));
											onBaselineChange(-num);
										}
									}}
									className='font-mono text-sm sm:text-base h-9 sm:h-10'
									data-testid='input-baseline'
									placeholder='e.g., 600'
								/>
							</div>

							<div className='space-y-1 sm:space-y-2'>
								<Label className='text-xs sm:text-sm font-medium'>
									View Mode
								</Label>
								<div className='flex gap-1.5 sm:gap-2'>
									<Button
										variant={
											viewMode === 'per-bet'
												? 'default'
												: 'outline'
										}
										onClick={() =>
											onViewModeChange('per-bet')
										}
										className='flex-1 h-9 sm:h-10 text-xs sm:text-sm'
										data-testid='button-view-per-bet'>
										Per Bet
									</Button>
									<Button
										variant={
											viewMode === 'per-day'
												? 'default'
												: 'outline'
										}
										onClick={() =>
											onViewModeChange('per-day')
										}
										className='flex-1 h-9 sm:h-10 text-xs sm:text-sm'
										data-testid='button-view-per-day'>
										Per Day
									</Button>
								</div>
							</div>
						</div>

						<div className='grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2'>
							<Button
								onClick={onAddEntry}
								className='gap-1.5 sm:gap-2 col-span-2 sm:col-span-1 h-10 sm:h-11 text-sm'
								data-testid='button-add-entry'>
								<Plus className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
								<span className='sm:inline'>Add Entry</span>
							</Button>
							<Button
								onClick={onAddTipExpense}
								variant='outline'
								className='gap-1.5 sm:gap-2 col-span-2 sm:col-span-1 h-10 sm:h-11 text-sm'
								data-testid='button-add-tip'>
								<DollarSign className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
								<span className='sm:inline'>
									Add Tip Payment
								</span>
							</Button>
							<Button
								onClick={onImportCsv}
								variant='outline'
								className='gap-1.5 sm:gap-2 h-10 w-10 sm:h-11 sm:w-auto sm:px-4'
								data-testid='button-import-csv'>
								<Upload className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
								<span className='hidden sm:inline'>Import</span>
							</Button>
							<Button
								onClick={onExportCsv}
								variant='outline'
								className='gap-1.5 sm:gap-2 h-10 w-10 sm:h-11 sm:w-auto sm:px-4'
								data-testid='button-export-csv'>
								<Download className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
								<span className='hidden sm:inline'>Export</span>
							</Button>
							<Button
								onClick={onClear}
								variant='destructive'
								className='gap-1.5 sm:gap-2 col-span-2 sm:col-span-1 sm:ml-auto h-10 sm:h-11 text-sm'
								data-testid='button-clear'>
								<Trash2 className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
								<span className='sm:inline'>Clear All</span>
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
