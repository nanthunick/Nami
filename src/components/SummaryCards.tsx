"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { supabase, type Category } from "@/lib/supabase";
import { formatCurrency } from "@/lib/currency";
import { decrypt } from "@/lib/encryption";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

interface SummaryCardsProps {
  selectedMonth: Date;
  refreshTrigger?: number;
}

interface CategoryTotal {
  category: Category;
  total: number;
}

export function SummaryCards({
  selectedMonth,
  refreshTrigger = 0,
}: SummaryCardsProps) {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [topCategory, setTopCategory] = useState<CategoryTotal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchSummary();
  }, [selectedMonth, refreshTrigger]);

  const fetchSummary = async () => {
    if (!user) return;
    
    setIsLoading(true);

    // Get first and last day of selected month
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Fetch all transactions for the month with category info
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        category:categories(*)
      `
      )
      .gte("date", format(firstDay, "yyyy-MM-dd"))
      .lte("date", format(lastDay, "yyyy-MM-dd"));

    if (error) {
      console.error("Error fetching summary:", error);
      setIsLoading(false);
      return;
    }

    // Calculate totals
    let expenseSum = 0;
    let incomeSum = 0;
    const categoryTotals: Record<string, CategoryTotal> = {};

    transactions?.forEach((transaction: any) => {
      try {
        // ALWAYS read from encrypted fields (with fallback to plaintext for legacy data)
        let amount: number;
        
        // PRIORITY 1: Use encrypted field if available
        if (transaction.amount_encrypted) {
          const decryptedAmount = decrypt(transaction.amount_encrypted, user.id);
          amount = parseFloat(decryptedAmount) || 0;
        } 
        // PRIORITY 2: Fallback to plaintext (for unmigrated data)
        else if (transaction.amount) {
          console.warn(`Transaction ${transaction.id} not encrypted - using plaintext in summary`);
          amount = parseFloat(transaction.amount);
        }
        // PRIORITY 3: Default to 0
        else {
          console.error(`Transaction ${transaction.id} has no amount data`);
          amount = 0;
        }
        
        const category = transaction.category;

        if (category.type === "expense") {
          expenseSum += amount;

          // Track category totals for expenses
          if (!categoryTotals[category.id]) {
            categoryTotals[category.id] = {
              category,
              total: 0,
            };
          }
          categoryTotals[category.id].total += amount;
        } else if (category.type === "income") {
          incomeSum += amount;
        }
      } catch (error) {
        console.error("Error processing transaction:", error);
      }
    });

    setTotalExpenses(expenseSum);
    setTotalIncome(incomeSum);

    // Find top spending category
    const topCat = Object.values(categoryTotals).sort(
      (a, b) => b.total - a.total
    )[0];
    setTopCategory(topCat || null);

    setIsLoading(false);
  };

  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Expenses */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Expenses
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              formatCurrency(totalExpenses)
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {format(selectedMonth, "MMMM yyyy")}
          </p>
        </CardContent>
      </Card>

      {/* Total Income */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Income
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {isLoading ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              formatCurrency(totalIncome)
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {format(selectedMonth, "MMMM yyyy")}
          </p>
        </CardContent>
      </Card>

      {/* Net Balance */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Net Balance
          </CardTitle>
          <Wallet className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              netBalance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {isLoading ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              `${netBalance >= 0 ? "+" : ""}${formatCurrency(Math.abs(netBalance))}`
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Income - Expenses
          </p>
        </CardContent>
      </Card>

      {/* Top Spending Category */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Top Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-2xl font-bold text-muted-foreground">—</div>
          ) : topCategory ? (
            <>
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: topCategory.category.color,
                  color: '#374151',
                }}
              >
                {topCategory.category.name}
              </span>
              <p className="text-xs text-muted-foreground mt-2">
                {formatCurrency(topCategory.total)} spent
              </p>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              No expenses yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

