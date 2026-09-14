import Link from "next/link";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-border rounded-xl bg-card/50 backdrop-blur-sm">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
        <Plus className="w-8 h-8 opacity-50" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-foreground/60 mb-6 max-w-sm">{description}</p>
      
      {action && (
        action.href ? (
          <Link href={action.href} className="inline-flex items-center gap-2 bg-primary text-background px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
