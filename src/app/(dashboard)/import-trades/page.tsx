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
  
  const [journalContent, setJournalContent] = useState("");
  const [journalDate, setJournalDate] = useState(new Date().toISOString().split("T")[0]);

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
        entryDate: journalDate,
        marketThoughts: journalContent,
        trades: extractedData.trades.map((t: any) => ({
          symbol: t.symbol,
          tradeType: t.tradeType,
          quantity: Number(t.quantity),
          entryPrice: Number(t.entryPrice),
          exitPrice: Number(t.exitPrice),
          tradeStyle: t.tradeStyle,
          stopLoss: t.stopLoss ? Number(t.stopLoss) : undefined,
          target: t.target ? Number(t.target) : undefined,
          stopLossSource: t.stopLossSource,
          targetSource: t.targetSource,
          tradeDate: parseTradeDate(t.entryTime, journalDate)
        }))
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
                      value={trade.tradeType}
                      onChange={(e) => handleTradeEdit(trade.id, 'tradeType', e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="BUY">LONG</option>
                      <option value="SELL">SHORT</option>
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
                    <label className="text-xs font-semibold text-foreground/50 uppercase">Trade Type</label>
                    <select 
                      value={trade.tradeStyle || "INTRADAY"}
                      onChange={(e) => handleTradeEdit(trade.id, 'tradeStyle', e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="INTRADAY">Intraday</option>
                      <option value="SWING">Swing</option>
                      <option value="POSITIONAL">Positional</option>
                      <option value="SCALPING">Scalping</option>
                      <option value="DELIVERY">Delivery</option>
                    </select>
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
                      onChange={(e) => {
                        handleTradeEdit(trade.id, 'stopLoss', e.target.value);
                        handleTradeEdit(trade.id, 'stopLossSource', 'USER');
                      }}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      placeholder={trade.stopLossSource === "AUTO_FROM_EXIT" ? "Auto-generated" : ""}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/50 uppercase">Target</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={trade.target || ""} 
                      onChange={(e) => {
                        handleTradeEdit(trade.id, 'target', e.target.value);
                        handleTradeEdit(trade.id, 'targetSource', 'USER');
                      }}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      placeholder={trade.targetSource === "AUTO_FROM_EXIT" ? "Auto-generated" : ""}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Journal Entry</h2>
            
            <div className="space-y-4">
              <div className="space-y-1 max-w-xs">
                <label className="text-xs font-semibold text-foreground/50 uppercase">Date</label>
                <input 
                  type="date" 
                  value={journalDate} 
                  onChange={(e) => setJournalDate(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground/50 uppercase">What happened today?</label>
                <textarea 
                  value={journalContent} 
                  onChange={(e) => setJournalContent(e.target.value)}
                  rows={6}
                  placeholder="Describe your overall trading session, market conditions, and how you felt..."
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary resize-y"
                />
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
