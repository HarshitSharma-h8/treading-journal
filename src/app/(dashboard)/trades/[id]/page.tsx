"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, X } from "lucide-react";
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

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10 max-w-4xl">
        <div className="mb-6">
          <Link href="/trades" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Trades
          </Link>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <div className="text-sm font-semibold tracking-wider text-primary mb-1 uppercase">TRADE</div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{trade.symbol}</h1>
            <div className="flex flex-wrap items-center gap-3 text-foreground/70">
              <span>
                {new Date(trade.tradeDate).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                trade.tradeType === "BUY" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
              }`}>
                {trade.tradeType}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end w-full md:w-auto">
            <div className="text-sm font-medium text-foreground/60 mb-1">Total P&L</div>
            <div className={`text-4xl font-bold ${isWin ? "text-success" : isLoss ? "text-danger" : ""}`}>
              {isWin ? "+" : ""}{formatCurrency(trade.pnl)}
            </div>
          </div>
        </div>

        {/* Primary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="text-sm text-foreground/60 mb-2">Entry Price</div>
            <div className="text-xl font-semibold">{formatCurrency(trade.entryPrice)}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="text-sm text-foreground/60 mb-2">Exit Price</div>
            <div className="text-xl font-semibold">{formatCurrency(trade.exitPrice)}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="text-sm text-foreground/60 mb-2">Quantity</div>
            <div className="text-xl font-semibold">{trade.quantity}</div>
          </div>
          {riskReward && (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="text-sm text-foreground/60 mb-2">Risk / Reward</div>
              <div className="text-xl font-semibold">{riskReward}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Detailed Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b border-border pb-2">Information</h3>
            
            <div className="space-y-4">
              {trade.strategyId && (
                <div className="flex justify-between border-b border-border/50 pb-3">
                  <span className="text-foreground/60">Strategy</span>
                  <span className="font-medium text-right">{trade.strategyId}</span>
                </div>
              )}
              {trade.marketCondition && (
                <div className="flex justify-between border-b border-border/50 pb-3">
                  <span className="text-foreground/60">Market Condition</span>
                  <span className="font-medium text-right">{trade.marketCondition}</span>
                </div>
              )}
              {trade.tradeSetup && (
                <div className="flex justify-between border-b border-border/50 pb-3">
                  <span className="text-foreground/60">Trade Setup</span>
                  <span className="font-medium text-right">{trade.tradeSetup}</span>
                </div>
              )}
              {trade.emotion && (
                <div className="flex justify-between border-b border-border/50 pb-3">
                  <span className="text-foreground/60">Emotion</span>
                  <span className="font-medium text-right">{trade.emotion}</span>
                </div>
              )}
              {trade.stopLoss !== null && trade.stopLoss !== undefined && (
                <div className="flex justify-between border-b border-border/50 pb-3">
                  <span className="text-foreground/60">Stop Loss</span>
                  <span className="font-medium text-right">{formatCurrency(trade.stopLoss)}</span>
                </div>
              )}
              {trade.target !== null && trade.target !== undefined && (
                <div className="flex justify-between border-b border-border/50 pb-3">
                  <span className="text-foreground/60">Target</span>
                  <span className="font-medium text-right">{formatCurrency(trade.target)}</span>
                </div>
              )}
              {trade.planFollowed !== null && trade.planFollowed !== undefined && (
                <div className="flex justify-between border-b border-border/50 pb-3">
                  <span className="text-foreground/60">Plan</span>
                  <span className="font-medium text-right">
                    {trade.planFollowed ? "✓ Followed" : "✗ Not followed"}
                  </span>
                </div>
              )}
            </div>

            {trade.quickNote && (
              <div className="mt-6">
                <div className="text-foreground/60 mb-2 font-medium">Quick Note</div>
                <div className="bg-card/50 border border-border rounded-xl p-4 text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {trade.quickNote}
                </div>
              </div>
            )}

            {(trade.whatWentWell || trade.whatWentWrong || trade.lesson) && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold border-b border-border pb-2">Reflection</h3>
                
                {trade.whatWentWell && (
                  <div>
                    <div className="text-foreground/60 mb-1 text-sm font-medium">What went well?</div>
                    <div className="text-foreground/90">{trade.whatWentWell}</div>
                  </div>
                )}
                
                {trade.whatWentWrong && (
                  <div>
                    <div className="text-foreground/60 mb-1 text-sm font-medium">What went wrong?</div>
                    <div className="text-foreground/90">{trade.whatWentWrong}</div>
                  </div>
                )}

                {trade.lesson && (
                  <div>
                    <div className="text-foreground/60 mb-1 text-sm font-medium">Lesson</div>
                    <div className="text-foreground/90">{trade.lesson}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Screenshot */}
          <div>
            <h3 className="text-xl font-semibold border-b border-border pb-2 mb-6">Screenshot</h3>
            
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
              <div className="bg-card/30 border border-dashed border-border/50 rounded-xl p-8 text-center flex flex-col items-center justify-center">
                <p className="text-foreground/60 mb-4">No screenshot attached</p>
                <Link 
                  href={`/add-trade?id=${trade.id}`}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Edit trade to add a screenshot
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border pt-8 flex justify-between items-center">
          <TradeActions tradeId={trade.id} />
        </div>
      </main>
    </div>
  );
}
