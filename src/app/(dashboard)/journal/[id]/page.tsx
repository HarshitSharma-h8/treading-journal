"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, ArrowLeft, Trash2, Plus } from "lucide-react";
import { Trade } from "@/lib/types";
import { formatCurrency, calculatePnL } from "@/lib/trading-utils";

interface JournalEntry {
  id: string;
  entryDate: string;
  marketThoughts: string | null;
  whatWentWell: string | null;
  whatWentWrong: string | null;
  mistakes: string | null;
  lessons: string | null;
  status: string;
  trades: Trade[];
  tradeStats?: {
    pnl: number;
    trades: number;
    winRate: number;
  };
}

const Section = ({ title, content }: { title: string; content: string | null }) => {
  if (!content) return null;
  return (
    <div className="space-y-2 mb-6">
      <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">{title}</h3>
      <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed bg-foreground/5 p-4 rounded-md border border-border/50">
        {content}
      </p>
    </div>
  );
};

export default function JournalEntryPage() {
  const params = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await fetch(`/api/journal/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch journal entry");
        const data = await res.json();
        setEntry(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchEntry();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this journal entry?\n\nThis action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/journal/${params.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete entry");
      
      router.push("/journal");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete");
      setIsDeleting(false);
    }
  };

  const deleteTrade = async (tradeId: string) => {
    if (!window.confirm("Delete this trade?")) return;
    try {
      const res = await fetch(`/api/trades/${tradeId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete trade");
      setEntry(prev => prev ? { ...prev, trades: prev.trades.filter(t => t.id !== tradeId) } : null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-3xl space-y-6 animate-pulse">
        <div className="h-8 bg-card w-1/3 rounded"></div>
        <div className="h-64 bg-card rounded-lg"></div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-3xl">
        <div className="p-12 flex flex-col items-center justify-center text-center border border-red-500/20 bg-red-500/5 rounded-xl">
          <p className="text-red-500 font-medium mb-4">{error || "Entry not found"}</p>
          <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted" onClick={() => router.push("/journal")}>
            Back to Journal
          </button>
        </div>
      </div>
    );
  }

  const date = new Date(entry.entryDate);


  return (
    <div className="container mx-auto p-4 md:p-6 max-w-3xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/journal">
            <button className="p-2 hover:bg-muted rounded-md transition-colors text-foreground/60 hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </h1>
            <p className="text-muted-foreground">Journal Entry</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/journal/${entry.id}/edit`}>
            <button className="inline-flex items-center px-3 py-1.5 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </button>
          </Link>
          <button className="inline-flex items-center p-1.5 border border-red-500/30 text-red-500 rounded-md hover:bg-red-500/10 transition-colors" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {entry.tradeStats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-card border border-border/50 rounded-xl">
            <div className="text-sm text-foreground/60 mb-1">Daily P&L</div>
            <div className={`text-xl font-bold ${entry.tradeStats.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {entry.tradeStats.pnl >= 0 ? '+' : ''}₹{Math.abs(entry.tradeStats.pnl).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-4 bg-card border border-border/50 rounded-xl">
            <div className="text-sm text-foreground/60 mb-1">Trades</div>
            <div className="text-xl font-bold">{entry.tradeStats.trades}</div>
          </div>
          <div className="p-4 bg-card border border-border/50 rounded-xl">
            <div className="text-sm text-foreground/60 mb-1">Win Rate</div>
            <div className="text-xl font-bold">{entry.tradeStats.winRate}%</div>
          </div>
        </div>
      )}

      <div className="p-6 md:p-8 bg-card border border-border/50 rounded-xl shadow-sm">
        {!entry.marketThoughts && !entry.whatWentWell && !entry.whatWentWrong && !entry.mistakes && !entry.lessons && (
          <p className="text-muted-foreground italic">No content in this journal entry.</p>
        )}
        
        <Section title="How was the market?" content={entry.marketThoughts} />
        <Section title="What went well?" content={entry.whatWentWell} />
        <Section title="What went wrong?" content={entry.whatWentWrong} />
        <Section title="Mistakes" content={entry.mistakes} />
        <Section title="Lessons" content={entry.lessons} />
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">TRADES ({entry.trades?.length || 0})</h2>
          <Link href={`/add-trade?journalId=${entry.id}`}>
            <button className="inline-flex items-center px-4 py-2 bg-primary text-background rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> Add Trade
            </button>
          </Link>
        </div>

        {entry.trades?.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border/50 rounded-xl">
            <p className="text-muted-foreground mb-4">No trades recorded for this day yet.</p>
            <div className="flex justify-center gap-4">
              <Link href={`/add-trade?journalId=${entry.id}`}>
                <button className="px-4 py-2 border border-primary/20 text-primary rounded-lg hover:bg-primary/5 transition-colors">
                  + Add Trade
                </button>
              </Link>
              <Link href={`/import-trades`}>
                <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                  Import Screenshot
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {entry.trades?.map(trade => {
              const pnl = calculatePnL(trade.direction, Number(trade.entryPrice), Number(trade.exitPrice), Number(trade.quantity));
              const isWin = pnl > 0;
              const isLoss = pnl < 0;

              return (
                <div key={trade.id} className="bg-card border border-border/50 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{trade.symbol}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        trade.direction === "BUY" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                      }`}>
                        {trade.direction}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground uppercase">{trade.tradeType}</span>
                    </div>
                    <div className="text-sm text-foreground/80 mb-2">
                      Entry ₹{Number(trade.entryPrice).toLocaleString()} &rarr; Exit ₹{Number(trade.exitPrice).toLocaleString()} <span className="text-muted-foreground ml-2">Qty {Number(trade.quantity)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(trade.entryTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} 
                      {trade.exitTime && trade.exitTime !== trade.entryTime && ` → ${new Date(trade.exitTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`}
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4">
                    <div className={`text-lg font-bold ${isWin ? "text-success" : isLoss ? "text-danger" : ""}`}>
                      {isWin ? "+" : ""}₹{Math.abs(pnl).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/add-trade?id=${trade.id}&journalId=${entry.id}`}>
                        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors text-sm font-medium">
                          Edit
                        </button>
                      </Link>
                      <button 
                        className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors text-sm font-medium"
                        onClick={() => deleteTrade(trade.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
