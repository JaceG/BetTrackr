import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Entry {
  id: string;
  date: string;
  net: number;
  running: number;
  notes?: string;
}

interface DataTableProps {
  entries: Entry[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function DataTable({ entries, onEdit, onDelete }: DataTableProps) {
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

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-4">Entry History</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Net Change</TableHead>
              <TableHead>Running Balance</TableHead>
              <TableHead className="hidden sm:table-cell">Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id} data-testid={`row-entry-${entry.id}`}>
                <TableCell className="font-medium">
                  {formatDate(entry.date)}
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
                <TableCell className="hidden sm:table-cell text-muted-foreground max-w-xs truncate">
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
    </Card>
  );
}
