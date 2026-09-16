"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Save, AlertTriangle, ArrowRight } from "lucide-react";

export default function ImportTradesPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  
  const [journalDate, setJournalDate] = useState(new Date().toISOString().split("T")[0]);

  // Journal Reflection State
  const [followedTradingPlan, setFollowedTradingPlan] = useState("");
  const [executionQuality, setExecutionQuality] = useState("");
  const [whatDidWell, setWhatDidWell] = useState("");
  const [biggestMistake, setBiggestMistake] = useState("");
  const [emotionalTrade, setEmotionalTrade] = useState("");
  const [emotionalTradeOther, setEmotionalTradeOther] = useState("");
  const [followedRiskManagement, setFollowedRiskManagement] = useState("");
  const [tomorrowLesson, setTomorrowLesson] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    
    setIsExtracting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("image", file);
      
      const res = await fetch("/api/journal/extract", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to extract trades.");
      }
      
      setExtractedData(data);
      if (data.journal?.date) {
        setJournalDate(data.journal.date);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong during extraction.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleTradeEdit = (id: string, field: string, value: any) => {
    setExtractedData((prev: any) => ({
      ...prev,
      trades: prev.trades.map((t: any) => 
        t.id === id ? { ...t, [field]: value } : t
      )
    }));
  };

  const handleSave = async () => {
    if (!extractedData || extractedData.trades.length === 0) return;
    
    setIsSaving(true);
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

        trades: extractedData.trades.map((t: any) => {
          const parsedEntry = parseTradeDate(t.entryTime, journalDate);
          let parsedExit = t.exitTime ? parseTradeDate(t.exitTime, journalDate) : parsedEntry;
          
          if (new Date(parsedExit).getTime() < new Date(parsedEntry).getTime()) {
            parsedExit = parsedEntry;
          }

          return {
            symbol: t.symbol,
            tradeType: t.tradeType || "INTRADAY",
            direction: t.direction || "BUY",
            quantity: Number(t.quantity) || 1,
            entryPrice: Number(t.entryPrice) || 0,
            exitPrice: Number(t.exitPrice) || 0,
            entryTime: parsedEntry,
            exitTime: parsedExit,
            stopLoss: t.stopLoss ? Number(t.stopLoss) : undefined,
            target: t.target ? Number(t.target) : undefined,
            exitReason: t.exitReason || "MANUAL",
            source: t.source || "SCREENSHOT",
            setupStrategy: t.setupStrategy || undefined,
            tradeNote: t.tradeNote || undefined,
          };
        })
      };
      
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        const detailMsg = errorData.details ? (typeof errorData.details === 'string' ? errorData.details : JSON.stringify(errorData.details)) : "";
        throw new Error((errorData.error || "Failed to save journal and trades.") + (detailMsg ? ` Details: ${detailMsg}` : ""));
      }
      
      router.push("/journal");
    } catch (err: any) {
      setError(err.message || "Failed to save.");
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl pb-20">
      <h1 className="text-3xl font-bold tracking-tight mb-6">IMPORT TRADES</h1>
      
      {error && (
        <div className="bg-danger/10 text-danger p-4 rounded-lg flex items-center gap-3 mb-6">
          <AlertTriangle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {!extractedData ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center space-y-6">
          <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Upload Screenshot</h2>
            <p className="text-foreground/60 max-w-md mx-auto">
              Upload a screenshot of your order history. Our AI will extract the executed trades automatically.
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <label className="cursor-pointer bg-card border border-border text-foreground px-6 py-3 rounded-lg font-semibold hover:border-primary/50 transition-colors inline-block">
              Select Image
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
            
            {file && (
              <div className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <span>{file.name}</span>
                <button onClick={() => setFile(null)} className="text-danger hover:text-danger/80">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <button
              onClick={handleExtract}
              disabled={!file || isExtracting}
              className="bg-primary text-background px-8 py-3 rounded-lg font-bold disabled:opacity-50 flex items-center gap-2 mt-4"
            >
              {isExtracting ? "Extracting..." : "Extract Trades"}
              {!isExtracting && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-success/10 text-success p-4 rounded-lg">
            Successfully extracted {extractedData.trades?.length || 0} trades. Please review and edit them below before saving.
          </div>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Review Imported Trades</h2>
            
            {extractedData.trades?.map((trade: any, index: number) => (
              <div key={trade.id || index} className="bg-card border border-border rounded-xl p-6 relative">
                <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1 rounded-bl-lg rounded-tr-xl text-xs font-bold">
                  Imported from screenshot
                </div>
                
                <h3 className="text-lg font-bold mb-4">Trade {index + 1}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/50 uppercase">Symbol</label>
                    <input 
                      type="text" 
                      value={trade.symbol} 
                      onChange={(e) => handleTradeEdit(trade.id, 'symbol', e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
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
            ))}
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Daily Reflection (Optional)</h2>
            <p className="text-sm text-foreground/60 mb-6">You can answer these now or leave the journal as a draft and complete it later.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground/50 uppercase">Date</label>
                <input 
                  type="date" 
                  value={journalDate} 
                  onChange={(e) => setJournalDate(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
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
              onClick={() => setExtractedData(null)}
              className="bg-card border border-border text-foreground px-6 py-3 rounded-lg font-bold hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary text-background px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {isSaving ? "Saving..." : "Save Journal & Trades"}
              {!isSaving && <Save className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
