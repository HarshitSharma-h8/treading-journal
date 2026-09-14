"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, ArrowLeft, Trash2 } from "lucide-react";

interface JournalEntry {
  id: string;
  entryDate: string;
  marketThoughts: string | null;
  whatWentWell: string | null;
  whatWentWrong: string | null;
  mistakes: string | null;
  lessons: string | null;
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
    </div>
  );
}
