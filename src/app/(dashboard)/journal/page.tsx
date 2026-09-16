"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Trade } from "@/lib/types";
import { formatCurrency, calculatePnL } from "@/lib/trading-utils";
import { Search, Calendar, LayoutGrid, List, FileText } from "lucide-react";
import { EmptyState } from "@/components/trades/EmptyState";

interface JournalEntry {
  id: string;
  date: string;
  status: string;
  marketThoughts: string | null;
  trades: Trade[];
}

export default function TradeJournalPage() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & View
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const res = await fetch("/api/journal");
        if (!res.ok) throw new Error("Failed to fetch journals");
        const data = await res.json();
        setJournals(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJournals();
  }, []);

  // Apply search & filters
  const filteredJournals = useMemo(() => {
    return journals.filter((journal) => {
      if (search) {
        const query = search.toLowerCase();
        const matchesNote = journal.marketThoughts?.toLowerCase().includes(query) || false;
        const matchesSymbol = journal.trades?.some(t => t.symbol.toLowerCase().includes(query));
        if (!matchesNote && !matchesSymbol) return false;
      }
      
      if (dateFilter) {
        if (!journal.date.startsWith(dateFilter)) return false;
      }
      return true;
    });
  }, [journals, search, dateFilter]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-4xl animate-pulse space-y-6">
        <div className="h-8 w-1/4 bg-card border border-border rounded-xl" />
        <div className="h-16 bg-card border border-border rounded-xl" />
        <div className="space-y-4">
          <div className="h-40 bg-card border border-border rounded-xl" />
          <div className="h-40 bg-card border border-border rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">TRADE JOURNAL</h1>
          <p className="text-foreground/60">Review your past trading days and reflections.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link 
            href="/import-trades" 
            className="inline-flex items-center gap-2 bg-card border border-border text-foreground px-5 py-2.5 rounded-lg font-semibold hover:border-primary/50 transition-colors"
          >
            Import Screenshot
          </Link>
          <Link 
            href="/journal/new" 
            className="inline-flex items-center gap-2 bg-primary text-background px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <span className="w-5 h-5 flex items-center justify-center">+</span>
            New Journal
          </Link>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="bg-card border border-border rounded-xl p-2 flex flex-col sm:flex-row gap-2 flex-1 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
            <input
              type="text"
              placeholder="Search journals or symbols..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 pointer-events-none" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
          </div>
        </div>
        
        {/* Toggle Grid/List */}
        <div className="flex bg-card border border-border rounded-xl p-1 self-end md:self-auto">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/60 hover:text-foreground"}`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/60 hover:text-foreground"}`}
            title="Grid View"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Trade Journal List/Grid */}
      <div>
        {journals.length === 0 ? (
          <EmptyState
            title="No journals yet"
            description="You haven't written any daily reflections yet. Create one or start by recording your trades."
            action={{ label: "New Journal", href: "/journal/new" }}
          />
        ) : filteredJournals.length === 0 ? (
          <div className="text-center py-12 text-foreground/50 bg-card border border-border rounded-xl">
            No journals match your filters.
          </div>
        ) : (
          <div className={viewMode === "list" ? "flex flex-col gap-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
            {filteredJournals.map(journal => {
              const tradeCount = journal.trades?.length || 0;
              let dailyPnl = 0;
              let winningTrades = 0;

              if (journal.trades) {
                journal.trades.forEach(t => {
                  const pnlNum = calculatePnL(t.direction, Number(t.entryPrice), Number(t.exitPrice), Number(t.quantity));
                  dailyPnl += pnlNum;
                  if (pnlNum > 0) winningTrades++;
                });
              }

              const isWin = dailyPnl > 0;
              const isLoss = dailyPnl < 0;
              const winRate = tradeCount > 0 ? Math.round((winningTrades / tradeCount) * 100) : 0;
              
              if (viewMode === "grid") {
                return (
                  <Link key={journal.id} href={`/journal/${journal.id}`}>
                    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-[0_0_20px_rgba(var(--primary),0.1)] transition-all cursor-pointer group flex flex-col h-full">
                      {/* Image Header */}
                      <div className="aspect-video bg-black/20 relative overflow-hidden border-b border-border flex items-center justify-center">
                        <FileText className="w-12 h-12 text-foreground/20" />
                        <div className="absolute top-3 left-3 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-foreground">
                          {new Date(journal.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <div className={`absolute top-3 right-3 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs font-bold ${isWin ? "text-success" : isLoss ? "text-danger" : ""}`}>
                          {isWin ? "+" : ""}{formatCurrency(dailyPnl)}
                        </div>
                      </div>
                      
                      {/* Body */}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-foreground/50 mb-3 uppercase tracking-wider">
                          <span className={journal.status === "COMPLETED" ? "text-success/80" : "text-amber-500/80"}>{journal.status}</span>
                          <span>•</span>
                          <span>{tradeCount} Trades</span>
                        </div>
                        
                        <div className="text-foreground/90 leading-relaxed text-sm mb-5 line-clamp-3 italic opacity-90">
                          {journal.marketThoughts ? `"${journal.marketThoughts}"` : "No reflection written yet."}
                        </div>

                        <div className="mt-auto flex flex-wrap gap-2">
                          <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] uppercase font-semibold text-foreground/70">
                            Win Rate {winRate}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              }

              // List View
              return (
                <Link key={journal.id} href={`/journal/${journal.id}`}>
                  <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(var(--primary),0.1)] transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-foreground/50 w-24">
                          {new Date(journal.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <div className="font-bold text-lg group-hover:text-primary transition-colors">{tradeCount} Trades</div>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          journal.status === "COMPLETED" ? "bg-success/10 text-success" : "bg-amber-500/10 text-amber-500"
                        }`}>
                          {journal.status}
                        </span>
                      </div>
                      <div className={`text-lg font-bold ${isWin ? "text-success" : isLoss ? "text-danger" : ""}`}>
                        {isWin ? "+" : ""}{formatCurrency(dailyPnl)}
                      </div>
                    </div>
                    
                    <div className="text-foreground/90 leading-relaxed mb-4 opacity-90 line-clamp-2 italic ml-[108px]">
                      {journal.marketThoughts ? `"${journal.marketThoughts}"` : "No reflection written yet."}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
