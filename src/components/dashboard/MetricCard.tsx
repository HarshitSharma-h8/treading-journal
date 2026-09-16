"use client";

import { ReactNode, useState, useEffect, useRef } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  accentColor?: string;
  description?: string;
}

export function MetricCard({ label, value, subtext, icon, trend, accentColor = "var(--color-primary)", description }: MetricCardProps) {
  const isPositive = trend === "up";
  const isNegative = trend === "down";
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (!description) return;
    setShowTooltip(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 2000);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowTooltip(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div 
      className={`relative bg-card border border-border rounded-2xl p-5 group transition-all duration-300 ${showTooltip ? 'z-50' : 'z-0'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Custom Tooltip */}
      {description && (
        <div 
          className={`absolute left-1/2 -translate-x-1/2 -top-14 px-3 py-2 bg-card border border-border text-foreground text-xs rounded-lg font-medium shadow-xl shadow-black/50 w-max max-w-[250px] text-center transition-all duration-300 pointer-events-none ${
            showTooltip ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          {description}
          {/* Tooltip Arrow */}
          <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-card border-b border-r border-border rotate-45" />
        </div>
      )}

      {/* Overflow wrapper for background glow */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        {/* Subtle background glow with hover effect */}
        <div 
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700 ease-out group-hover:scale-150 group-hover:opacity-80"
          style={{ backgroundColor: accentColor }}
        />
      </div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <p className="text-sm font-medium text-foreground/60">{label}</p>
        <div 
          className="p-2 rounded-lg bg-background/50 border border-border/50 transition-colors duration-500"
          style={{ color: accentColor }}
        >
          {icon}
        </div>
      </div>
      
      <div className="relative z-10">
        <h3 className={`text-2xl font-bold mb-1 ${
          isPositive ? "text-success" : isNegative ? "text-danger" : "text-foreground"
        }`}>
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
