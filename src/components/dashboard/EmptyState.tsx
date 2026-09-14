import Link from "next/link";
import { Plus } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-border border-dashed rounded-2xl h-[400px]">
      <div className="w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
        <Plus className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">No trades yet</h3>
      <p className="text-foreground/60 max-w-sm mb-6">
        Add your first trade to start tracking your performance and analyzing your strategy.
      </p>
      <Link href="/add-trade" className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-background rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-[0_0_20px_var(--color-primary-glow)]">
        <Plus className="w-4 h-4" />
        <span>Add Trade</span>
      </Link>
    </div>
  );
}
