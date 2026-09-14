"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Trade } from "@/lib/types";
import { formatCurrency } from "@/lib/trading-utils";

interface JournalEntry {
  id: string;
  entryDate: string;
  marketThoughts: string | null;
  whatWentWell: string | null;
  whatWentWrong: string | null;
  mistakes: string | null;
  lessons: string | null;
}

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [todayJournal, setTodayJournal] = useState<JournalEntry | null>(null);
  
  const [marketThoughts, setMarketThoughts] = useState("");
  const [mistakes, setMistakes] = useState("");
  const [lessons, setLessons] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tradesRes, journalRes] = await Promise.all([
          fetch("/api/trades"),
          fetch("/api/journal?limit=10")
        ]);

        if (!tradesRes.ok || !journalRes.ok) throw new Error("Failed to fetch data");
        
        const tradesData = await tradesRes.json();
        const journalData = await journalRes.json();
        
        setTrades(tradesData);
        
        // Find today's journal
        const todayStr = new Date().toISOString().split("T")[0];
        const todayEntry = journalData.find((j: JournalEntry) => j.entryDate.startsWith(todayStr));
        
        if (todayEntry) {
          setTodayJournal(todayEntry);
          setMarketThoughts(todayEntry.marketThoughts || "");
          setMistakes(todayEntry.mistakes || "");
          setLessons(todayEntry.lessons || "");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  
  const todayTrades = useMemo(() => {
    return trades.filter((t) => t.tradeDate.startsWith(todayStr));
  }, [trades, todayStr]);

  const stats = useMemo(() => {
    const totalPnl = todayTrades.reduce((acc, trade) => acc + (trade.pnl || 0), 0);
    const wins = todayTrades.filter((t) => t.pnl > 0).length;
    const winRate = todayTrades.length > 0 ? Math.round((wins / todayTrades.length) * 100) : 0;
    return { totalPnl, count: todayTrades.length, winRate };
  }, [todayTrades]);

  const handleSaveReflection = async () => {
    setSaving(true);
    try {
      const payload = {
        entryDate: new Date().toISOString(),
        marketThoughts,
        mistakes,
        lessons,
      };
      
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save reflection");
      
      const saved = await res.json();
      setTodayJournal(saved);
      alert("Reflection saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save reflection.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-3xl animate-pulse space-y-6">
        <div className="h-8 w-1/3 bg-card border border-border rounded-xl" />
        <div className="h-32 bg-card border border-border rounded-xl" />
        <div className="h-64 bg-card border border-border rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-3xl space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">JOURNAL</h1>
        <p className="text-foreground/60">Your trading reflections</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}
        </h2>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border p-4 rounded-xl">
            <div className="text-sm text-foreground/60 mb-1">Daily P&L</div>
            <div className={`text-xl font-bold ${stats.totalPnl > 0 ? "text-success" : stats.totalPnl < 0 ? "text-danger" : ""}`}>
              {stats.totalPnl > 0 ? "+" : ""}{formatCurrency(stats.totalPnl)}
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl">
            <div className="text-sm text-foreground/60 mb-1">Trades</div>
            <div className="text-xl font-bold">{stats.count}</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl">
            <div className="text-sm text-foreground/60 mb-1">Win Rate</div>
            <div className="text-xl font-bold">{stats.winRate}%</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm tracking-widest text-foreground/50 uppercase font-semibold border-b border-border/50 pb-2">
          Today's Trades
        </h3>
        
        {todayTrades.length === 0 ? (
          <p className="text-foreground/60 py-4 text-center bg-card/30 border border-dashed border-border/50 rounded-xl">
            No trades taken today.
          </p>
        ) : (
          <div className="space-y-3">
            {todayTrades.map(trade => {
              const tags = [trade.strategyId, trade.emotion, trade.planFollowed === true ? "Plan followed" : trade.planFollowed === false ? "Plan NOT followed" : null]
                .filter(Boolean)
                .join(" • ");
                
              return (
                <Link key={trade.id} href={`/trades/${trade.id}`}>
                  <div className="bg-card border border-border rounded-xl p-4 hover:bg-white/5 transition-colors cursor-pointer flex justify-between items-center group">
                    <div>
                      <div className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {trade.symbol}
                      </div>
                      <div className="text-sm text-foreground/60 mt-1">
                        {tags || "No context added"}
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${trade.pnl > 0 ? "text-success" : trade.pnl < 0 ? "text-danger" : ""}`}>
                      {trade.pnl > 0 ? "+" : ""}{formatCurrency(trade.pnl)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-6 pt-4">
        <h3 className="text-sm tracking-widest text-foreground/50 uppercase font-semibold border-b border-border/50 pb-2">
          Daily Reflection
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Market thoughts</label>
            <textarea
              value={marketThoughts}
              onChange={(e) => setMarketThoughts(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[100px]"
              placeholder="How did the market behave today?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Biggest mistake</label>
            <textarea
              value={mistakes}
              onChange={(e) => setMistakes(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[100px]"
              placeholder="What went wrong?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Biggest lesson</label>
            <textarea
              value={lessons}
              onChange={(e) => setLessons(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[100px]"
              placeholder="What will you do differently tomorrow?"
            />
          </div>

          <button
            onClick={handleSaveReflection}
            disabled={saving}
            className="w-full bg-primary text-background font-semibold py-3 px-8 rounded-xl transition-all disabled:opacity-50 hover:bg-primary/90"
          >
            {saving ? "Saving..." : "Save Reflection"}
          </button>
        </div>
      </div>
    </div>
  );
}
