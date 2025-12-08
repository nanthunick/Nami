"use client";

import { useState, useEffect } from "react";
import { supabase, type Category } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ManageCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoriesUpdated: () => void;
}

// Notion-style pastel colors for new categories
const PASTEL_COLORS = [
  "#FFE2DD", // Light red
  "#FFE4C8", // Light orange
  "#FFF2D9", // Light yellow
  "#D4EDDA", // Light green
  "#E7F3EC", // Light mint
  "#D3E5EF", // Light blue
  "#DBEDFF", // Light sky
  "#E8DEFF", // Light purple
  "#F5E8FF", // Light lavender
  "#FFE4F1", // Light pink
  "#FFE4E6", // Light rose
  "#E8E9EB", // Light gray
];

const getRandomColor = () => {
  return PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
};

export function ManageCategoriesDialog({
  open,
  onOpenChange,
  onCategoriesUpdated,
}: ManageCategoriesDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // New category form
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<"income" | "expense">("expense");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("type")
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data || []);
    }
    setIsLoading(false);
  };

  const handleDeleteCategory = async (category: Category) => {
    // First, check if this category has any transactions
    const { count, error: countError } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("category_id", category.id);

    if (countError) {
      alert("Error checking category usage");
      return;
    }

    if (count && count > 0) {
      alert(
        `Cannot delete "${category.name}" category. It has ${count} transaction(s) linked to it. Please delete or reassign those transactions first.`
      );
      return;
    }

    // Confirm deletion
    if (!window.confirm(`Delete category "${category.name}"?`)) {
      return;
    }

    setDeletingId(category.id);

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    } else {
      await fetchCategories();
      onCategoriesUpdated();
    }

    setDeletingId(null);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    setIsAdding(true);

    const { error } = await supabase.from("categories").insert([
      {
        name: newCategoryName.trim(),
        type: newCategoryType,
        color: getRandomColor(),
        icon: "Circle", // Default icon
      },
    ]);

    if (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category");
    } else {
      setNewCategoryName("");
      setNewCategoryType("expense");
      await fetchCategories();
      onCategoriesUpdated();
    }

    setIsAdding(false);
  };

  // Group categories by type
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            Add, remove, or organize your transaction categories
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Expense Categories */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Expense Categories ({expenseCategories.length})
                </h3>
                <div className="space-y-1">
                  {expenseCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteCategory(category)}
                        disabled={deletingId === category.id}
                      >
                        {deletingId === category.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Income Categories */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Income Categories ({incomeCategories.length})
                </h3>
                <div className="space-y-1">
                  {incomeCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteCategory(category)}
                        disabled={deletingId === category.id}
                      >
                        {deletingId === category.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Add New Category */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-sm font-medium">Add New Category</h3>
            <div className="space-y-2">
              <Input
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddCategory();
                  }
                }}
              />
              <div className="flex gap-2">
                <Select
                  value={newCategoryType}
                  onValueChange={(value: "income" | "expense") =>
                    setNewCategoryType(value)
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddCategory}
                  disabled={isAdding || !newCategoryName.trim()}
                  className="flex-1"
                >
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Category
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


