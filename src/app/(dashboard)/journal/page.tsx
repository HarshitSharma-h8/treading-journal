"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Trade } from "@/lib/types";
import { formatCurrency } from "@/lib/trading-utils";
import { Search, Calendar, Filter, LayoutGrid, List, BarChart2 } from "lucide-react";
import { EmptyState } from "@/components/trades/EmptyState";

export default function TradeJournalPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & View
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [emotionFilter, setEmotionFilter] = useState("");
  const [strategyFilter, setStrategyFilter] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await fetch("/api/trades");
        if (!res.ok) throw new Error("Failed to fetch trades");
        const data = await res.json();
        setTrades(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, []);

  // Filter only trades that have a journal (quickNote)
  const journalTrades = useMemo(() => {
    return trades.filter((t) => !!t.quickNote);
  }, [trades]);

  // Apply search & filters
  const filteredTrades = useMemo(() => {
    return journalTrades.filter((trade) => {
      if (search) {
        const query = search.toLowerCase();
        const matchesSymbol = trade.symbol.toLowerCase().includes(query);
        const matchesNote = trade.quickNote?.toLowerCase().includes(query) || false;
        if (!matchesSymbol && !matchesNote) return false;
      }
      
      if (dateFilter) {
        if (!trade.tradeDate.startsWith(dateFilter)) return false;
      }
      
      if (emotionFilter && trade.emotion !== emotionFilter) return false;
      if (strategyFilter && trade.strategyId !== strategyFilter) return false;

      return true;
    });
  }, [journalTrades, search, dateFilter, emotionFilter, strategyFilter]);

  // Extract unique filters for dropdowns
  const uniqueEmotions = useMemo(() => Array.from(new Set(journalTrades.map(t => t.emotion).filter(Boolean))), [journalTrades]);
  const uniqueStrategies = useMemo(() => Array.from(new Set(journalTrades.map(t => t.strategyId).filter(Boolean))), [journalTrades]);

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
          <p className="text-foreground/60">Review your past trades and their reasoning.</p>
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
            <span className="w-5 h-5 flex items-center justify-center">+</span>
            Add Trade
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
              placeholder="Search symbol or journal..."
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
            <div className="relative flex-1 sm:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 pointer-events-none" />
              <select
                value={emotionFilter}
                onChange={(e) => setEmotionFilter(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm appearance-none"
              >
                <option value="">All Emotions</option>
                {uniqueEmotions.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="relative flex-1 sm:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 pointer-events-none" />
              <select
                value={strategyFilter}
                onChange={(e) => setStrategyFilter(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm appearance-none"
              >
                <option value="">All Strategies</option>
                {uniqueStrategies.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
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
        {journalTrades.length === 0 ? (
          <EmptyState
            title="No journals yet"
            description="You haven't written any journals for your trades yet. When you add a trade, fill out the Journal section to see it here."
            action={{ label: "Add Trade", href: "/add-trade" }}
          />
        ) : filteredTrades.length === 0 ? (
          <div className="text-center py-12 text-foreground/50 bg-card border border-border rounded-xl">
            No journals match your filters.
          </div>
        ) : (
          <div className={viewMode === "list" ? "flex flex-col gap-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
            {filteredTrades.map(trade => {
              const isWin = trade.pnl > 0;
              const isLoss = trade.pnl < 0;
              
              if (viewMode === "grid") {
                return (
                  <Link key={trade.id} href={`/trades/${trade.id}`}>
                    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-[0_0_20px_rgba(var(--primary),0.1)] transition-all cursor-pointer group flex flex-col h-full">
                      {/* Image Header */}
                      <div className="aspect-video bg-black/20 relative overflow-hidden border-b border-border flex items-center justify-center">
                        {trade.screenshot ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={trade.screenshot} alt={trade.symbol} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <BarChart2 className="w-12 h-12 text-foreground/20" />
                        )}
                        <div className="absolute top-3 left-3 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-foreground">
                          {trade.symbol}
                        </div>
                        <div className={`absolute top-3 right-3 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs font-bold ${isWin ? "text-success" : isLoss ? "text-danger" : ""}`}>
                          {isWin ? "+" : ""}{formatCurrency(trade.pnl)}
                        </div>
                      </div>
                      
                      {/* Body */}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-foreground/50 mb-3 uppercase tracking-wider">
                          <span>{new Date(trade.tradeDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          <span>•</span>
                          <span className={trade.tradeType === "BUY" ? "text-success/80" : "text-danger/80"}>{trade.tradeType}</span>
                        </div>
                        
                        <div className="text-foreground/90 leading-relaxed text-sm mb-5 line-clamp-3 italic opacity-90">
                          "{trade.quickNote}"
                        </div>

                        <div className="mt-auto flex flex-wrap gap-2">
                          {trade.strategyId && (
                            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] uppercase font-semibold text-foreground/70">
                              {trade.strategyId}
                            </span>
                          )}
                          {trade.emotion && (
                            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] uppercase font-semibold text-foreground/70">
                              {trade.emotion}
                            </span>
                          )}
                          {trade.planFollowed !== null && trade.planFollowed !== undefined && (
                            <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-semibold border ${
                              trade.planFollowed 
                                ? "bg-success/10 border-success/20 text-success/90" 
                                : "bg-danger/10 border-danger/20 text-danger/90"
                            }`}>
                              {trade.planFollowed ? "Plan Followed" : "Plan Ignored"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              }

              // List View
              return (
                <Link key={trade.id} href={`/trades/${trade.id}`}>
                  <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(var(--primary),0.1)] transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-foreground/50 w-24">
                          {new Date(trade.tradeDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <div className="font-bold text-lg group-hover:text-primary transition-colors">{trade.symbol}</div>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          trade.tradeType === "BUY" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                        }`}>
                          {trade.tradeType}
                        </span>
                      </div>
                      <div className={`text-lg font-bold ${isWin ? "text-success" : isLoss ? "text-danger" : ""}`}>
                        {isWin ? "+" : ""}{formatCurrency(trade.pnl)}
                      </div>
                    </div>
                    
                    <div className="text-foreground/90 leading-relaxed mb-4 opacity-90 line-clamp-2 italic ml-[108px]">
                      "{trade.quickNote}"
                    </div>

                    <div className="flex flex-wrap gap-2 ml-[108px]">
                      {trade.strategyId && (
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-foreground/70">
                          {trade.strategyId}
                        </span>
                      )}
                      {trade.emotion && (
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-foreground/70">
                          {trade.emotion}
                        </span>
                      )}
                      {trade.marketCondition && (
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-foreground/70">
                          {trade.marketCondition}
                        </span>
                      )}
                      {trade.planFollowed !== null && trade.planFollowed !== undefined && (
                        <span className={`px-3 py-1 rounded-full text-xs border ${
                          trade.planFollowed 
                            ? "bg-success/10 border-success/20 text-success/90" 
                            : "bg-danger/10 border-danger/20 text-danger/90"
                        }`}>
                          {trade.planFollowed ? "Plan followed" : "Plan NOT followed"}
                        </span>
                      )}
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
