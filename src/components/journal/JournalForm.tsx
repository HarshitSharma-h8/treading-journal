"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, AlertTriangle, Plus, Trash2 } from "lucide-react";

interface TradeEntry {
  id: string; // client-side only id for keying
  symbol: string;
  direction: string;
  tradeType: string;
  quantity: string | number;
  entryPrice: string | number;
  exitPrice: string | number;
  stopLoss: string | number;
  target: string | number;
  exitReason: string;
}

interface JournalEntryData {
  id?: string;
  entryDate: string;
  followedTradingPlan?: string | null;
  executionQuality?: string | null;
  whatDidWell?: string | null;
  biggestMistake?: string | null;
  emotionalTrade?: string | null;
  emotionalTradeOther?: string | null;
  followedRiskManagement?: string | null;
  tomorrowLesson?: string | null;
  trades?: any[];
}

interface JournalFormProps {
  initialData?: JournalEntryData;
  isEdit?: boolean;
}

export default function JournalForm({ initialData, isEdit = false }: JournalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultDate = initialData?.entryDate 
    ? new Date(initialData.entryDate).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];

  const [journalDate, setJournalDate] = useState(defaultDate);

  // Journal Reflection State
  const [followedTradingPlan, setFollowedTradingPlan] = useState(initialData?.followedTradingPlan || "");
  const [executionQuality, setExecutionQuality] = useState(initialData?.executionQuality || "");
  const [whatDidWell, setWhatDidWell] = useState(initialData?.whatDidWell || "");
  const [biggestMistake, setBiggestMistake] = useState(initialData?.biggestMistake || "");
  const [emotionalTrade, setEmotionalTrade] = useState(initialData?.emotionalTrade || "");
  const [emotionalTradeOther, setEmotionalTradeOther] = useState(initialData?.emotionalTradeOther || "");
  const [followedRiskManagement, setFollowedRiskManagement] = useState(initialData?.followedRiskManagement || "");
  const [tomorrowLesson, setTomorrowLesson] = useState(initialData?.tomorrowLesson || "");

  // Trades state
  const generateTempId = () => Math.random().toString(36).substr(2, 9);
  
  const [trades, setTrades] = useState<TradeEntry[]>(
    initialData?.trades?.map(t => ({
      id: t.id || generateTempId(),
      symbol: t.symbol || "",
      direction: t.direction || "BUY",
      tradeType: t.tradeType || "INTRADAY",
      quantity: t.quantity || "",
      entryPrice: t.entryPrice || "",
      exitPrice: t.exitPrice || "",
      stopLoss: t.stopLoss || "",
      target: t.target || "",
      exitReason: t.exitReason || "MANUAL"
    })) || []
  );

  const handleAddTrade = () => {
    setTrades([...trades, {
      id: generateTempId(),
      symbol: "",
      direction: "BUY",
      tradeType: "INTRADAY",
      quantity: "",
      entryPrice: "",
      exitPrice: "",
      stopLoss: "",
      target: "",
      exitReason: "MANUAL"
    }]);
  };

  const handleRemoveTrade = (id: string) => {
    setTrades(trades.filter(t => t.id !== id));
  };

  const handleTradeEdit = (id: string, field: string, value: any) => {
    setTrades((prev) => prev.map((t) => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const parseTradeDate = (timeStr: any, baseDate: string) => {
      if (!timeStr) return new Date(baseDate || new Date()).toISOString();
      const timeStrStr = String(timeStr);
      const direct = new Date(timeStrStr);
      if (!isNaN(direct.getTime())) return direct.toISOString();
      const withT = new Date(`${baseDate}T${timeStrStr}`);
      if (!isNaN(withT.getTime())) return withT.toISOString();
      const withSpace = new Date(`${baseDate} ${timeStrStr}`);
      if (!isNaN(withSpace.getTime())) return withSpace.toISOString();
      return new Date(baseDate || new Date()).toISOString();
    };

    try {
      const payload = {
        date: journalDate,
        followedTradingPlan: followedTradingPlan || undefined,
        executionQuality: executionQuality || undefined,
        whatDidWell: whatDidWell || undefined,
        biggestMistake: biggestMistake || undefined,
        emotionalTrade: emotionalTrade || undefined,
        emotionalTradeOther: emotionalTrade === "OTHER" ? emotionalTradeOther : undefined,
        followedRiskManagement: followedRiskManagement || undefined,
        tomorrowLesson: tomorrowLesson || undefined,
        status: (followedTradingPlan && executionQuality && whatDidWell && biggestMistake) ? "COMPLETED" : "DRAFT",

        trades: trades.map((t) => ({
          symbol: t.symbol,
          tradeType: t.tradeType || "INTRADAY",
          direction: t.direction || "BUY",
          quantity: Number(t.quantity) || 1,
          entryPrice: Number(t.entryPrice) || 0,
          exitPrice: Number(t.exitPrice) || 0,
          entryTime: parseTradeDate(null, journalDate),
          exitTime: parseTradeDate(null, journalDate),
          stopLoss: t.stopLoss ? Number(t.stopLoss) : undefined,
          target: t.target ? Number(t.target) : undefined,
          exitReason: t.exitReason || "MANUAL",
          source: "MANUAL",
        }))
      };
      
      const url = isEdit ? `/api/journal/${initialData?.id}` : `/api/journal`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        const detailMsg = errorData.details ? (typeof errorData.details === 'string' ? errorData.details : JSON.stringify(errorData.details)) : "";
        throw new Error((errorData.error || "Failed to save journal and trades.") + (detailMsg ? ` Details: ${detailMsg}` : ""));
      }
      
      router.push("/journal");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {error && (
        <div className="bg-danger/10 text-danger p-4 rounded-lg flex items-center gap-3 mb-6">
          <AlertTriangle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* TRADES SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Trades</h2>
          {!isEdit && (
            <button 
              onClick={handleAddTrade}
              className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Trade
            </button>
          )}
        </div>
        
        {trades.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-foreground/50 text-sm">
            No trades added yet. Click "Add Trade" to log your trades for the day.
          </div>
        ) : (
          trades.map((trade, index) => (
            <div key={trade.id} className="bg-card border border-border rounded-xl p-6 relative">
              {!isEdit && (
                <button 
                  onClick={() => handleRemoveTrade(trade.id)}
                  className="absolute top-4 right-4 text-danger/60 hover:text-danger bg-danger/10 p-2 rounded-lg transition-colors"
                  title="Remove trade"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <h3 className="text-lg font-bold mb-4">Trade {index + 1}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground/50 uppercase">Symbol</label>
                  <input 
                    type="text" 
                    value={trade.symbol} 
                    onChange={(e) => handleTradeEdit(trade.id, 'symbol', e.target.value.toUpperCase())}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary uppercase"
                    placeholder="e.g. NIFTY50"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground/50 uppercase">Direction</label>
                  <select 
                    value={trade.direction}
                    onChange={(e) => handleTradeEdit(trade.id, 'direction', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground/50 uppercase">Trade Type</label>
                  <select 
                    value={trade.tradeType}
                    onChange={(e) => handleTradeEdit(trade.id, 'tradeType', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="INTRADAY">INTRADAY</option>
                    <option value="DELIVERY">DELIVERY</option>
                    <option value="SWING">SWING</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground/50 uppercase">Quantity</label>
                  <input 
                    type="number" 
                    value={trade.quantity} 
                    onChange={(e) => handleTradeEdit(trade.id, 'quantity', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground/50 uppercase">Entry Price</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={trade.entryPrice} 
                    onChange={(e) => handleTradeEdit(trade.id, 'entryPrice', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground/50 uppercase">Exit Price</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={trade.exitPrice} 
                    onChange={(e) => handleTradeEdit(trade.id, 'exitPrice', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground/50 uppercase">Stop Loss</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={trade.stopLoss || ""} 
                    onChange={(e) => handleTradeEdit(trade.id, 'stopLoss', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground/50 uppercase">Target</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={trade.target || ""} 
                    onChange={(e) => handleTradeEdit(trade.id, 'target', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground/50 uppercase">Exit Reason</label>
                  <select 
                    value={trade.exitReason}
                    onChange={(e) => handleTradeEdit(trade.id, 'exitReason', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="TARGET">Target</option>
                    <option value="STOP_LOSS">Stop Loss</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* REFLECTION SECTION */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Daily Reflection</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/50 uppercase">Date</label>
            <input 
              type="date" 
              value={journalDate} 
              onChange={(e) => setJournalDate(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              disabled={isEdit}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/50 uppercase">1. Did you follow your trading plan today?</label>
            <select value={followedTradingPlan} onChange={(e) => setFollowedTradingPlan(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="">Select...</option>
              <option value="YES">Yes</option>
              <option value="PARTIALLY">Partially</option>
              <option value="NO">No</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/50 uppercase">2. How was your overall execution?</label>
            <select value={executionQuality} onChange={(e) => setExecutionQuality(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="">Select...</option>
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="AVERAGE">Average</option>
              <option value="POOR">Poor</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/50 uppercase">3. What did you do well today?</label>
            <textarea value={whatDidWell} onChange={(e) => setWhatDidWell(e.target.value)} maxLength={500} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-y" rows={2}></textarea>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/50 uppercase">4. What was your biggest mistake today?</label>
            <textarea value={biggestMistake} onChange={(e) => setBiggestMistake(e.target.value)} maxLength={500} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-y" rows={2}></textarea>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/50 uppercase">5. Did you take any emotional/unplanned trades?</label>
            <select value={emotionalTrade} onChange={(e) => setEmotionalTrade(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="">Select...</option>
              <option value="NO">No</option>
              <option value="FOMO">FOMO</option>
              <option value="REVENGE">Revenge</option>
              <option value="OVERTRADING">Overtrading</option>
              <option value="FEAR">Fear</option>
              <option value="GREED">Greed</option>
              <option value="OTHER">Other</option>
            </select>
            {emotionalTrade === "OTHER" && (
              <input type="text" placeholder="Please specify..." value={emotionalTradeOther} onChange={(e) => setEmotionalTradeOther(e.target.value)} maxLength={100} className="mt-2 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/50 uppercase">6. Did you follow your risk management rules?</label>
            <select value={followedRiskManagement} onChange={(e) => setFollowedRiskManagement(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="">Select...</option>
              <option value="YES">Yes</option>
              <option value="NO">No</option>
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold text-foreground/50 uppercase">7. What is the ONE lesson you will carry into tomorrow?</label>
            <textarea value={tomorrowLesson} onChange={(e) => setTomorrowLesson(e.target.value)} maxLength={500} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-y" rows={2}></textarea>
          </div>

        </div>
      </div>
      
      <div className="flex justify-end gap-4">
        <button 
          onClick={() => router.back()}
          className="bg-card border border-border text-foreground px-6 py-3 rounded-lg font-bold hover:bg-white/5 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="bg-primary text-background px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow"
        >
          {loading ? "Saving..." : "Save Journal"}
          {!loading && <Save className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
