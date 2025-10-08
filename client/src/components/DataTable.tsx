import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Entry {
  id: string;
  date: string;
  betAmount?: number;
  net: number;
  running: number;
  notes?: string;
}

interface DataTableProps {
  entries: Entry[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddEntry: () => void;
}

export default function DataTable({ entries, onEdit, onDelete, onAddEntry }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [groupBy, setGroupBy] = useState<'individual' | 'week' | 'month'>('individual');

  useEffect(() => {
    const totalPages = Math.ceil(entries.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [entries.length, itemsPerPage, currentPage]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getWeekKey = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${year}-W${String(weekNumber).padStart(2, '0')}`;
  };

  const getMonthKey = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const groupEntries = () => {
    if (groupBy === 'individual') {
      return entries.map(entry => ({
        key: entry.id,
        label: formatDate(entry.date),
        entries: [entry],
        totalBet: entry.betAmount || 0,
        totalNet: entry.net,
        endBalance: entry.running,
      }));
    }

    const groups = new Map<string, Entry[]>();
    
    entries.forEach(entry => {
      const key = groupBy === 'week' ? getWeekKey(entry.date) : getMonthKey(entry.date);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(entry);
    });

    return Array.from(groups.entries()).map(([key, groupEntries]) => {
      const totalBet = groupEntries.reduce((sum, e) => sum + (e.betAmount || 0), 0);
      const totalNet = groupEntries.reduce((sum, e) => sum + e.net, 0);
      const endBalance = groupEntries[groupEntries.length - 1].running;
      
      let label = '';
      if (groupBy === 'week') {
        const [year, week] = key.split('-W');
        const firstEntry = groupEntries[0];
        label = `Week ${week}, ${year} (${formatDate(firstEntry.date)})`;
      } else {
        const date = new Date(key + '-01');
        label = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
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
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          No entries yet. Add your first bet entry to get started!
        </p>
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
    <Card className="p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold">Entry History</h2>
        <Button 
          onClick={onAddEntry} 
          size="sm"
          data-testid="button-add-entry-table"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>
      
      {/* Mobile Card Layout */}
      <div className="sm:hidden space-y-3">
        {paginatedGroups.map((group) => (
          <Card key={group.key} className="p-3" data-testid={`row-group-${group.key}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium">{group.label}</span>
              {groupBy === 'individual' && (
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(group.entries[0].id)}
                    className="min-h-[48px] min-w-[48px]"
                    data-testid={`button-edit-${group.entries[0].id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(group.entries[0].id)}
                    className="min-h-[48px] min-w-[48px]"
                    data-testid={`button-delete-${group.entries[0].id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  {groupBy === 'individual' ? 'Bet Amount' : 'Total Bets'}
                </p>
                <p className="text-lg font-bold font-mono" data-testid={`text-bet-${group.key}`}>
                  ${group.totalBet.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  {groupBy === 'individual' ? 'Net Change' : 'Total Net'}
                </p>
                <p
                  className={`text-lg font-bold font-mono ${
                    group.totalNet >= 0 ? "text-profit" : "text-loss"
                  }`}
                  data-testid={`text-net-${group.key}`}
                >
                  {group.totalNet >= 0 ? "+" : ""}${group.totalNet.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  {groupBy === 'individual' ? 'Balance' : 'End Balance'}
                </p>
                <p className="text-lg font-bold font-mono" data-testid={`text-running-${group.key}`}>
                  ${group.endBalance.toLocaleString()}
                </p>
              </div>
            </div>
            {groupBy === 'individual' && group.entries[0].notes && (
              <p className="text-sm text-muted-foreground mt-2 italic">{group.entries[0].notes}</p>
            )}
            {groupBy !== 'individual' && (
              <p className="text-xs text-muted-foreground mt-2">
                {group.entries.length} {group.entries.length === 1 ? 'entry' : 'entries'}
              </p>
            )}
          </Card>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden sm:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{groupBy === 'individual' ? 'Date' : 'Period'}</TableHead>
              <TableHead>{groupBy === 'individual' ? 'Bet Amount' : 'Total Bets'}</TableHead>
              <TableHead>{groupBy === 'individual' ? 'Net Change' : 'Total Net'}</TableHead>
              <TableHead>{groupBy === 'individual' ? 'Running Balance' : 'End Balance'}</TableHead>
              <TableHead className="hidden lg:table-cell">
                {groupBy === 'individual' ? 'Notes' : 'Entries'}
              </TableHead>
              {groupBy === 'individual' && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedGroups.map((group) => (
              <TableRow key={group.key} data-testid={`row-group-${group.key}`}>
                <TableCell className="font-medium">
                  {group.label}
                </TableCell>
                <TableCell>
                  <span className="font-mono font-semibold" data-testid={`text-bet-${group.key}`}>
                    ${group.totalBet.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`font-mono font-semibold ${
                      group.totalNet >= 0 ? "text-profit" : "text-loss"
                    }`}
                    data-testid={`text-net-${group.key}`}
                  >
                    {group.totalNet >= 0 ? "+" : ""}${group.totalNet.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-mono font-semibold" data-testid={`text-running-${group.key}`}>
                    ${group.endBalance.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground max-w-xs truncate">
                  {groupBy === 'individual' 
                    ? (group.entries[0].notes || "—")
                    : `${group.entries.length} ${group.entries.length === 1 ? 'entry' : 'entries'}`
                  }
                </TableCell>
                {groupBy === 'individual' && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onEdit(group.entries[0].id)}
                        data-testid={`button-edit-${group.entries[0].id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete(group.entries[0].id)}
                        data-testid={`button-delete-${group.entries[0].id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Group by:</span>
            <Select value={groupBy} onValueChange={handleGroupByChange}>
              <SelectTrigger className="w-32" data-testid="select-group-by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-20" data-testid="select-items-per-page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({groupedData.length} {groupBy === 'individual' ? 'entries' : 'groups'})
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              data-testid="button-prev-page"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              data-testid="button-next-page"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
