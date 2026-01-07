import { useState } from 'react';
import {
	Plus,
	Upload,
	Download,
	Trash2,
	ChevronDown,
	ChevronUp,
	DollarSign,
	BarChart3,
	Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
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
	const [isExpanded, setIsExpanded] = useState(() => {
		if (typeof window === 'undefined') return false;
		return window.innerWidth >= 768;
	});

	return (
		<div className='sticky top-0 z-50'>
			{/* Glass effect background */}
			<div className='absolute inset-0 bg-background/80 backdrop-blur-xl border-b border-border/50' />
			
			<div className='relative'>
				{!isExpanded ? (
					/* Collapsed view - compact toolbar */
					<div className='max-w-7xl mx-auto px-3 py-2.5 flex items-center gap-3'>
						<Button
							size='icon'
							variant='ghost'
							onClick={() => setIsExpanded(true)}
							className='h-8 w-8 flex-shrink-0 rounded-lg'
							data-testid='button-expand-controls'>
							<ChevronDown className='w-4 h-4' />
						</Button>
						
						<div className='flex items-center gap-2 flex-shrink-0'>
							<span className='text-sm font-semibold'>Controls</span>
							{baseline !== null && (
								<span className='text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md'>
									${Math.abs(baseline).toLocaleString()}
								</span>
							)}
						</div>
						
						<div className='flex gap-1.5 ml-auto'>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										size='icon'
										onClick={onAddEntry}
										className='h-8 w-8 rounded-lg'
										data-testid='button-add-entry-mini'>
										<Plus className='w-4 h-4' />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Add bet entry</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										size='icon'
										variant='ghost'
										onClick={onAddTipExpense}
										className='h-8 w-8 rounded-lg'
										data-testid='button-add-tip-mini'>
										<DollarSign className='w-4 h-4' />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Add tip payment</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										size='icon'
										variant='ghost'
										onClick={onImportCsv}
										className='h-8 w-8 rounded-lg'
										data-testid='button-import-csv-mini'>
										<Upload className='w-4 h-4' />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Import CSV</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										size='icon'
										variant='ghost'
										onClick={onExportCsv}
										className='h-8 w-8 rounded-lg'
										data-testid='button-export-csv-mini'>
										<Download className='w-4 h-4' />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Export CSV</TooltipContent>
							</Tooltip>
						</div>
					</div>
				) : (
					/* Expanded view - full controls */
					<div className='max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4'>
						<div className='space-y-4'>
							{/* Header with collapse button */}
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<Button
										size='icon'
										variant='ghost'
										onClick={() => setIsExpanded(false)}
										className='h-8 w-8 rounded-lg'
										data-testid='button-collapse-controls'>
										<ChevronUp className='w-4 h-4' />
									</Button>
									<h2 className='text-base sm:text-lg font-semibold'>Quick Controls</h2>
								</div>
								<Button
									variant='ghost'
									size='sm'
									onClick={onClear}
									className='text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5'
									data-testid='button-clear'>
									<Trash2 className='w-3.5 h-3.5' />
									<span className='hidden sm:inline text-xs'>Clear All</span>
								</Button>
							</div>

							{/* Main controls grid */}
							<div className='grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4'>
								{/* Starting Bet Card */}
								<Card className='sm:col-span-4 p-3 sm:p-4 space-y-2 bg-card/50'>
									<Label htmlFor='baseline' className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
										Starting Bankroll
									</Label>
									<div className='relative'>
										<DollarSign className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
										<Input
											id='baseline'
											type='number'
											value={baseline !== null ? Math.abs(baseline) : ''}
											onChange={(e) => {
												const value = e.target.value;
												if (value === '') {
													onBaselineChange(null);
												} else {
													const num = Math.abs(Number(value));
													onBaselineChange(-num);
												}
											}}
											className='pl-9 font-mono text-base h-11 bg-background'
											data-testid='input-baseline'
											placeholder='600'
										/>
									</div>
								</Card>

								{/* View Mode Card */}
								<Card className='sm:col-span-4 p-3 sm:p-4 space-y-2 bg-card/50'>
									<Label className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
										Chart View
									</Label>
									<div className='flex gap-2'>
										<Button
											variant={viewMode === 'per-bet' ? 'default' : 'outline'}
											onClick={() => onViewModeChange('per-bet')}
											className='flex-1 h-11 gap-2'
											data-testid='button-view-per-bet'>
											<BarChart3 className='w-4 h-4' />
											<span className='text-sm'>Per Bet</span>
										</Button>
										<Button
											variant={viewMode === 'per-day' ? 'default' : 'outline'}
											onClick={() => onViewModeChange('per-day')}
											className='flex-1 h-11 gap-2'
											data-testid='button-view-per-day'>
											<Calendar className='w-4 h-4' />
											<span className='text-sm'>Per Day</span>
										</Button>
									</div>
								</Card>

								{/* Quick Actions Card */}
								<Card className='sm:col-span-4 p-3 sm:p-4 space-y-2 bg-card/50'>
									<Label className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
										Quick Actions
									</Label>
									<div className='flex gap-2'>
										<Button
											onClick={onAddEntry}
											className='flex-1 h-11 gap-2'
											data-testid='button-add-entry'>
											<Plus className='w-4 h-4' />
											<span className='text-sm'>Add Bet</span>
										</Button>
										<Button
											onClick={onAddTipExpense}
											variant='outline'
											className='flex-1 h-11 gap-2'
											data-testid='button-add-tip'>
											<DollarSign className='w-4 h-4' />
											<span className='text-sm'>Add Tip</span>
										</Button>
									</div>
								</Card>
							</div>

							{/* Import/Export row */}
							<div className='flex items-center justify-between pt-1'>
								<div className='flex gap-2'>
									<Button
										onClick={onImportCsv}
										variant='ghost'
										size='sm'
										className='gap-2 text-muted-foreground hover:text-foreground'
										data-testid='button-import-csv'>
										<Upload className='w-4 h-4' />
										<span className='text-sm'>Import CSV</span>
									</Button>
									<Button
										onClick={onExportCsv}
										variant='ghost'
										size='sm'
										className='gap-2 text-muted-foreground hover:text-foreground'
										data-testid='button-export-csv'>
										<Download className='w-4 h-4' />
										<span className='text-sm'>Export CSV</span>
									</Button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
