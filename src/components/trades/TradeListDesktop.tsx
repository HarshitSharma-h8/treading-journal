import { Trade } from "@/lib/types";
import { formatCurrency } from "@/lib/trading-utils";
import { useRouter } from "next/navigation";
import { ImageIcon } from "lucide-react";

interface TradeListDesktopProps {
  trades: Trade[];
}

export function TradeListDesktop({ trades }: TradeListDesktopProps) {
  const router = useRouter();

  if (trades.length === 0) return null;

  return (
    <div className="hidden md:block overflow-x-auto bg-card border border-border rounded-xl">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-background/50 border-b border-border text-foreground/70">
          <tr>
            <th className="px-6 py-4 font-medium">Date</th>
            <th className="px-6 py-4 font-medium">Symbol</th>
            <th className="px-6 py-4 font-medium">Type</th>
            <th className="px-6 py-4 font-medium">Entry</th>
            <th className="px-6 py-4 font-medium">Exit</th>
            <th className="px-6 py-4 font-medium">Qty</th>
            <th className="px-6 py-4 font-medium">P&L</th>
            <th className="px-6 py-4 font-medium">Strategy</th>
            <th className="px-6 py-4 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {trades.map((trade) => {
            const pnl = trade.pnl ?? (trade.direction === "BUY" ? (trade.exitPrice - trade.entryPrice) * trade.quantity : (trade.entryPrice - trade.exitPrice) * trade.quantity);
            const isWin = pnl > 0;
            const isLoss = pnl < 0;
            
            return (
              <tr 
                key={trade.id} 
                onClick={() => router.push(`/trades/${trade.id}`)}
                className="hover:bg-primary/5 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4 text-foreground/80">
                  {new Date(trade.entryTime || trade.tradeDate!).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short"
                  })}
                </td>
                <td className="px-6 py-4 font-medium">{trade.symbol}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                    trade.direction === "BUY" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                  }`}>
                    {trade.direction}
                  </span>
                </td>
                <td className="px-6 py-4">{formatCurrency(trade.entryPrice)}</td>
                <td className="px-6 py-4">{formatCurrency(trade.exitPrice)}</td>
                <td className="px-6 py-4">{trade.quantity}</td>
                <td className={`px-6 py-4 font-semibold ${
                  isWin ? "text-success" : isLoss ? "text-danger" : ""
                }`}>
                  {isWin ? "+" : ""}{formatCurrency(pnl || 0)}
                </td>
                <td className="px-6 py-4 text-foreground/80">
                  {trade.setupStrategy || trade.strategyId || "-"}
                </td>
                <td className="px-6 py-4 text-foreground/40 group-hover:text-foreground/80 transition-colors">
                  {trade.screenshot && <ImageIcon className="w-4 h-4" />}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
