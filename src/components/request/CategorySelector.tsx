"use client";

import { Pizza, Coffee, ShoppingBag, BookOpen, Pill, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

export type Category = "Snack" | "Beverage" | "Meal" | "Grocery" | "Stationery" | "Medicine";

const CATEGORIES: { id: Category; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "Snack", label: "Snack", icon: Pizza },
  { id: "Beverage", label: "Beverage", icon: Coffee },
  { id: "Meal", label: "Meal", icon: Utensils },
  { id: "Grocery", label: "Grocery", icon: ShoppingBag },
  { id: "Stationery", label: "Stationery", icon: BookOpen },
  { id: "Medicine", label: "Medicine", icon: Pill },
];

interface CategorySelectorProps {
  selectedCategory: Category;
  onSelect: (category: Category) => void;
}

export function CategorySelector({ selectedCategory, onSelect }: CategorySelectorProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const Icon = cat.icon;
        
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex flex-col items-center justify-center min-w-[80px] h-20 rounded-2xl border transition-all",
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-secondary/50"
            )}
          >
            {(() => {
              return <Icon className="w-6 h-6 mb-2" />;
            })()}
            <span className="text-xs font-medium">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
