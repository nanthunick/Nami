"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Settings } from "lucide-react";
import { format } from "date-fns";
import { supabase, type Category } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ManageCategoriesDialog } from "@/components/ManageCategoriesDialog";
import { cn } from "@/lib/utils";

interface TransactionLoggerProps {
  onTransactionAdded?: () => void;
}

export function TransactionLogger({ onTransactionAdded }: TransactionLoggerProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);

  // Fetch categories function
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      return;
    }

    setCategories(data || []);
  };

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddTransaction = async () => {
    if (!categoryId || !amount || !date) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.from("transactions").insert([
      {
        date: format(date, "yyyy-MM-dd"),
        category_id: categoryId,
        description: description || null,
        amount: parseFloat(amount),
      },
    ]);

    if (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to add transaction");
    } else {
      // Reset form
      setDescription("");
      setAmount("");
      setCategoryId("");
      setDate(new Date());
      
      // Trigger refresh callback
      onTransactionAdded?.();
    }

    setIsLoading(false);
  };

  return (
    <>
      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors group">
        {/* Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-[160px] justify-start text-left font-normal ghost-input px-3 h-9",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
              {date ? format(date, "MMM dd, yyyy") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Category Select with Manage Button */}
        <div className="flex items-center gap-1">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-[200px] ghost-input h-9 border-transparent">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: category.color,
                        color: '#374151',
                      }}
                    >
                      {category.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({category.type})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Manage Categories Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setManageCategoriesOpen(true)}
            title="Manage Categories"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Description */}
        <Input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 ghost-input h-9 border-transparent"
        />

        {/* Amount */}
        <Input
          type="number"
          placeholder="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-[140px] ghost-input h-9 border-transparent"
          step="0.01"
          min="0"
        />

        {/* Add Button */}
        <Button
          onClick={handleAddTransaction}
          disabled={isLoading}
          size="sm"
          className="h-9 gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Manage Categories Dialog */}
      <ManageCategoriesDialog
        open={manageCategoriesOpen}
        onOpenChange={setManageCategoriesOpen}
        onCategoriesUpdated={fetchCategories}
      />
    </>
  );
}

