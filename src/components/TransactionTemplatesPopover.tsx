"use client";

import { useState, useEffect } from "react";
import { Bookmark, Plus, X } from "lucide-react";
import { supabase, type Category, type TransactionTemplate } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { encrypt, decrypt } from "@/lib/encryption";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatCurrency } from "@/lib/currency";

interface TransactionTemplatesPopoverProps {
  categories: Category[];
  onSelectTemplate: (template: {
    categoryId: string;
    amount: string;
    description: string;
  }) => void;
  currentForm?: {
    categoryId: string;
    amount: string;
    description: string;
  };
}

export function TransactionTemplatesPopover({
  categories,
  onSelectTemplate,
  currentForm,
}: TransactionTemplatesPopoverProps) {
  const [templates, setTemplates] = useState<(TransactionTemplate & { 
    category?: Category;
    amount: string;
    description: string;
  })[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  // Fetch templates
  const fetchTemplates = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("transaction_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Templates table not available yet:", error.message);
      // Silently fail - table might not exist yet
      return;
    }

    // Decrypt and enrich with category data
    const enrichedTemplates = (data || [])
      .map((template) => {
        try {
          const amount = decrypt(template.amount_encrypted, user.id);
          const description = decrypt(template.description_encrypted || "", user.id);
          const category = categories.find((c) => c.id === template.category_id);

          return {
            ...template,
            amount,
            description,
            category,
          };
        } catch (error) {
          console.error("Error decrypting template:", error);
          return null;
        }
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);

    setTemplates(enrichedTemplates);
  };

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen, user, categories]);

  const handleSaveTemplate = async () => {
    if (!user || !currentForm || !templateName.trim()) {
      alert("Please enter a name for this template");
      return;
    }

    if (!currentForm.categoryId || !currentForm.amount) {
      alert("Please fill in category and amount first");
      return;
    }

    setIsSaving(true);

    try {
      const amountEncrypted = encrypt(parseFloat(currentForm.amount), user.id);
      const descriptionEncrypted = encrypt(currentForm.description || "", user.id);

      const { error } = await supabase.from("transaction_templates").insert([
        {
          user_id: user.id,
          name: templateName.trim(),
          category_id: currentForm.categoryId,
          amount_encrypted: amountEncrypted,
          description_encrypted: descriptionEncrypted,
          is_encrypted: true,
        },
      ] as any);

      if (error) {
        console.error("Error saving template:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        alert(`Failed to save template: ${error.message || 'Unknown error'}\n\nMake sure you've run the database migration (012_transaction_templates.sql)`);
      } else {
        setTemplateName("");
        setShowSaveForm(false);
        fetchTemplates();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save template");
    }

    setIsSaving(false);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Delete this template?")) return;

    const { error } = await supabase
      .from("transaction_templates")
      .delete()
      .eq("id", templateId);

    if (error) {
      console.error("Error deleting template:", error);
      alert("Failed to delete template");
    } else {
      fetchTemplates();
    }
  };

  const handleSelectTemplate = (template: any) => {
    onSelectTemplate({
      categoryId: template.category_id,
      amount: template.amount,
      description: template.description || "",
    });
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Quick Add Templates"
        >
          <Bookmark className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <h4 className="font-medium text-sm">Quick Add</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Reuse common transactions
          </p>
        </div>

        {/* Templates List */}
        <div className="max-h-[300px] overflow-y-auto">
          {templates.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No templates yet. Save your first one!
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="group/item flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                      style={{
                        backgroundColor: template.category?.color || "#e5e7eb",
                        color: "#374151",
                      }}
                    >
                      {template.category?.name || "Unknown"}
                    </span>
                    <span className="text-sm truncate">{template.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      {formatCurrency(parseFloat(template.amount || "0"))}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Current Form as Template */}
        <div className="p-2 border-t">
          {!showSaveForm ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-8"
              onClick={() => setShowSaveForm(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Save current as template
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Input
                type="text"
                placeholder="Template name (e.g., Daily Tea)"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTemplate();
                  if (e.key === "Escape") {
                    setShowSaveForm(false);
                    setTemplateName("");
                  }
                }}
                autoFocus
              />
              <Button
                size="sm"
                className="h-8 text-xs px-2"
                onClick={handleSaveTemplate}
                disabled={isSaving || !templateName.trim()}
              >
                Save
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

