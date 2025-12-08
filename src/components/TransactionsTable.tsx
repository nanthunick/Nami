"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { supabase, type Transaction, type Category } from "@/lib/supabase";
import { formatTransactionAmount } from "@/lib/currency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

type TransactionWithCategory = Transaction & {
  category: Category;
};

interface TransactionsTableProps {
  selectedMonth: Date;
  onDataChange?: () => void;
}

export function TransactionsTable({
  selectedMonth,
  onDataChange,
}: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth]);

  const fetchTransactions = async () => {
    setIsLoading(true);

    // Get first and last day of selected month
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        category:categories(*)
      `
      )
      .gte("date", format(firstDay, "yyyy-MM-dd"))
      .lte("date", format(lastDay, "yyyy-MM-dd"))
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
    } else {
      setTransactions((data as any) || []);
      onDataChange?.();
    }

    setIsLoading(false);
  };

  const handleDeleteTransaction = async (id: string, description: string) => {
    const confirmMessage = description
      ? `Delete transaction: "${description}"?`
      : "Delete this transaction?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeletingId(id);

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction");
    } else {
      // Refresh the data
      await fetchTransactions();
      onDataChange?.();
    }

    setDeletingId(null);
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const dateKey = transaction.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {} as Record<string, TransactionWithCategory[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No transactions found for this month.</p>
        <p className="text-sm mt-1">Add your first transaction above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
        <div key={date} className="space-y-2">
          {/* Date header */}
          <div className="text-sm font-medium text-muted-foreground px-1">
            {format(new Date(date), "EEEE, MMMM d, yyyy")}
          </div>

          {/* Table for this date */}
          <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b bg-muted/30">
                  <TableHead className="w-[200px] font-medium">Category</TableHead>
                  <TableHead className="font-medium">Description</TableHead>
                  <TableHead className="text-right w-[150px] font-medium">
                    Amount
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dayTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="hover:bg-muted/50 transition-colors group"
                  >
                    <TableCell>
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: transaction.category.color,
                          color: '#374151',
                        }}
                      >
                        {transaction.category.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transaction.description || "—"}
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono font-medium ${
                        transaction.category.type === "income"
                          ? "text-green-600"
                          : "text-foreground"
                      }`}
                    >
                      {formatTransactionAmount(
                        transaction.amount,
                        transaction.category.type
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          handleDeleteTransaction(
                            transaction.id,
                            transaction.description
                          )
                        }
                        disabled={deletingId === transaction.id}
                      >
                        {deletingId === transaction.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}

