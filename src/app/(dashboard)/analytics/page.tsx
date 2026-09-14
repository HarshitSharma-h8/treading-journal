"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/trading-utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { BarChart3, TrendingUp, DollarSign, Percent, Activity, AlertCircle, PlusCircle, CalendarDays } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";

type AnalyticsRange = "7d" | "30d" | "90d" | "all";

interface AnalyticsData {
  summary: {
    totalTrades: number;
    totalPnl: number;
    winRate: number;
    profitFactor: number;
    avgWin: number;
    avgLoss: number;
    bestTrade: number;
    worstTrade: number;
  };
  pnlSeries: { date: string; cumulativePnl: number }[];
  winLoss: { winning: number; losing: number; breakeven: number };
  streaks: { currentWinStreak: number; currentLossStreak: number; maxWinStreak: number; maxLossStreak: number };
  dailyPerformance: { date: string; trades: number; pnl: number }[];
  strategies: { name: string; trades: number; pnl: number; winRate: number }[];
  symbols: { symbol: string; trades: number; pnl: number; winRate: number }[];
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/analytics?range=${range}`);
        if (!res.ok) throw new Error("Failed to load");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [range]);

  const ranges: { label: string; value: AnalyticsRange }[] = [
    { label: "7D", value: "7d" },
    { label: "30D", value: "30d" },
    { label: "90D", value: "90d" },
    { label: "ALL", value: "all" },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-bold">Unable to load analytics</h2>
        <button
          onClick={() => setRange(range)}
          className="px-4 py-2 bg-primary/20 text-primary rounded-xl font-medium hover:bg-primary/30 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  const hasTrades = (data?.summary?.totalTrades ?? 0) > 0;

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">ANALYTICS</h1>
          <p className="text-foreground/60 mt-1">Understand how you trade</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                range === r.value 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-foreground/60 hover:text-foreground hover:bg-white/5"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-32 bg-card border border-border rounded-2xl animate-pulse"></div>
            ))}
          </div>
          <div className="h-[400px] bg-card border border-border rounded-2xl animate-pulse"></div>
        </div>
      ) : !hasTrades ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center border border-border bg-card rounded-3xl p-8">
          <BarChart3 className="w-16 h-16 text-primary/30 mb-6" />
          <h2 className="text-2xl font-bold mb-2">No analytics yet</h2>
          <p className="text-foreground/60 max-w-md mb-8">
            Record a few trades to start seeing your trading patterns.
          </p>
          <Link
            href="/add-trade"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-primary/20"
          >
            <PlusCircle className="w-5 h-5" />
            Add Trade
          </Link>
        </div>
      ) : (
        <>
          {/* Core Metrics Grid */}
          {data && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="TOTAL P&L"
              value={`${data.summary.totalPnl >= 0 ? '+' : ''}${formatCurrency(data.summary.totalPnl)}`}
              icon={<DollarSign className="w-5 h-5" />}
              trend={data.summary.totalPnl >= 0 ? "up" : "down"}
              accentColor={data.summary.totalPnl >= 0 ? "var(--color-primary)" : "var(--color-destructive)"}
            />
            <MetricCard
              label="TOTAL TRADES"
              value={data.summary.totalTrades.toString()}
              icon={<Activity className="w-5 h-5" />}
              accentColor="var(--color-accent)"
            />
            <MetricCard
              label="WIN RATE"
              value={`${data.summary.winRate}%`}
              icon={<Percent className="w-5 h-5" />}
              accentColor="var(--color-success)"
            />
            <MetricCard
              label="PROFIT FACTOR"
              value={data.summary.profitFactor.toString()}
              icon={<TrendingUp className="w-5 h-5" />}
              accentColor="var(--color-primary)"
            />
            <MetricCard
              label="AVG WIN"
              value={`+${formatCurrency(data.summary.avgWin)}`}
              icon={<TrendingUp className="w-5 h-5" />}
              trend="up"
              accentColor="var(--color-success)"
            />
            <MetricCard
              label="AVG LOSS"
              value={`-${formatCurrency(Math.abs(data.summary.avgLoss))}`}
              icon={<TrendingUp className="w-5 h-5 rotate-180" />}
              trend="down"
              accentColor="var(--color-destructive)"
            />
            <MetricCard
              label="BEST TRADE"
              value={`+${formatCurrency(data.summary.bestTrade)}`}
              icon={<DollarSign className="w-5 h-5" />}
              trend="up"
              accentColor="var(--color-success)"
            />
            <MetricCard
              label="WORST TRADE"
              value={`-${formatCurrency(Math.abs(data.summary.worstTrade))}`}
              icon={<DollarSign className="w-5 h-5" />}
              trend="down"
              accentColor="var(--color-destructive)"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PnL Over Time */}
            <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-6">P&L OVER TIME</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.pnlSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })} 
                      stroke="rgba(255,255,255,0.4)"
                      tickMargin={10}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.4)" 
                      tickFormatter={(val) => `₹${val.toLocaleString()}`}
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      labelFormatter={(dateStr: any) => new Date(dateStr).toLocaleDateString()}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Cumulative P&L']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cumulativePnl" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Win vs Loss */}
            <div className="lg:col-span-1 bg-card border border-border rounded-3xl p-6 flex flex-col">
              <h3 className="text-lg font-bold mb-2">WIN VS LOSS</h3>
              <div className="flex-1 flex items-center justify-center -mt-4">
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Winning', value: data.winLoss.winning, color: '#10b981' }, // green
                          { name: 'Losing', value: data.winLoss.losing, color: '#ef4444' }, // red
                          ...(data.winLoss.breakeven > 0 ? [{ name: 'Breakeven', value: data.winLoss.breakeven, color: '#6b7280' }] : [])
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: 'Winning', value: data.winLoss.winning, color: '#10b981' },
                          { name: 'Losing', value: data.winLoss.losing, color: '#ef4444' },
                          ...(data.winLoss.breakeven > 0 ? [{ name: 'Breakeven', value: data.winLoss.breakeven, color: '#6b7280' }] : [])
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-xs text-foreground/60 mb-1">Winning</div>
                  <div className="font-bold text-success">
                    {Math.round((data.winLoss.winning / (data.winLoss.winning + data.winLoss.losing || 1)) * 100)}%
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-xs text-foreground/60 mb-1">Losing</div>
                  <div className="font-bold text-destructive">
                    {Math.round((data.winLoss.losing / (data.winLoss.winning + data.winLoss.losing || 1)) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Streaks and Daily Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Streaks */}
              <div className="bg-card border border-border rounded-3xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  STREAKS
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                    <span className="text-foreground/70">Current Win Streak</span>
                    <span className="font-bold text-lg text-success">{data.streaks.currentWinStreak}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                    <span className="text-foreground/70">Current Loss Streak</span>
                    <span className="font-bold text-lg text-destructive">{data.streaks.currentLossStreak}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                    <span className="text-foreground/70">Longest Win Streak</span>
                    <span className="font-bold text-lg text-success">{data.streaks.maxWinStreak}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                    <span className="text-foreground/70">Longest Loss Streak</span>
                    <span className="font-bold text-lg text-destructive">{data.streaks.maxLossStreak}</span>
                  </div>
                </div>
              </div>

              {/* Daily Performance */}
              <div className="bg-card border border-border rounded-3xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  DAILY PERFORMANCE
                </h3>
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                  {data.dailyPerformance.length > 0 ? (
                    data.dailyPerformance.map((day: AnalyticsData['dailyPerformance'][0]) => (
                      <Link 
                        key={day.date}
                        href={`/trades?date=${day.date}`}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                      >
                        <div>
                          <div className="font-medium">
                            {new Date(day.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </div>
                          <div className="text-xs text-foreground/50">{day.trades} trades</div>
                        </div>
                        <div className={`font-bold ${day.pnl >= 0 ? "text-success" : "text-destructive"}`}>
                          {day.pnl >= 0 ? "+" : ""}{formatCurrency(day.pnl)}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center text-foreground/50 py-8">
                      No recent trading days
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Performance by Strategy & Symbol */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Strategy */}
              <div className="bg-card border border-border rounded-3xl p-6 flex-1">
                <h3 className="text-lg font-bold mb-4">PERFORMANCE BY STRATEGY</h3>
                <div className="space-y-3">
                  {data.strategies.length > 0 ? (
                    data.strategies.map((strat: AnalyticsData['strategies'][0]) => (
                      <div key={strat.name} className="flex flex-col gap-1 p-3 bg-white/5 rounded-xl">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{strat.name}</span>
                          <span className={`text-sm font-bold ${strat.pnl >= 0 ? "text-success" : "text-destructive"}`}>
                            {strat.pnl >= 0 ? "+" : ""}{formatCurrency(strat.pnl)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-foreground/60">
                          <span>{strat.trades} trades</span>
                          <span>{strat.winRate}% WR</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-foreground/50 py-4 text-sm">
                      No strategies recorded
                    </div>
                  )}
                </div>
              </div>

              {/* Symbol */}
              <div className="bg-card border border-border rounded-3xl p-6 flex-1">
                <h3 className="text-lg font-bold mb-4">PERFORMANCE BY SYMBOL</h3>
                <div className="space-y-3">
                  {data.symbols.length > 0 ? (
                    data.symbols.map((sym: AnalyticsData['symbols'][0]) => (
                      <div key={sym.symbol} className="flex flex-col gap-1 p-3 bg-white/5 rounded-xl">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{sym.symbol}</span>
                          <span className={`text-sm font-bold ${sym.pnl >= 0 ? "text-success" : "text-destructive"}`}>
                            {sym.pnl >= 0 ? "+" : ""}{formatCurrency(sym.pnl)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-foreground/60">
                          <span>{sym.trades} trades</span>
                          <span>{sym.winRate}% WR</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-foreground/50 py-4 text-sm">
                      No symbols recorded
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </>
          )}
        </>
      )}
    </div>
  );
}
