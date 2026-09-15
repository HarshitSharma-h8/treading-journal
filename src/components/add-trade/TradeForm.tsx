"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TradeTypeSelector } from "./TradeTypeSelector";
import { PnLPreview } from "./PnLPreview";
import { TradeContextSection } from "./TradeContextSection";
import { PostTradeReflection } from "./PostTradeReflection";
import { ScreenshotUploader } from "./ScreenshotUploader";
import { TradeType, Emotion, MarketCondition, Trade } from "@/lib/types";
import { createTrade, updateTrade, getTrade } from "@/lib/api/trades";
import { calculatePnL, calculateRiskReward } from "@/lib/trading-utils";
import { useEffect } from "react";
import { PenLine } from "lucide-react";

export function TradeForm({ tradeId }: { tradeId?: string }) {
  const router = useRouter();

  // Primary fields
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [symbol, setSymbol] = useState("");
  const [tradeType, setTradeType] = useState<TradeType>("BUY");
  const [entryPrice, setEntryPrice] = useState<number | "">("");
  const [exitPrice, setExitPrice] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [tradeStyle, setTradeStyle] = useState<string>("INTRADAY");

  // Optional fields
  const [strategy, setStrategy] = useState("");
  const [stopLoss, setStopLoss] = useState<number | "">("");
  const [target, setTarget] = useState<number | "">("");
  const [marketCondition, setMarketCondition] = useState<MarketCondition | "">("");
  const [tradeSetup, setTradeSetup] = useState("");
  const [emotion, setEmotion] = useState<Emotion | "">("");
  const [planFollowed, setPlanFollowed] = useState<boolean | null>(null);
  const [quickNote, setQuickNote] = useState("");
  const [whatWentWell, setWhatWentWell] = useState("");
  const [whatWentWrong, setWhatWentWrong] = useState("");
  const [lesson, setLesson] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);

  // Edit Mode Initialization
  useEffect(() => {
    if (tradeId) {
      async function fetchTrade(id: string) {
        try {
          const existingTrade = await getTrade(id);
          if (existingTrade) {
            if (existingTrade.tradeDate) setDate(existingTrade.tradeDate.split("T")[0] || "");
            setSymbol(existingTrade.symbol);
            setTradeType(existingTrade.tradeType);
            setEntryPrice(existingTrade.entryPrice);
            setExitPrice(existingTrade.exitPrice);
            setQuantity(existingTrade.quantity);
            if (existingTrade.tradeStyle) setTradeStyle(existingTrade.tradeStyle);
            if (existingTrade.strategyId) setStrategy(existingTrade.strategyId);
            if (existingTrade.stopLoss) setStopLoss(existingTrade.stopLoss);
            if (existingTrade.target) setTarget(existingTrade.target);
            if (existingTrade.marketCondition) setMarketCondition(existingTrade.marketCondition);
            if (existingTrade.tradeSetup) setTradeSetup(existingTrade.tradeSetup);
            if (existingTrade.emotion) setEmotion(existingTrade.emotion);
            if (existingTrade.planFollowed !== undefined && existingTrade.planFollowed !== null) setPlanFollowed(existingTrade.planFollowed);
            if (existingTrade.quickNote) setQuickNote(existingTrade.quickNote);
            if (existingTrade.whatWentWell) setWhatWentWell(existingTrade.whatWentWell);
            if (existingTrade.whatWentWrong) setWhatWentWrong(existingTrade.whatWentWrong);
            if (existingTrade.lesson) setLesson(existingTrade.lesson);
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
    return calculatePnL(tradeType, entryPrice, exitPrice, quantity);
  }, [tradeType, entryPrice, exitPrice, quantity]);

  const riskReward = useMemo(() => {
    if (entryPrice === "" || stopLoss === "" || target === "") return null;
    return calculateRiskReward(tradeType, entryPrice, stopLoss, target);
  }, [tradeType, entryPrice, stopLoss, target]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!isValid || isSaving) return;

    setIsSaving(true);
    const newTrade: Partial<Trade> = {
      tradeDate: new Date(date).toISOString(),
      symbol: symbol.trim().toUpperCase(),
      tradeType,
      entryPrice: entryPrice as number,
      exitPrice: exitPrice as number,
      quantity: quantity as number,
      tradeStyle,
      
      // Strategy is not yet supported in the backend properly (foreign key to Strategy table), so we don't send it.
      ...(stopLoss !== "" && { stopLoss: stopLoss as number }),
      ...(target !== "" && { target: target as number }),
      ...(marketCondition && { marketCondition }),
      ...(tradeSetup && { tradeSetup }),
      ...(emotion && { emotion }),
      ...(planFollowed !== null && { planFollowed }),
      ...(quickNote && { quickNote }),
      ...(whatWentWell && { whatWentWell }),
      ...(whatWentWrong && { whatWentWrong }),
      ...(lesson && { lesson }),
      ...(screenshot && { screenshot })
    };

    try {
      let savedTrade;
      if (tradeId) {
        savedTrade = await updateTrade(tradeId, newTrade);
      } else {
        savedTrade = await createTrade(newTrade);
      }
      
      router.push(`/trades/${savedTrade.id}`);
      router.refresh();
    } catch (err) {
      console.error("Failed to save trade:", err);
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 pb-20">
      
      {/* Primary Info */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Date <span className="text-danger">*</span></label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Symbol <span className="text-danger">*</span></label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onBlur={() => setTouched({ ...touched, symbol: true })}
              placeholder="e.g. NIFTY50"
              className={`w-full bg-card border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow uppercase
                ${errors.symbol ? 'border-danger' : 'border-border'}
              `}
            />
            {errors.symbol && <p className="text-danger text-xs">{errors.symbol}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Direction <span className="text-danger">*</span></label>
            <TradeTypeSelector value={tradeType} onChange={setTradeType} />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Trade Type <span className="text-danger">*</span></label>
            <select
              value={tradeStyle}
              onChange={(e) => setTradeStyle(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow appearance-none"
            >
              <option value="INTRADAY">Intraday</option>
              <option value="SWING">Swing</option>
              <option value="POSITIONAL">Positional</option>
              <option value="SCALPING">Scalping</option>
              <option value="DELIVERY">Delivery</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Entry Price <span className="text-danger">*</span></label>
            <input
              type="number"
              step="any"
              min="0"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value ? Number(e.target.value) : "")}
              onBlur={() => setTouched({ ...touched, entryPrice: true })}
              placeholder="0.00"
              className={`w-full bg-card border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow
                ${errors.entryPrice ? 'border-danger' : 'border-border'}
              `}
            />
            {errors.entryPrice && <p className="text-danger text-xs">{errors.entryPrice}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Exit Price <span className="text-danger">*</span></label>
            <input
              type="number"
              step="any"
              min="0"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value ? Number(e.target.value) : "")}
              onBlur={() => setTouched({ ...touched, exitPrice: true })}
              placeholder="0.00"
              className={`w-full bg-card border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow
                ${errors.exitPrice ? 'border-danger' : 'border-border'}
              `}
            />
            {errors.exitPrice && <p className="text-danger text-xs">{errors.exitPrice}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Quantity <span className="text-danger">*</span></label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : "")}
              onBlur={() => setTouched({ ...touched, quantity: true })}
              placeholder="0"
              className={`w-full bg-card border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow
                ${errors.quantity ? 'border-danger' : 'border-border'}
              `}
            />
            {errors.quantity && <p className="text-danger text-xs">{errors.quantity}</p>}
          </div>
        </div>

        {riskReward && (
          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3 px-4">
            <span className="text-sm font-medium text-foreground/70">Risk / Reward</span>
            <span className="text-sm font-bold font-mono">{riskReward}</span>
          </div>
        )}

        {/* Optional Stop Loss and Target embedded here to keep it out of context */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Stop Loss <span className="text-foreground/40 font-normal">(Optional)</span></label>
            <input
              type="number"
              step="any"
              min="0"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-card border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Target <span className="text-foreground/40 font-normal">(Optional)</span></label>
            <input
              type="number"
              step="any"
              min="0"
              value={target}
              onChange={(e) => setTarget(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-card border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="py-2">
          <PnLPreview pnl={currentPnL} />
        </div>
      </div>

      <TradeContextSection
        strategy={strategy}
        setStrategy={setStrategy}
        marketCondition={marketCondition}
        setMarketCondition={setMarketCondition}
        emotion={emotion}
        setEmotion={setEmotion}
        planFollowed={planFollowed}
        setPlanFollowed={setPlanFollowed}
        quickNote={quickNote}
        setQuickNote={setQuickNote}
        tradeSetup={tradeSetup}
        setTradeSetup={setTradeSetup}
      />

      {/* Journal Section */}
      <div className="space-y-6 mt-8">
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <PenLine className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm tracking-widest text-foreground/50 uppercase">Journal</h3>
        </div>
        
        <div className="space-y-2">
          <textarea
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            placeholder="What were you thinking when you took this trade?"
            className="w-full bg-card border border-border rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-y min-h-[120px] text-foreground/90 leading-relaxed"
            maxLength={2000}
          />
        </div>
      </div>

      <PostTradeReflection
        whatWentWell={whatWentWell}
        setWhatWentWell={setWhatWentWell}
        whatWentWrong={whatWentWrong}
        setWhatWentWrong={setWhatWentWrong}
        lesson={lesson}
        setLesson={setLesson}
      />

      <ScreenshotUploader onImageChange={setScreenshot} />

      {/* Save Button - Sticky on Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-0 sm:p-0 z-50">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid || isSaving}
          className="w-full sm:w-auto sm:ml-auto block bg-primary hover:bg-primary/90 text-background font-semibold py-3 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          {isSaving ? "Saving..." : "Save Trade"}
        </button>
      </div>

    </div>
  );
}
