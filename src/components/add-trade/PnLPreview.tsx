export function PnLPreview({ pnl }: { pnl: number | null }) {
  if (pnl === null) {
    return (
      <div className="py-6 px-4 bg-card border border-border rounded-lg text-center flex flex-col items-center justify-center min-h-[120px]">
        <p className="text-sm text-foreground/50 uppercase tracking-wider mb-2">Estimated P&L</p>
        <p className="text-3xl font-mono text-foreground/30 font-semibold">—</p>
      </div>
    );
  }

  const isPositive = pnl > 0;
  const isZero = pnl === 0;

  return (
    <div className={`py-6 px-4 border rounded-lg text-center flex flex-col items-center justify-center min-h-[120px] transition-all
      ${isPositive ? 'bg-success-light border-success/30' : isZero ? 'bg-card border-border' : 'bg-danger-light border-danger/30'}
    `}>
      <p className="text-sm text-foreground/70 uppercase tracking-wider mb-2 font-medium">Estimated P&L</p>
      <p className={`text-4xl font-mono font-bold tracking-tight
        ${isPositive ? 'text-success' : isZero ? 'text-foreground' : 'text-danger'}
      `}>
        {pnl > 0 ? "+" : ""}₹{Math.abs(pnl).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}
