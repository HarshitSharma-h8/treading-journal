"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, ArrowUpDown } from "lucide-react";
import { Trade } from "@/lib/types";
import { getTrades } from "@/lib/api/trades";
import { TradeSummary } from "@/components/trades/TradeSummary";
import { TradeFilters, FilterState } from "@/components/trades/TradeFilters";
import { TradeListDesktop } from "@/components/trades/TradeListDesktop";
import { TradeListMobile } from "@/components/trades/TradeListMobile";
import { EmptyState } from "@/components/trades/EmptyState";

type SortOption = "date-desc" | "date-asc" | "pnl-desc" | "pnl-asc";

export default function TradesPage() {
  const searchParams = useSearchParams();
  const queryDate = searchParams.get("date");

  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    date: queryDate || "all",
    result: "all",
    symbol: "all",
    strategy: "all",
  });
  
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load trades on mount
  useEffect(() => {
    async function loadTrades() {
      try {
        const data = await getTrades();
        // Since tradeDate might be returned as string from JSON API, map to our expected format if needed
        // but we just pass it as is, our Trade type has `date` string originally. Wait, my schema uses `tradeDate`.
        // Let's ensure compatibility.
        setTrades(data as unknown as Trade[]);
        setError(null);
      } catch (err) {
        console.error("Failed to load trades:", err);
        setError("Unable to load your trades.");
      } finally {
        setIsLoaded(true);
        setIsLoading(false);
      }
    }
    
    loadTrades();
  }, []);

  const filteredAndSortedTrades = useMemo(() => {
    let result = [...trades];

    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.symbol.toLowerCase().includes(q) ||
          (t.strategyId && t.strategyId.toLowerCase().includes(q)) ||
          (t.quickNote && t.quickNote.toLowerCase().includes(q))
      );
    }

    // Symbol filter
    if (filters.symbol !== "all") {
      result = result.filter((t) => t.symbol === filters.symbol);
    }

    // Strategy filter
    if (filters.strategy !== "all") {
      result = result.filter((t) => t.strategyId === filters.strategy);
    }

    // Result filter
    if (filters.result !== "all") {
      result = result.filter((t) => {
        if (filters.result === "profitable") return t.pnl > 0;
        if (filters.result === "loss") return t.pnl < 0;
        if (filters.result === "breakeven") return t.pnl === 0;
        return true;
      });
    }

    // Date filter
    if (filters.date !== "all") {
      const now = new Date();
      result = result.filter((t) => {
        const tradeDateVal = new Date(t.tradeDate);
        if (filters.date === "today") {
          return tradeDateVal.toDateString() === now.toDateString();
        }
        if (filters.date === "week") {
          const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return tradeDateVal >= pastWeek;
        }
        if (filters.date === "month") {
          return tradeDateVal.getMonth() === now.getMonth() && tradeDateVal.getFullYear() === now.getFullYear();
        }
        // Handle YYYY-MM-DD exact match
        if (filters.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Compare as local string or exact UTC match depending on how tradeDate is stored.
          // The simplest is to convert tradeDateVal to YYYY-MM-DD and compare.
          const formatted = tradeDateVal.toLocaleDateString('en-CA'); // 'YYYY-MM-DD' in local time
          return formatted === filters.date;
        }
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime();
      }
      if (sortBy === "date-asc") {
        return new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime();
      }
      if (sortBy === "pnl-desc") {
        return b.pnl - a.pnl;
      }
      if (sortBy === "pnl-asc") {
        return a.pnl - b.pnl;
      }
      return 0;
    });

    return result;
  }, [trades, filters, sortBy]);

  if (!isLoaded) return null; // Avoid hydration mismatch

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-xl text-foreground/60 animate-pulse">Loading trades...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 pb-20">
      {/* Top subtle glow matching dashboard */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 uppercase">TRADES</h1>
            <p className="text-foreground/60 text-lg">Your trading history</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Link 
              href="/import-trades" 
              className="inline-flex items-center gap-2 bg-card border border-border text-foreground px-5 py-2.5 rounded-lg font-semibold hover:border-primary/50 transition-colors"
            >
              Import Screenshot
            </Link>
            <Link 
              href="/add-trade" 
              className="inline-flex items-center gap-2 bg-primary text-background px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5" />
              Add Trade
            </Link>
          </div>
        </div>

        {trades.length === 0 ? (
          <EmptyState 
            title="No trades yet" 
            description="Record your first trade to start building your journal." 
            action={{ label: "Add Trade", href: "/add-trade" }}
          />
        ) : (
          <>
            <TradeSummary trades={filteredAndSortedTrades} />
            
            <div className="bg-card/50 border border-border rounded-xl p-4 md:p-6 mb-6">
              <TradeFilters 
                trades={trades} 
                filters={filters} 
                onFilterChange={setFilters} 
              />
              
              <div className="flex justify-end items-center border-t border-border pt-4 mt-2">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-foreground/60" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="date-desc">Newest first</option>
                    <option value="date-asc">Oldest first</option>
                    <option value="pnl-desc">P&L (High to Low)</option>
                    <option value="pnl-asc">P&L (Low to High)</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredAndSortedTrades.length === 0 ? (
              <EmptyState 
                title="No trades match your filters." 
                description="Try adjusting your search or clear all filters to see your trades." 
                action={{ 
                  label: "Clear filters", 
                  onClick: () => setFilters({ search: "", date: "all", result: "all", symbol: "all", strategy: "all" }) 
                }}
              />
            ) : (
              <>
                <TradeListDesktop trades={filteredAndSortedTrades} />
                <TradeListMobile trades={filteredAndSortedTrades} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
