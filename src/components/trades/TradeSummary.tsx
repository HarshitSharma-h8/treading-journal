import { Trade } from "@/lib/types";
import { formatCurrency } from "@/lib/trading-utils";

interface TradeSummaryProps {
  trades: Trade[];
}

export function TradeSummary({ trades }: TradeSummaryProps) {
  const totalTrades = trades.length;
  
  const winningTrades = trades.filter((t) => t.pnl > 0).length;
  const losingTrades = trades.filter((t) => t.pnl < 0).length;

  const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
        <span className="text-sm font-medium text-foreground/60 mb-1">Total Trades</span>
        <span className="text-2xl font-bold">{totalTrades}</span>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
        <span className="text-sm font-medium text-foreground/60 mb-1">Winning</span>
        <span className="text-2xl font-bold text-success">{winningTrades}</span>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
        <span className="text-sm font-medium text-foreground/60 mb-1">Losing</span>
        <span className="text-2xl font-bold text-danger">{losingTrades}</span>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
        <span className="text-sm font-medium text-foreground/60 mb-1">Total P&L</span>
        <span className={`text-2xl font-bold ${totalPnL > 0 ? "text-success" : totalPnL < 0 ? "text-danger" : ""}`}>
          {totalPnL > 0 ? "+" : ""}{formatCurrency(totalPnL)}
        </span>
      </div>
    </div>
  );
}
