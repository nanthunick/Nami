"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { TransactionLogger } from "@/components/TransactionLogger";
import { SummaryCards } from "@/components/SummaryCards";
import { TransactionsTable } from "@/components/TransactionsTable";
import { MonthSelector } from "@/components/MonthSelector";
import { NamiIcon } from "@/components/NamiIcon";

export default function Home() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user, signOut, loading } = useAuth();

  const handleTransactionAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Notion-inspired header with lots of whitespace */}
      <header className="border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <NamiIcon />
                <motion.h1
                  className="text-4xl font-semibold tracking-tight"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                >
                  Nami
                </motion.h1>
              </div>
              <motion.p
                className="text-muted-foreground text-sm mt-2 ml-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
              >
                Personal Finance Dashboard
              </motion.p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground hidden md:block">
                {user?.email}
              </div>
              <MonthSelector
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content with generous padding like Notion */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
        <div className="space-y-8 lg:space-y-12">
          {/* Summary Cards Section */}
          <section>
            <SummaryCards
              selectedMonth={selectedMonth}
              refreshTrigger={refreshTrigger}
            />
          </section>

          {/* Add Transaction Section */}
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">
                Add Transaction
              </h2>
              <p className="text-sm text-muted-foreground">
                Quickly log a new income or expense entry
              </p>
            </div>

            {/* Transaction Logger - Notion-style inline form */}
            <div className="border rounded-lg p-1">
              <TransactionLogger onTransactionAdded={handleTransactionAdded} />
            </div>
          </section>

          {/* Transactions Table Section */}
          <section className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">
                Transaction History
              </h2>
              <p className="text-sm text-muted-foreground">
                All your transactions for the selected month
              </p>
            </div>

            <TransactionsTable
              selectedMonth={selectedMonth}
              onDataChange={() => setRefreshTrigger((prev) => prev + 1)}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
