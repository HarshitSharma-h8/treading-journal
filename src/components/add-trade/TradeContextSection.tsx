import { Emotion, MarketCondition } from "@/lib/types";

interface TradeContextSectionProps {
  strategy: string;
  setStrategy: (v: string) => void;
  marketCondition: MarketCondition | "";
  setMarketCondition: (v: MarketCondition | "") => void;
  emotion: Emotion | "";
  setEmotion: (v: Emotion | "") => void;
  planFollowed: boolean | null;
  setPlanFollowed: (v: boolean | null) => void;
  quickNote: string;
  setQuickNote: (v: string) => void;
  tradeSetup: string;
  setTradeSetup: (v: string) => void;
}

export function TradeContextSection({
  strategy,
  setStrategy,
  marketCondition,
  setMarketCondition,
  emotion,
  setEmotion,
  planFollowed,
  setPlanFollowed,
  quickNote,
  setQuickNote,
  tradeSetup,
  setTradeSetup,
}: TradeContextSectionProps) {
  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
        <h3 className="font-semibold text-sm tracking-widest text-foreground/50 uppercase">Trade Context</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Why did you take this trade? (Strategy)</label>
          <input
            type="text"
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="w-full bg-card border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            placeholder="e.g. Breakout"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Trade Setup <span className="text-danger">*</span></label>
          <input
            type="text"
            value={tradeSetup}
            onChange={(e) => setTradeSetup(e.target.value)}
            className="w-full bg-card border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            placeholder="e.g. Bull flag"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Market Condition</label>
          <select
            value={marketCondition}
            onChange={(e) => setMarketCondition(e.target.value as MarketCondition | "")}
            className="w-full bg-card border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          >
            <option value="">Select...</option>
            <option value="Trending">Trending</option>
            <option value="Range">Range</option>
            <option value="Volatile">Volatile</option>
            <option value="Choppy">Choppy</option>
            <option value="Calm">Calm</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">How was your mindset?</label>
          <select
            value={emotion}
            onChange={(e) => setEmotion(e.target.value as Emotion | "")}
            className="w-full bg-card border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          >
            <option value="">Select...</option>
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
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground/80">Did you follow your plan?</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setPlanFollowed(true)}
            className={`flex-1 py-2.5 rounded-lg border font-medium transition-colors ${
              planFollowed === true
                ? "bg-primary/20 border-primary text-primary"
                : "bg-card border-border text-foreground/70 hover:bg-white/5"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setPlanFollowed(false)}
            className={`flex-1 py-2.5 rounded-lg border font-medium transition-colors ${
              planFollowed === false
                ? "bg-danger/20 border-danger text-danger"
                : "bg-card border-border text-foreground/70 hover:bg-white/5"
            }`}
          >
            No
          </button>
        </div>
      </div>

    </div>
  );
}
