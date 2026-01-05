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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, FileSpreadsheet, Calculator, Loader2 } from 'lucide-react';
import Papa from 'papaparse';

interface Entry {
  id: string;
  date: string;
  net: number;
  betAmount: number;
  winningAmount: number;
  notes?: string;
  bankrollId?: string;
}

interface TipExpense {
  id: string;
  date: string;
  amount: number;
  provider?: string;
  notes?: string;
}

interface Bankroll {
  id: string;
  name: string;
  color: string;
  baseline: number;
}

interface AdvancedExportProps {
  entries: Entry[];
  tipExpenses: TipExpense[];
  bankrolls?: Bankroll[];
  baseline: number | null;
  currentBalance: number;
  totalCapitalInvested: number;
  netProfitAfterTips: number;
  peakBalance: number;
  maxDrawdown: number;
}

type ExportFormat = 'pdf' | 'excel' | 'tax';
type DateRange = 'all' | 'ytd' | 'q1' | 'q2' | 'q3' | 'q4' | 'custom';

interface ExportOptions {
  format: ExportFormat;
  dateRange: DateRange;
  includeSummary: boolean;
  includeCharts: boolean;
  includeTips: boolean;
  groupByBankroll: boolean;
}

export default function AdvancedExport({
  entries,
  tipExpenses,
  bankrolls = [],
  baseline,
  currentBalance,
  totalCapitalInvested,
  netProfitAfterTips,
  peakBalance,
  maxDrawdown,
}: AdvancedExportProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    dateRange: 'all',
    includeSummary: true,
    includeCharts: false,
    includeTips: true,
    groupByBankroll: false,
  });

  const getDateRangeFilter = (range: DateRange): { start: Date; end: Date } => {
    const now = new Date();
    const year = now.getFullYear();
    
    switch (range) {
      case 'ytd':
        return { start: new Date(year, 0, 1), end: now };
      case 'q1':
        return { start: new Date(year, 0, 1), end: new Date(year, 2, 31) };
      case 'q2':
        return { start: new Date(year, 3, 1), end: new Date(year, 5, 30) };
      case 'q3':
        return { start: new Date(year, 6, 1), end: new Date(year, 8, 30) };
      case 'q4':
        return { start: new Date(year, 9, 1), end: new Date(year, 11, 31) };
      default:
        return { start: new Date(0), end: now };
    }
  };

  const filterByDateRange = <T extends { date: string }>(items: T[]): T[] => {
    if (options.dateRange === 'all') return items;
    const { start, end } = getDateRangeFilter(options.dateRange);
    return items.filter((item) => {
      const date = new Date(item.date);
      return date >= start && date <= end;
    });
  };

  const calculateStats = (filteredEntries: Entry[]) => {
    const totalBets = filteredEntries.length;
    const winningBets = filteredEntries.filter((e) => e.net > 0).length;
    const losingBets = filteredEntries.filter((e) => e.net < 0).length;
    const pushBets = filteredEntries.filter((e) => e.net === 0).length;
    const totalWagered = filteredEntries.reduce((sum, e) => sum + e.betAmount, 0);
    const totalWon = filteredEntries.reduce((sum, e) => sum + (e.net > 0 ? e.winningAmount : 0), 0);
    const totalLost = filteredEntries.reduce((sum, e) => sum + (e.net < 0 ? e.betAmount : 0), 0);
    const netProfit = filteredEntries.reduce((sum, e) => sum + e.net, 0);
    const winRate = totalBets > 0 ? (winningBets / totalBets) * 100 : 0;
    const avgBetSize = totalBets > 0 ? totalWagered / totalBets : 0;
    const roi = totalWagered > 0 ? (netProfit / totalWagered) * 100 : 0;

    return {
      totalBets,
      winningBets,
      losingBets,
      pushBets,
      totalWagered,
      totalWon,
      totalLost,
      netProfit,
      winRate,
      avgBetSize,
      roi,
    };
  };

  const generatePDFContent = (filteredEntries: Entry[], filteredTips: TipExpense[]) => {
    const stats = calculateStats(filteredEntries);
    const dateRangeLabel = options.dateRange === 'all' ? 'All Time' : options.dateRange.toUpperCase();
    const generatedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Create HTML content for PDF
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>BetTrackr Report - ${dateRangeLabel}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a1a; }
          h1 { color: #10b981; margin-bottom: 5px; }
          .subtitle { color: #666; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 18px; font-weight: 600; margin-bottom: 15px; border-bottom: 2px solid #10b981; padding-bottom: 5px; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
          .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; }
          .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
          .stat-value { font-size: 24px; font-weight: 700; }
          .profit { color: #10b981; }
          .loss { color: #ef4444; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
          td { padding: 8px 10px; border-bottom: 1px solid #eee; }
          tr:nth-child(even) { background: #fafafa; }
          .text-right { text-align: right; }
          .footer { margin-top: 40px; text-align: center; color: #999; font-size: 11px; }
        </style>
      </head>
      <body>
        <h1>BetTrackr Report</h1>
        <p class="subtitle">Period: ${dateRangeLabel} | Generated: ${generatedDate}</p>
    `;

    if (options.includeSummary) {
      html += `
        <div class="section">
          <h2 class="section-title">Performance Summary</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Bets</div>
              <div class="stat-value">${stats.totalBets}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Win Rate</div>
              <div class="stat-value">${stats.winRate.toFixed(1)}%</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Net Profit</div>
              <div class="stat-value ${stats.netProfit >= 0 ? 'profit' : 'loss'}">
                ${stats.netProfit >= 0 ? '+' : ''}$${stats.netProfit.toLocaleString()}
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Wagered</div>
              <div class="stat-value">$${stats.totalWagered.toLocaleString()}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">ROI</div>
              <div class="stat-value ${stats.roi >= 0 ? 'profit' : 'loss'}">${stats.roi.toFixed(2)}%</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Avg Bet Size</div>
              <div class="stat-value">$${stats.avgBetSize.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Win/Loss Breakdown</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Wins</div>
              <div class="stat-value profit">${stats.winningBets}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Losses</div>
              <div class="stat-value loss">${stats.losingBets}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Pushes</div>
              <div class="stat-value">${stats.pushBets}</div>
            </div>
          </div>
        </div>
      `;
    }

    // Transaction history
    html += `
      <div class="section">
        <h2 class="section-title">Transaction History</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th class="text-right">Wager</th>
              <th class="text-right">Won</th>
              <th class="text-right">Net</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
    `;

    filteredEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach((entry) => {
        const date = new Date(entry.date).toLocaleDateString();
        const netClass = entry.net >= 0 ? 'profit' : 'loss';
        html += `
          <tr>
            <td>${date}</td>
            <td class="text-right">$${entry.betAmount.toLocaleString()}</td>
            <td class="text-right">$${entry.winningAmount.toLocaleString()}</td>
            <td class="text-right ${netClass}">${entry.net >= 0 ? '+' : ''}$${entry.net.toLocaleString()}</td>
            <td>${entry.notes || '-'}</td>
          </tr>
        `;
      });

    html += `
          </tbody>
        </table>
      </div>
    `;

    if (options.includeTips && filteredTips.length > 0) {
      const totalTips = filteredTips.reduce((sum, t) => sum + t.amount, 0);
      html += `
        <div class="section">
          <h2 class="section-title">Tip Expenses</h2>
          <p style="margin-bottom: 15px;">Total Tips Paid: <strong class="loss">$${totalTips.toLocaleString()}</strong></p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Provider</th>
                <th class="text-right">Amount</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
      `;

      filteredTips
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .forEach((tip) => {
          const date = new Date(tip.date).toLocaleDateString();
          html += `
            <tr>
              <td>${date}</td>
              <td>${tip.provider || '-'}</td>
              <td class="text-right loss">$${tip.amount.toLocaleString()}</td>
              <td>${tip.notes || '-'}</td>
            </tr>
          `;
        });

      html += `
            </tbody>
          </table>
        </div>
      `;
    }

    html += `
        <div class="footer">
          <p>Generated by BetTrackr | ${generatedDate}</p>
        </div>
      </body>
      </html>
    `;

    return html;
  };

  const exportPDF = async () => {
    const filteredEntries = filterByDateRange(entries);
    const filteredTips = options.includeTips ? filterByDateRange(tipExpenses) : [];
    const htmlContent = generatePDFContent(filteredEntries, filteredTips);

    // Open in new window for printing/saving as PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then trigger print
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const exportExcel = async () => {
    const filteredEntries = filterByDateRange(entries);
    const filteredTips = options.includeTips ? filterByDateRange(tipExpenses) : [];
    const stats = calculateStats(filteredEntries);

    // Create multiple sheets worth of data in CSV format
    // Sheet 1: Summary
    const summaryData = [
      ['BetTrackr Export - Summary'],
      ['Generated', new Date().toISOString()],
      [''],
      ['Performance Summary'],
      ['Total Bets', stats.totalBets],
      ['Winning Bets', stats.winningBets],
      ['Losing Bets', stats.losingBets],
      ['Push Bets', stats.pushBets],
      ['Win Rate', `${stats.winRate.toFixed(2)}%`],
      [''],
      ['Financial Summary'],
      ['Total Wagered', stats.totalWagered],
      ['Net Profit/Loss', stats.netProfit],
      ['ROI', `${stats.roi.toFixed(2)}%`],
      ['Average Bet Size', stats.avgBetSize.toFixed(2)],
      ['Starting Balance', baseline || 0],
      ['Current Balance', currentBalance],
      ['Peak Balance', peakBalance],
      ['Max Drawdown', maxDrawdown],
    ];

    // Sheet 2: Transactions
    const transactionHeaders = ['Date', 'Bet Amount', 'Winning Amount', 'Net P/L', 'Result', 'Notes', 'Bankroll'];
    const transactionData = filteredEntries
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((entry) => {
        const bankroll = bankrolls.find((b) => b.id === entry.bankrollId);
        const result = entry.net > 0 ? 'WIN' : entry.net < 0 ? 'LOSS' : 'PUSH';
        return [
          new Date(entry.date).toISOString().split('T')[0],
          entry.betAmount,
          entry.winningAmount,
          entry.net,
          result,
          entry.notes || '',
          bankroll?.name || 'General',
        ];
      });

    // Sheet 3: Tips (if included)
    let tipData: (string | number)[][] = [];
    if (options.includeTips && filteredTips.length > 0) {
      tipData = [
        ['Tip Expenses'],
        ['Date', 'Provider', 'Amount', 'Notes'],
        ...filteredTips.map((tip) => [
          new Date(tip.date).toISOString().split('T')[0],
          tip.provider || '',
          tip.amount,
          tip.notes || '',
        ]),
      ];
    }

    // Combine into single CSV with sections
    const allData = [
      ...summaryData,
      [''],
      [''],
      ['Transaction History'],
      transactionHeaders,
      ...transactionData,
    ];

    if (tipData.length > 0) {
      allData.push([''], [''], ...tipData);
    }

    const csv = Papa.unparse(allData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bettrackr-report-${options.dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportTaxReport = async () => {
    const filteredEntries = filterByDateRange(entries);
    const filteredTips = filterByDateRange(tipExpenses);
    const stats = calculateStats(filteredEntries);
    const year = new Date().getFullYear();

    // Group by month for tax purposes
    const monthlyData = new Map<string, { wagered: number; won: number; net: number }>();
    
    filteredEntries.forEach((entry) => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyData.get(monthKey) || { wagered: 0, won: 0, net: 0 };
      monthlyData.set(monthKey, {
        wagered: existing.wagered + entry.betAmount,
        won: existing.won + entry.winningAmount,
        net: existing.net + entry.net,
      });
    });

    // Sort months
    const sortedMonths = Array.from(monthlyData.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    // Create tax-ready report
    const taxData = [
      ['GAMBLING INCOME/LOSS REPORT'],
      ['Tax Year', year],
      ['Generated', new Date().toISOString()],
      [''],
      ['IMPORTANT: This report is for informational purposes only.'],
      ['Consult a tax professional for advice on your specific situation.'],
      [''],
      [''],
      ['ANNUAL SUMMARY'],
      ['Description', 'Amount'],
      ['Total Gambling Winnings (Gross)', stats.totalWon > 0 ? stats.totalWon : 0],
      ['Total Wagers Placed', stats.totalWagered],
      ['Net Gambling Income/Loss', stats.netProfit],
      ['Total Tip Service Expenses', filteredTips.reduce((sum, t) => sum + t.amount, 0)],
      [''],
      [''],
      ['MONTHLY BREAKDOWN'],
      ['Month', 'Total Wagered', 'Total Won', 'Net Profit/Loss'],
      ...sortedMonths.map(([month, data]) => {
        const [y, m] = month.split('-');
        const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
        return [monthName, data.wagered, data.won, data.net];
      }),
      [''],
      [''],
      ['SESSION DETAILS'],
      ['Date', 'Session Wager', 'Session Winnings', 'Session Net', 'Notes'],
      ...filteredEntries
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((entry) => [
          new Date(entry.date).toISOString().split('T')[0],
          entry.betAmount,
          entry.winningAmount,
          entry.net,
          entry.notes || '',
        ]),
    ];

    if (filteredTips.length > 0) {
      taxData.push(
        [''],
        [''],
        ['GAMBLING-RELATED EXPENSES'],
        ['These may be deductible if you itemize. Consult a tax professional.'],
        ['Date', 'Description', 'Amount'],
        ...filteredTips.map((tip) => [
          new Date(tip.date).toISOString().split('T')[0],
          `Tip service - ${tip.provider || 'Unknown provider'}`,
          tip.amount,
        ])
      );
    }

    const csv = Papa.unparse(taxData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bettrackr-tax-report-${year}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      switch (options.format) {
        case 'pdf':
          await exportPDF();
          break;
        case 'excel':
          await exportExcel();
          break;
        case 'tax':
          await exportTaxReport();
          break;
      }
      toast({
        title: 'Export Complete',
        description: `Your ${options.format.toUpperCase()} report has been generated.`,
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'There was an error generating your report.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Advanced Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Advanced Export</DialogTitle>
          <DialogDescription>
            Generate detailed reports in various formats for analysis or tax purposes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Export Format */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={options.format === 'pdf' ? 'default' : 'outline'}
                className="flex flex-col items-center gap-1 h-auto py-3"
                onClick={() => setOptions({ ...options, format: 'pdf' })}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs">PDF Report</span>
              </Button>
              <Button
                type="button"
                variant={options.format === 'excel' ? 'default' : 'outline'}
                className="flex flex-col items-center gap-1 h-auto py-3"
                onClick={() => setOptions({ ...options, format: 'excel' })}
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span className="text-xs">Excel/CSV</span>
              </Button>
              <Button
                type="button"
                variant={options.format === 'tax' ? 'default' : 'outline'}
                className="flex flex-col items-center gap-1 h-auto py-3"
                onClick={() => setOptions({ ...options, format: 'tax' })}
              >
                <Calculator className="w-5 h-5" />
                <span className="text-xs">Tax Report</span>
              </Button>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select
              value={options.dateRange}
              onValueChange={(value: DateRange) =>
                setOptions({ ...options, dateRange: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
                <SelectItem value="q1">Q1 (Jan-Mar)</SelectItem>
                <SelectItem value="q2">Q2 (Apr-Jun)</SelectItem>
                <SelectItem value="q3">Q3 (Jul-Sep)</SelectItem>
                <SelectItem value="q4">Q4 (Oct-Dec)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          {options.format !== 'tax' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="includeSummary" className="cursor-pointer">
                  Include Performance Summary
                </Label>
                <Switch
                  id="includeSummary"
                  checked={options.includeSummary}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, includeSummary: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="includeTips" className="cursor-pointer">
                  Include Tip Expenses
                </Label>
                <Switch
                  id="includeTips"
                  checked={options.includeTips}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, includeTips: checked })
                  }
                />
              </div>
              {bankrolls.length > 0 && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="groupByBankroll" className="cursor-pointer">
                    Group by Bankroll
                  </Label>
                  <Switch
                    id="groupByBankroll"
                    checked={options.groupByBankroll}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, groupByBankroll: checked })
                    }
                  />
                </div>
              )}
            </div>
          )}

          {options.format === 'tax' && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                <strong>Note:</strong> This tax report is for informational purposes only. 
                Always consult with a qualified tax professional for advice on reporting gambling income.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
