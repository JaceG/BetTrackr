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

  if (entries.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          No entries yet. Add your first bet entry to get started!
        </p>
      </Card>
    );
  }

  const totalPages = Math.ceil(entries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEntries = entries.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
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
        {paginatedEntries.map((entry) => (
          <Card key={entry.id} className="p-3" data-testid={`row-entry-${entry.id}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-muted-foreground">{formatDate(entry.date)}</span>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onEdit(entry.id)}
                  className="min-h-[48px] min-w-[48px]"
                  data-testid={`button-edit-${entry.id}`}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDelete(entry.id)}
                  className="min-h-[48px] min-w-[48px]"
                  data-testid={`button-delete-${entry.id}`}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Bet Amount</p>
                <p className="text-lg font-bold font-mono" data-testid={`text-bet-${entry.id}`}>
                  ${entry.betAmount?.toLocaleString() || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Net Change</p>
                <p
                  className={`text-lg font-bold font-mono ${
                    entry.net >= 0 ? "text-profit" : "text-loss"
                  }`}
                  data-testid={`text-net-${entry.id}`}
                >
                  {entry.net >= 0 ? "+" : ""}${entry.net.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Balance</p>
                <p className="text-lg font-bold font-mono" data-testid={`text-running-${entry.id}`}>
                  ${entry.running.toLocaleString()}
                </p>
              </div>
            </div>
            {entry.notes && (
              <p className="text-sm text-muted-foreground mt-2 italic">{entry.notes}</p>
            )}
          </Card>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden sm:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Bet Amount</TableHead>
              <TableHead>Net Change</TableHead>
              <TableHead>Running Balance</TableHead>
              <TableHead className="hidden lg:table-cell">Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEntries.map((entry) => (
              <TableRow key={entry.id} data-testid={`row-entry-${entry.id}`}>
                <TableCell className="font-medium">
                  {formatDate(entry.date)}
                </TableCell>
                <TableCell>
                  <span className="font-mono font-semibold" data-testid={`text-bet-${entry.id}`}>
                    ${entry.betAmount?.toLocaleString() || 0}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`font-mono font-semibold ${
                      entry.net >= 0 ? "text-profit" : "text-loss"
                    }`}
                    data-testid={`text-net-${entry.id}`}
                  >
                    {entry.net >= 0 ? "+" : ""}${entry.net.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-mono font-semibold" data-testid={`text-running-${entry.id}`}>
                    ${entry.running.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground max-w-xs truncate">
                  {entry.notes || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(entry.id)}
                      data-testid={`button-edit-${entry.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete(entry.id)}
                      data-testid={`button-delete-${entry.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t">
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({entries.length} total)
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
