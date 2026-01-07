import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileText, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Entry {
	id: string;
	date: string;
	net: number;
	betAmount: number;
	winningAmount: number;
	notes?: string;
	sport?: string;
	league?: string;
	betType?: string;
}

interface TipExpense {
	id: string;
	date: string;
	amount: number;
	provider?: string;
	notes?: string;
}

interface PDFReportProps {
	entries: Entry[];
	tipExpenses: TipExpense[];
	baseline: number | null;
	currentBalance: number;
	totalCapitalInvested: number;
	netProfitAfterTips: number;
	peakBalance: number;
	maxDrawdown: number;
}

type ReportPeriod = 'week' | 'month' | '3months' | 'year' | 'all';

export default function PDFReport({
	entries,
	tipExpenses,
	baseline,
	currentBalance,
	totalCapitalInvested,
	netProfitAfterTips,
	peakBalance,
	maxDrawdown,
}: PDFReportProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [period, setPeriod] = useState<ReportPeriod>('month');
	const [isGenerating, setIsGenerating] = useState(false);
	const { toast } = useToast();

	const getFilteredData = (periodType: ReportPeriod) => {
		const now = new Date();
		let cutoffDate: Date | null = null;

		switch (periodType) {
			case 'week':
				cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case 'month':
				cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				break;
			case '3months':
				cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
				break;
			case 'year':
				cutoffDate = new Date(
					now.getTime() - 365 * 24 * 60 * 60 * 1000
				);
				break;
			case 'all':
			default:
				cutoffDate = null;
		}

		const filteredEntries = cutoffDate
			? entries.filter((e) => new Date(e.date) >= cutoffDate!)
			: entries;

		const filteredTips = cutoffDate
			? tipExpenses.filter((t) => new Date(t.date) >= cutoffDate!)
			: tipExpenses;

		return { filteredEntries, filteredTips };
	};

	const getPeriodLabel = (p: ReportPeriod) => {
		switch (p) {
			case 'week':
				return 'Last 7 Days';
			case 'month':
				return 'Last 30 Days';
			case '3months':
				return 'Last 3 Months';
			case 'year':
				return 'Last Year';
			case 'all':
				return 'All Time';
		}
	};

	const generatePDF = async () => {
		setIsGenerating(true);

		try {
			// Dynamically import jspdf
			const { default: jsPDF } = await import('jspdf');
			const autoTable = (await import('jspdf-autotable')).default;

			const { filteredEntries, filteredTips } = getFilteredData(period);

			// Calculate period stats
			const periodProfit = filteredEntries.reduce(
				(sum, e) => sum + e.net,
				0
			);
			const periodTips = filteredTips.reduce(
				(sum, t) => sum + t.amount,
				0
			);
			const periodWins = filteredEntries.filter((e) => e.net > 0).length;
			const periodLosses = filteredEntries.filter(
				(e) => e.net < 0
			).length;
			const periodWinRate =
				filteredEntries.length > 0
					? (periodWins / filteredEntries.length) * 100
					: 0;
			const periodNetProfit = periodProfit - periodTips;

			const doc = new jsPDF();
			const pageWidth = doc.internal.pageSize.getWidth();

			// Title
			doc.setFontSize(24);
			doc.setTextColor(16, 185, 129); // Emerald
			doc.text('Sports Betting Charts', pageWidth / 2, 20, {
				align: 'center',
			});

			// Subtitle
			doc.setFontSize(14);
			doc.setTextColor(100, 100, 100);
			doc.text(
				`Performance Report - ${getPeriodLabel(period)}`,
				pageWidth / 2,
				30,
				{ align: 'center' }
			);
			doc.text(
				`Generated: ${new Date().toLocaleDateString()}`,
				pageWidth / 2,
				38,
				{ align: 'center' }
			);

			// Summary Box
			doc.setFillColor(241, 245, 249); // Slate-100
			doc.roundedRect(14, 45, pageWidth - 28, 50, 3, 3, 'F');

			doc.setFontSize(12);
			doc.setTextColor(30, 41, 59); // Slate-800

			// Row 1
			doc.text('Net Profit:', 20, 58);
			doc.setTextColor(
				periodNetProfit >= 0 ? 16 : 239,
				periodNetProfit >= 0 ? 185 : 68,
				periodNetProfit >= 0 ? 129 : 68
			);
			doc.text(
				`${periodNetProfit >= 0 ? '+' : '-'}$${Math.abs(
					periodNetProfit
				).toLocaleString()}`,
				60,
				58
			);

			doc.setTextColor(30, 41, 59);
			doc.text('Win Rate:', 110, 58);
			doc.text(`${periodWinRate.toFixed(1)}%`, 145, 58);

			// Row 2
			doc.text('Total Bets:', 20, 70);
			doc.text(`${filteredEntries.length}`, 60, 70);

			doc.text('Record:', 110, 70);
			doc.setTextColor(16, 185, 129);
			doc.text(`${periodWins}W`, 145, 70);
			doc.setTextColor(30, 41, 59);
			doc.text(' - ', 158, 70);
			doc.setTextColor(239, 68, 68);
			doc.text(`${periodLosses}L`, 165, 70);

			// Row 3
			doc.setTextColor(30, 41, 59);
			doc.text('Betting P/L:', 20, 82);
			doc.setTextColor(
				periodProfit >= 0 ? 16 : 239,
				periodProfit >= 0 ? 185 : 68,
				periodProfit >= 0 ? 129 : 68
			);
			doc.text(
				`${periodProfit >= 0 ? '+' : '-'}$${Math.abs(
					periodProfit
				).toLocaleString()}`,
				60,
				82
			);

			doc.setTextColor(30, 41, 59);
			doc.text('Tips Paid:', 110, 82);
			doc.setTextColor(239, 68, 68);
			doc.text(`-$${periodTips.toLocaleString()}`, 145, 82);

			// Entries Table
			doc.setTextColor(30, 41, 59);
			doc.setFontSize(14);
			doc.text('Bet History', 14, 110);

			const tableData = filteredEntries
				.sort(
					(a, b) =>
						new Date(b.date).getTime() - new Date(a.date).getTime()
				)
				.slice(0, 50) // Limit to 50 most recent
				.map((entry) => [
					new Date(entry.date).toLocaleDateString(),
					entry.sport || '-',
					entry.betType || '-',
					`$${entry.betAmount.toLocaleString()}`,
					entry.net >= 0
						? `+$${entry.net.toLocaleString()}`
						: `-$${Math.abs(entry.net).toLocaleString()}`,
					entry.notes?.substring(0, 30) || '-',
				]);

			autoTable(doc, {
				startY: 115,
				head: [['Date', 'Sport', 'Type', 'Bet', 'Net', 'Notes']],
				body: tableData,
				styles: {
					fontSize: 9,
					cellPadding: 3,
				},
				headStyles: {
					fillColor: [16, 185, 129],
					textColor: 255,
					fontStyle: 'bold',
				},
				alternateRowStyles: {
					fillColor: [248, 250, 252],
				},
				columnStyles: {
					4: {
						fontStyle: 'bold',
					},
				},
				didParseCell: (data) => {
					// Color net column based on value
					if (data.column.index === 4 && data.section === 'body') {
						const value = data.cell.raw as string;
						if (value.startsWith('+')) {
							data.cell.styles.textColor = [16, 185, 129];
						} else if (value.startsWith('-')) {
							data.cell.styles.textColor = [239, 68, 68];
						}
					}
				},
			});

			// Footer
			const finalY = (doc as any).lastAutoTable.finalY || 200;
			doc.setFontSize(9);
			doc.setTextColor(150, 150, 150);
			doc.text(
				'Generated by Sports Betting Charts - sportsbettingcharts.com',
				pageWidth / 2,
				finalY + 15,
				{ align: 'center' }
			);

			// Save
			doc.save(
				`betting-report-${period}-${
					new Date().toISOString().split('T')[0]
				}.pdf`
			);

			toast({
				title: 'Report Generated!',
				description: 'Your PDF report has been downloaded.',
			});

			setIsOpen(false);
		} catch (error) {
			console.error('Error generating PDF:', error);
			toast({
				title: 'Error',
				description: 'Failed to generate PDF report.',
				variant: 'destructive',
			});
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant='outline' size='sm' className='gap-2'>
					<FileText className='w-4 h-4' />
					<span className='hidden sm:inline'>PDF Report</span>
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>Generate PDF Report</DialogTitle>
					<DialogDescription>
						Create a professional PDF summary of your betting
						performance.
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<div className='space-y-2'>
						<Label>Report Period</Label>
						<Select
							value={period}
							onValueChange={(v) => setPeriod(v as ReportPeriod)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='week'>
									Last 7 Days
								</SelectItem>
								<SelectItem value='month'>
									Last 30 Days
								</SelectItem>
								<SelectItem value='3months'>
									Last 3 Months
								</SelectItem>
								<SelectItem value='year'>Last Year</SelectItem>
								<SelectItem value='all'>All Time</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className='p-4 rounded-lg bg-muted/50 space-y-2'>
						<h4 className='font-medium text-sm'>
							Report includes:
						</h4>
						<ul className='text-sm text-muted-foreground space-y-1'>
							<li>• Performance summary with key metrics</li>
							<li>• Win/loss record and win rate</li>
							<li>• Net profit after tip expenses</li>
							<li>• Detailed bet history (up to 50 entries)</li>
						</ul>
					</div>
				</div>

				<Button
					onClick={generatePDF}
					disabled={isGenerating}
					className='w-full gap-2'>
					{isGenerating ? (
						<>
							<Loader2 className='w-4 h-4 animate-spin' />
							Generating...
						</>
					) : (
						<>
							<Download className='w-4 h-4' />
							Download PDF Report
						</>
					)}
				</Button>
			</DialogContent>
		</Dialog>
	);
}
