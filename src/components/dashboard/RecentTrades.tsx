import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Trade } from "@/lib/types";

export function RecentTrades({ trades }: { trades: Trade[] }) {
  if (trades.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-foreground">Recent Trades</h2>
        <Link href="/trades" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-foreground/50 uppercase border-b border-border/50">
            <tr>
              <th className="pb-3 font-medium">Symbol</th>
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">Strategy</th>
              <th className="pb-3 font-medium text-right">P&L</th>
              <th className="pb-3 font-medium text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => {
              const pnlValue = trade.pnl ?? (trade.direction === "BUY" ? (trade.exitPrice - trade.entryPrice) * trade.quantity : (trade.entryPrice - trade.exitPrice) * trade.quantity);
              const isProfit = pnlValue > 0;
              const dateStr = new Date(trade.entryTime || trade.tradeDate || new Date()).toLocaleDateString("en-US", { month: "short", day: "numeric" });
              
              return (
                <tr key={trade.id} className="border-b border-border/20 hover:bg-white/[0.02] transition-colors relative group">
                  <td className="py-4 font-medium text-foreground">
                    <Link href={`/trades/${trade.id}`} className="absolute inset-0" />
                    {trade.symbol}
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      trade.direction === "BUY" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                    }`}>
                      {trade.direction}
                    </span>
                  </td>
                  <td className="py-4 text-foreground/70">{trade.strategyId || trade.setupStrategy || 'N/A'}</td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className={`font-medium ${isProfit ? "text-success" : (pnlValue < 0 ? "text-danger" : "text-foreground/70")}`}>
                        {isProfit ? "+" : (pnlValue < 0 ? "-" : "")}₹{Math.abs(pnlValue).toLocaleString()}
                      </span>
                      {isProfit ? (
                        <ArrowUpRight className="w-3 h-3 text-success" />
                      ) : pnlValue < 0 ? (
                        <ArrowDownRight className="w-3 h-3 text-danger" />
                      ) : null}
                    </div>
                  </td>
                  <td className="py-4 text-right text-foreground/50">{dateStr}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
