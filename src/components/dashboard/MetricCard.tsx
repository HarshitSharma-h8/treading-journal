import { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  accentColor?: string;
}

export function MetricCard({ label, value, subtext, icon, trend, accentColor = "var(--color-primary)" }: MetricCardProps) {
  const isPositive = trend === "up";
  const isNegative = trend === "down";

  return (
    <div className="relative overflow-hidden bg-card border border-border rounded-2xl p-5 hover:border-foreground/20 transition-colors">
      {/* Subtle background glow */}
      <div 
        className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <p className="text-sm font-medium text-foreground/60">{label}</p>
        <div 
          className="p-2 rounded-lg bg-background/50 border border-border/50"
          style={{ color: accentColor }}
        >
          {icon}
        </div>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-2xl font-bold text-foreground mb-1">
          {value}
        </h3>
        
        {subtext && (
          <p className={`text-xs font-medium flex items-center gap-1 ${
            isPositive ? "text-success" : isNegative ? "text-danger" : "text-foreground/50"
          }`}>
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
