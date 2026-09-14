import { Search } from "lucide-react";
import { Trade } from "@/lib/types";

export type FilterState = {
  search: string;
  date: string; // "all" | "today" | "week" | "month" | "YYYY-MM-DD"
  result: "all" | "profitable" | "loss" | "breakeven";
  symbol: string;
  strategy: string;
};

interface TradeFiltersProps {
  trades: Trade[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export function TradeFilters({ trades, filters, onFilterChange }: TradeFiltersProps) {
  const uniqueSymbols = Array.from(new Set(trades.map((t) => t.symbol))).filter(Boolean).sort();
  const uniqueStrategies = Array.from(new Set(trades.map((t) => t.strategyId))).filter(Boolean).sort();

  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Search Bar */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-foreground/40" />
        </div>
        <input
          type="text"
          placeholder="Search trades by symbol, strategy, or notes..."
          value={filters.search}
          onChange={(e) => handleChange("search", e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filters.date}
          onChange={(e) => handleChange("date", e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          {filters.date.match(/^\d{4}-\d{2}-\d{2}$/) && (
            <option value={filters.date}>{filters.date}</option>
          )}
        </select>

        <select
          value={filters.result}
          onChange={(e) => handleChange("result", e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
        >
          <option value="all">All Results</option>
          <option value="profitable">Profitable</option>
          <option value="loss">Loss</option>
          <option value="breakeven">Breakeven</option>
        </select>

        <select
          value={filters.symbol}
          onChange={(e) => handleChange("symbol", e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
        >
          <option value="all">All Symbols</option>
          {uniqueSymbols.map((sym) => (
            <option key={sym} value={sym}>{sym}</option>
          ))}
        </select>

        <select
          value={filters.strategy}
          onChange={(e) => handleChange("strategy", e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
        >
          <option value="all">All Strategies</option>
          {uniqueStrategies.map((strat) => (
            <option key={strat} value={strat}>{strat}</option>
          ))}
        </select>
        
        {/* Clear Filters Button (shows only if something is selected) */}
        {(filters.search || filters.date !== "all" || filters.result !== "all" || filters.symbol !== "all" || filters.strategy !== "all") && (
          <button
            onClick={() => onFilterChange({ search: "", date: "all", result: "all", symbol: "all", strategy: "all" })}
            className="text-sm text-foreground/60 hover:text-foreground underline decoration-dashed underline-offset-4 ml-auto self-center"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
