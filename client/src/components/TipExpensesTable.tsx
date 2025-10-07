import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export default function TipExpensesTable({ tipExpenses, onEdit, onDelete, onAddTipPayment }: TipExpensesTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalTipExpenses = tipExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (tipExpenses.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          No tip expenses yet. Add your first tip payment to track costs!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-3 sm:p-4 lg:p-6">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold">Tip Expenses</h2>
        <Button 
          onClick={onAddTipPayment} 
          size="sm"
          data-testid="button-add-tip-table"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Add Tip Payment
        </Button>
      </div>
      
      {/* Mobile Card Layout */}
      <div className="sm:hidden space-y-3">
        {tipExpenses.map((expense) => (
          <Card key={expense.id} className="p-3" data-testid={`row-tip-mobile-${expense.id}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-muted-foreground">{formatDate(expense.date)}</span>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onEdit(expense.id)}
                  data-testid={`button-edit-tip-mobile-${expense.id}`}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDelete(expense.id)}
                  data-testid={`button-delete-tip-mobile-${expense.id}`}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Amount</p>
                <p
                  className="text-lg font-bold font-mono text-destructive"
                  data-testid={`text-amount-mobile-${expense.id}`}
                >
                  ${expense.amount.toLocaleString()}
                </p>
              </div>
              {expense.provider && (
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Provider</p>
                  <p className="text-sm">{expense.provider}</p>
                </div>
              )}
              {expense.notes && (
                <p className="text-sm text-muted-foreground italic">{expense.notes}</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden sm:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead className="hidden lg:table-cell">Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tipExpenses.map((expense) => (
              <TableRow key={expense.id} data-testid={`row-tip-${expense.id}`}>
                <TableCell className="font-medium">
                  {formatDate(expense.date)}
                </TableCell>
                <TableCell>
                  <span
                    className="font-mono font-semibold text-destructive"
                    data-testid={`text-amount-${expense.id}`}
                  >
                    ${expense.amount.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {expense.provider || "—"}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground max-w-xs truncate">
                  {expense.notes || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(expense.id)}
                      data-testid={`button-edit-tip-${expense.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete(expense.id)}
                      data-testid={`button-delete-tip-${expense.id}`}
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
