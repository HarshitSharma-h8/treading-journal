interface PerformanceMetrics {
  totalTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  currentStreak: number;
  streakType: 'win' | 'loss' | null;
}

export function PerformanceSummary({ metrics }: { metrics: PerformanceMetrics }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 h-full flex flex-col relative overflow-hidden">
      {/* Subtle purple accent glow */}
      <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-[60px] opacity-10 pointer-events-none bg-accent" />

      <h2 className="text-lg font-bold text-foreground mb-6">TRADE PERFORMANCE</h2>
      
      <div className="flex-1 flex flex-col justify-between gap-4">
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-sm text-foreground/60">Total Trades</span>
          <span className="text-sm font-semibold">{metrics.totalTrades}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-sm text-foreground/60">Winning Trades</span>
          <span className="text-sm font-semibold text-success">{Math.round((metrics.winRate / 100) * metrics.totalTrades) || '--'}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-sm text-foreground/60">Losing Trades</span>
          <span className="text-sm font-semibold text-danger">{metrics.totalTrades > 0 ? metrics.totalTrades - Math.round((metrics.winRate / 100) * metrics.totalTrades) : '--'}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-sm text-foreground/60">Average Win</span>
          <span className="text-sm font-semibold text-success">{metrics.averageWin > 0 ? `+₹${metrics.averageWin.toLocaleString()}` : '--'}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-sm text-foreground/60">Average Loss</span>
          <span className="text-sm font-semibold text-danger">{metrics.averageLoss < 0 ? `-₹${Math.abs(metrics.averageLoss).toLocaleString()}` : '--'}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 mt-auto">
          <span className="text-sm text-foreground/60">Current Streak</span>
          <span className="text-sm font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-md">
            {metrics.currentStreak > 0 ? `${metrics.currentStreak}${metrics.streakType === 'win' ? 'W' : 'L'}` : '--'}
          </span>
        </div>
      </div>
    </div>
  );
}
