import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Emotion, MarketCondition } from "@/lib/types";

interface OptionalTradeDetailsProps {
  strategy: string;
  setStrategy: (v: string) => void;
  stopLoss: number | "";
  setStopLoss: (v: number | "") => void;
  target: number | "";
  setTarget: (v: number | "") => void;
  marketCondition: MarketCondition | "";
  setMarketCondition: (v: MarketCondition | "") => void;
  tradeSetup: string;
  setTradeSetup: (v: string) => void;
  emotion: Emotion | "";
  setEmotion: (v: Emotion | "") => void;
  notes: string;
  setNotes: (v: string) => void;
}

export function OptionalTradeDetails({
  strategy,
  setStrategy,
  stopLoss,
  setStopLoss,
  target,
  setTarget,
  marketCondition,
  setMarketCondition,
  tradeSetup,
  setTradeSetup,
  emotion,
  setEmotion,
  notes,
  setNotes,
}: OptionalTradeDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-sm font-medium hover:bg-white/5 transition-colors"
      >
        <span>Add more details</span>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">


          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Market Condition</label>
            <select
              value={marketCondition}
              onChange={(e) => setMarketCondition(e.target.value as MarketCondition | "")}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select condition...</option>
              <option value="Trending">Trending</option>
              <option value="Range">Range</option>
              <option value="Volatile">Volatile</option>
              <option value="Choppy">Choppy</option>
              <option value="Calm">Calm</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Stop Loss</label>
            <input
              type="number"
              step="any"
              min="0"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Target</label>
            <input
              type="number"
              step="any"
              min="0"
              value={target}
              onChange={(e) => setTarget(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Trade Setup</label>
            <input
              type="text"
              value={tradeSetup}
              onChange={(e) => setTradeSetup(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="E.g., Bull flag, Double bottom"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Emotion</label>
            <select
              value={emotion}
              onChange={(e) => setEmotion(e.target.value as Emotion | "")}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select emotion...</option>
              <option value="Calm">Calm</option>
              <option value="Confident">Confident</option>
              <option value="Fearful">Fearful</option>
              <option value="Greedy">Greedy</option>
              <option value="Frustrated">Frustrated</option>
              <option value="FOMO">FOMO</option>
              <option value="Revenge">Revenge</option>
              <option value="Neutral">Neutral</option>
            </select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-foreground/80">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px] resize-y"
              placeholder="What went well? What could be improved?"
            />
          </div>
        </div>
      )}
    </div>
  );
}
