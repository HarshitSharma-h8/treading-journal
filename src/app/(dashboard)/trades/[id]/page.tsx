"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, X, Image as ImageIcon } from "lucide-react";
import { getTrade, updateTrade } from "@/lib/api/trades";
import { Trade } from "@/lib/types";
import { formatCurrency, calculateRiskReward } from "@/lib/trading-utils";
import { TradeActions } from "@/components/trades/TradeActions";
import { EmptyState } from "@/components/trades/EmptyState";

export default function TradeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [trade, setTrade] = useState<Trade | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadTrade() {
      try {
        const data = await getTrade(id);
        setTrade(data as unknown as Trade | null);
      } catch (err) {
        console.error("Failed to load trade:", err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadTrade();
  }, [id]);

  if (!isLoaded) return null;

  if (!trade) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <EmptyState 
          title="Trade not found" 
          description="The trade you're looking for doesn't exist or has been deleted."
          action={{ label: "Back to Trades", href: "/trades" }}
        />
      </div>
    );
  }

  const isWin = trade.pnl > 0;
  const isLoss = trade.pnl < 0;
  const riskReward = trade.stopLoss && trade.target ? calculateRiskReward(trade.tradeType, trade.entryPrice, trade.stopLoss, trade.target) : null;

  const handleRemoveScreenshot = async () => {
    if (confirm("Remove screenshot from this trade?")) {
      try {
        await updateTrade(trade.id, { screenshot: undefined });
        setTrade({ ...trade, screenshot: undefined });
      } catch (err) {
        console.error("Failed to remove screenshot", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 pb-20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10 max-w-5xl">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/trades" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Trades
          </Link>
          <TradeActions tradeId={trade.id} />
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-border pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-foreground/70 mb-2">
              <span>
                {new Date(trade.tradeDate).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold tracking-tight">{trade.symbol}</h1>
              <span className={`px-3 py-1 rounded-md text-sm font-bold ${
                trade.tradeType === "BUY" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
              }`}>
                {trade.tradeType}
              </span>
              <span className="text-foreground/50 font-medium">·</span>
              <span className="text-foreground/80 font-medium">{trade.quantity} Qty</span>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end w-full md:w-auto">
            <div className={`text-4xl font-bold ${isWin ? "text-success" : isLoss ? "text-danger" : ""}`}>
              {isWin ? "+" : ""}{formatCurrency(trade.pnl)}
            </div>
          </div>
        </div>

        {/* Top Section: Screenshot & Journal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Screenshot (Left on Desktop) */}
          <div className="order-2 md:order-1">
            <h3 className="text-sm font-semibold tracking-widest text-foreground/50 uppercase mb-4">Screenshot</h3>
            {trade.screenshot ? (
              <div className="bg-card border border-border rounded-xl overflow-hidden group">
                <div className="relative aspect-video bg-black/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={trade.screenshot} 
                    alt="Trade Screenshot" 
                    className="w-full h-full object-contain"
                  />
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <a 
                      href={trade.screenshot} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium backdrop-blur-md transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Full
                    </a>
                    <button 
                      onClick={handleRemoveScreenshot}
                      className="flex items-center gap-2 bg-danger/80 hover:bg-danger text-white px-4 py-2 rounded-lg font-medium backdrop-blur-md transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card/30 border border-dashed border-border/50 rounded-xl p-8 aspect-video flex flex-col items-center justify-center">
                <ImageIcon className="w-8 h-8 text-foreground/30 mb-3" />
                <p className="text-foreground/60 mb-2">No screenshot attached</p>
                <Link 
                  href={`/add-trade?id=${trade.id}`}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Edit trade to add
                </Link>
              </div>
            )}
          </div>

          {/* Journal (Right on Desktop) */}
          <div className="order-1 md:order-2">
            <h3 className="text-sm font-semibold tracking-widest text-foreground/50 uppercase mb-4">Journal</h3>
            {trade.quickNote ? (
              <div className="bg-card/50 border border-border rounded-xl p-6 text-foreground/90 whitespace-pre-wrap leading-relaxed h-full">
                <span className="opacity-60 text-2xl font-serif mr-2">"</span>
                {trade.quickNote}
                <span className="opacity-60 text-2xl font-serif ml-2">"</span>
              </div>
            ) : (
              <div className="bg-card/30 border border-dashed border-border/50 rounded-xl p-8 flex flex-col items-center justify-center h-full">
                <p className="text-foreground/60 mb-2">No journal written</p>
                <Link 
                  href={`/add-trade?id=${trade.id}`}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Edit trade to write journal
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Below Top Section: Context, Details, Reflection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Trade Context */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold tracking-widest text-foreground/50 uppercase border-b border-border/50 pb-2">Trade Context</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-foreground/60 text-sm">Strategy</span>
                <span className="font-medium text-lg">{trade.strategyId || "—"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-foreground/60 text-sm">Setup</span>
                <span className="font-medium text-lg">{trade.tradeSetup || "—"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-foreground/60 text-sm">Emotion</span>
                <span className="font-medium text-lg">{trade.emotion || "—"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-foreground/60 text-sm">Market Condition</span>
                <span className="font-medium text-lg">{trade.marketCondition || "—"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-foreground/60 text-sm">Plan Followed?</span>
                <span className={`font-medium text-lg ${trade.planFollowed === true ? 'text-success' : trade.planFollowed === false ? 'text-danger' : ''}`}>
                  {trade.planFollowed === true ? "✓ Yes" : trade.planFollowed === false ? "✗ No" : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Trade Details */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold tracking-widest text-foreground/50 uppercase border-b border-border/50 pb-2">Trade Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-foreground/60 text-sm">Entry Price</span>
                <span className="font-medium">{formatCurrency(trade.entryPrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground/60 text-sm">Exit Price</span>
                <span className="font-medium">{formatCurrency(trade.exitPrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground/60 text-sm">Stop Loss</span>
                <span className="font-medium">{trade.stopLoss ? formatCurrency(trade.stopLoss) : "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground/60 text-sm">Target</span>
                <span className="font-medium">{trade.target ? formatCurrency(trade.target) : "—"}</span>
              </div>
              {riskReward && (
                <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg border border-white/10 mt-2">
                  <span className="text-foreground/60 text-sm">Risk / Reward</span>
                  <span className="font-medium">{riskReward}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reflection */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold tracking-widest text-foreground/50 uppercase border-b border-border/50 pb-2">Reflection</h3>
            {(!trade.whatWentWell && !trade.whatWentWrong && !trade.lesson) ? (
              <p className="text-foreground/50 text-sm italic">No reflection added.</p>
            ) : (
              <div className="space-y-5">
                {trade.whatWentWell && (
                  <div>
                    <div className="text-success/80 mb-1 text-sm font-medium flex items-center gap-1">
                      <span>✓</span> What went well?
                    </div>
                    <div className="text-foreground/90 bg-success/5 p-3 rounded-lg border border-success/10">{trade.whatWentWell}</div>
                  </div>
                )}
                
                {trade.whatWentWrong && (
                  <div>
                    <div className="text-danger/80 mb-1 text-sm font-medium flex items-center gap-1">
                      <span>✗</span> What went wrong?
                    </div>
                    <div className="text-foreground/90 bg-danger/5 p-3 rounded-lg border border-danger/10">{trade.whatWentWrong}</div>
                  </div>
                )}

                {trade.lesson && (
                  <div>
                    <div className="text-primary/80 mb-1 text-sm font-medium flex items-center gap-1">
                      <span>💡</span> Lesson
                    </div>
                    <div className="text-foreground/90 bg-primary/5 p-3 rounded-lg border border-primary/10">{trade.lesson}</div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
