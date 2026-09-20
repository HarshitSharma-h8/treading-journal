"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PnLPreview } from "./PnLPreview";
import { ScreenshotUploader } from "./ScreenshotUploader";
import { Direction, TradeTypeEnum, Trade } from "@/lib/types";
import { updateTrade, getTrade } from "@/lib/api/trades";
import { calculatePnL, calculateRiskReward } from "@/lib/trading-utils";
import { PenLine, Save } from "lucide-react";

export function TradeForm({ tradeId }: { tradeId?: string }) {
  const router = useRouter();

  // Primary fields
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [symbol, setSymbol] = useState("");
  const [direction, setDirection] = useState<Direction>("BUY");
  const [entryPrice, setEntryPrice] = useState<number | "">("");
  const [exitPrice, setExitPrice] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [tradeType, setTradeType] = useState<TradeTypeEnum>("INTRADAY");
  const [stopLoss, setStopLoss] = useState<number | "">("");
  const [target, setTarget] = useState<number | "">("");
  const [exitReason, setExitReason] = useState("MANUAL");

  // Additional fields
  const [tradeSetup, setTradeSetup] = useState("");
  const [tradeNote, setTradeNote] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);

  // Edit Mode Initialization
  useEffect(() => {
    if (tradeId) {
      async function fetchTrade(id: string) {
        try {
          const existingTrade = await getTrade(id);
          if (existingTrade) {
            if (existingTrade.entryTime) setDate(existingTrade.entryTime.split("T")[0] || "");
            setSymbol(existingTrade.symbol);
            setDirection(existingTrade.direction);
            setEntryPrice(existingTrade.entryPrice);
            setExitPrice(existingTrade.exitPrice);
            setQuantity(existingTrade.quantity);
            if (existingTrade.tradeType) setTradeType(existingTrade.tradeType);
            if (existingTrade.stopLoss) setStopLoss(existingTrade.stopLoss);
            if (existingTrade.target) setTarget(existingTrade.target);
            if (existingTrade.exitReason) setExitReason(existingTrade.exitReason);
            if (existingTrade.setupStrategy) setTradeSetup(existingTrade.setupStrategy);
            if (existingTrade.tradeNote) setTradeNote(existingTrade.tradeNote);
            if (existingTrade.screenshot) setScreenshot(existingTrade.screenshot);
          }
        } catch (err) {
          console.error("Failed to fetch trade", err);
        }
      }
      fetchTrade(tradeId);
    }
  }, [tradeId]);

  // Validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (touched.symbol && !symbol.trim()) errs.symbol = "Symbol is required";
    if (touched.entryPrice && (entryPrice === "" || entryPrice <= 0)) errs.entryPrice = "Must be > 0";
    if (touched.exitPrice && (exitPrice === "" || exitPrice <= 0)) errs.exitPrice = "Must be > 0";
    if (touched.quantity && (quantity === "" || quantity <= 0)) errs.quantity = "Must be > 0";
    return errs;
  }, [symbol, entryPrice, exitPrice, quantity, touched]);

  const isValid = 
    symbol.trim().length > 0 &&
    entryPrice !== "" && entryPrice > 0 &&
    exitPrice !== "" && exitPrice > 0 &&
    quantity !== "" && quantity > 0 &&
    Object.keys(errors).length === 0;

  const currentPnL = useMemo(() => {
    if (entryPrice === "" || exitPrice === "" || quantity === "") return null;
    return calculatePnL(direction, entryPrice, exitPrice, quantity);
  }, [direction, entryPrice, exitPrice, quantity]);

  const riskReward = useMemo(() => {
    if (entryPrice === "" || stopLoss === "" || target === "") return null;
    return calculateRiskReward(direction, entryPrice, stopLoss, target);
  }, [direction, entryPrice, stopLoss, target]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!isValid || isSaving || !tradeId) return;

    setIsSaving(true);
    // Important: we do not send journalId to preserve the existing journal association
    const newTrade: Partial<Trade> = {
      entryTime: new Date(date).toISOString(),
      exitTime: new Date(date).toISOString(), // Same day by default
      symbol: symbol.trim().toUpperCase(),
      direction,
      tradeType,
      entryPrice: entryPrice as number,
      exitPrice: exitPrice as number,
      quantity: quantity as number,
      exitReason: exitReason,
      stopLoss: stopLoss as number || undefined,
      target: target as number || undefined,
      setupStrategy: tradeSetup,
      tradeNote: tradeNote,
      screenshot: screenshot || undefined,
    };

    try {
      await updateTrade(tradeId, newTrade);
      router.push(`/trades/${tradeId}`);
      router.refresh();
    } catch (err) {
      console.error("Failed to save trade:", err);
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-20">
      <div className="bg-card border border-border rounded-xl p-6 relative">
        <h3 className="text-lg font-bold mb-4">Edit Trade</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/50 uppercase">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/50 uppercase">Symbol <span className="text-danger">*</span></label>
            <input 
              type="text" 
              value={symbol} 
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onBlur={() => setTouched({ ...touched, symbol: true })}
              className={`w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary uppercase ${errors.symbol ? 'border-danger' : 'border-border'}`}
              placeholder="e.g. NIFTY50"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/50 uppercase">Direction <span className="text-danger">*</span></label>
            <select 
              value={direction}
              onChange={(e) => setDirection(e.target.value as Direction)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/50 uppercase">Trade Type <span className="text-danger">*</span></label>
            <select 
              value={tradeType}
              onChange={(e) => setTradeType(e.target.value as TradeTypeEnum)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              <option value="INTRADAY">INTRADAY</option>
              <option value="DELIVERY">DELIVERY</option>
              <option value="SWING">SWING</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/50 uppercase">Quantity <span className="text-danger">*</span></label>
            <input 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : "")}
              onBlur={() => setTouched({ ...touched, quantity: true })}
              className={`w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary ${errors.quantity ? 'border-danger' : 'border-border'}`}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/50 uppercase">Entry Price <span className="text-danger">*</span></label>
            <input 
              type="number" 
              step="any"
              min="0"
              value={entryPrice} 
              onChange={(e) => setEntryPrice(e.target.value ? Number(e.target.value) : "")}
              onBlur={() => setTouched({ ...touched, entryPrice: true })}
              className={`w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary ${errors.entryPrice ? 'border-danger' : 'border-border'}`}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/50 uppercase">Exit Price <span className="text-danger">*</span></label>
            <input 
              type="number" 
              step="any"
              min="0"
              value={exitPrice} 
              onChange={(e) => setExitPrice(e.target.value ? Number(e.target.value) : "")}
              onBlur={() => setTouched({ ...touched, exitPrice: true })}
              className={`w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary ${errors.exitPrice ? 'border-danger' : 'border-border'}`}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/50 uppercase">Stop Loss</label>
            <input 
              type="number" 
              step="any"
              min="0"
              value={stopLoss} 
              onChange={(e) => setStopLoss(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/50 uppercase">Target</label>
            <input 
              type="number" 
              step="any"
              min="0"
              value={target} 
              onChange={(e) => setTarget(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/50 uppercase">Exit Reason</label>
            <select 
              value={exitReason}
              onChange={(e) => setExitReason(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              <option value="TARGET">Target</option>
              <option value="STOP_LOSS">Stop Loss</option>
              <option value="MANUAL">Manual</option>
            </select>
          </div>
        </div>

        {riskReward && (
          <div className="mt-4 flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3 px-4 w-full md:w-1/2">
            <span className="text-sm font-medium text-foreground/70">Risk / Reward</span>
            <span className="text-sm font-bold font-mono">{riskReward}</span>
          </div>
        )}

        <div className="mt-6">
          <PnLPreview pnl={currentPnL} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <h3 className="text-lg font-bold">Trade Details</h3>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground/50 uppercase">Setup / Strategy</label>
          <input
            type="text"
            value={tradeSetup}
            onChange={(e) => setTradeSetup(e.target.value)}
            placeholder="e.g. Breakout, Pullback"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <PenLine className="w-4 h-4 text-primary" />
            <label className="text-xs font-semibold text-foreground/50 uppercase">Trade Notes</label>
          </div>
          <textarea
            value={tradeNote}
            onChange={(e) => setTradeNote(e.target.value)}
            placeholder="What were you thinking when you took this trade?"
            className="w-full bg-background border border-border rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-primary resize-y min-h-[100px]"
            maxLength={2000}
          />
        </div>
      </div>

      <ScreenshotUploader onImageChange={setScreenshot} />

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-0 sm:p-0 z-50 flex justify-end gap-4">
        <button 
          type="button"
          onClick={() => router.back()}
          className="bg-card border border-border text-foreground px-6 py-3 rounded-lg font-bold hover:bg-white/5 transition-colors"
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid || isSaving || !tradeId}
          className="bg-primary text-background px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Trade"}
          {!isSaving && <Save className="w-5 h-5" />}
        </button>
      </div>

    </div>
  );
}

