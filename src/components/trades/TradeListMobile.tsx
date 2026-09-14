import { Trade } from "@/lib/types";
import { formatCurrency } from "@/lib/trading-utils";
import { useRouter } from "next/navigation";

interface TradeListMobileProps {
  trades: Trade[];
}

export function TradeListMobile({ trades }: TradeListMobileProps) {
  const router = useRouter();

  if (trades.length === 0) return null;

  return (
    <div className="md:hidden flex flex-col gap-3">
      {trades.map((trade) => {
        const isWin = trade.pnl > 0;
        const isLoss = trade.pnl < 0;

        return (
          <div 
            key={trade.id}
            onClick={() => router.push(`/trades/${trade.id}`)}
            className="bg-card border border-border rounded-xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg leading-tight">{trade.symbol}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-semibold ${
                    trade.tradeType === "BUY" ? "text-success" : "text-danger"
                  }`}>
                    {trade.tradeType}
                  </span>
                  {trade.strategyId && (
                    <>
                      <span className="text-foreground/30">•</span>
                      <span className="text-xs text-foreground/60">{trade.strategyId}</span>
                    </>
                  )}
                </div>
              </div>
              <div className={`font-bold ${isWin ? "text-success" : isLoss ? "text-danger" : ""}`}>
                {isWin ? "+" : ""}{formatCurrency(trade.pnl)}
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="text-sm text-foreground/80">
                <div className="mb-0.5">
                  {formatCurrency(trade.entryPrice)} <span className="text-foreground/40">→</span> {formatCurrency(trade.exitPrice)}
                </div>
                <div className="text-foreground/60 text-xs">
                  Qty {trade.quantity}
                </div>
              </div>
              <div className="text-xs text-foreground/50">
                {new Date(trade.tradeDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
