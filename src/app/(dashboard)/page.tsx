import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PnLChart } from "@/components/dashboard/PnLChart";
import { PerformanceSummary } from "@/components/dashboard/PerformanceSummary";
import { RecentTrades } from "@/components/dashboard/RecentTrades";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { DollarSign, TrendingUp, Activity, Percent } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getDashboardMetrics } from "@/lib/server/metrics";

export default async function Dashboard() {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }

  const metrics = await getDashboardMetrics(session.userId as string);
  const hasTrades = metrics.totalTrades > 0;

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader />

      {hasTrades ? (
        <>
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              label="Today's P&L" 
              value={`${metrics.todayPnl >= 0 ? '+' : ''}₹${metrics.todayPnl.toLocaleString()}`} 
              icon={<DollarSign className="w-5 h-5" />}
              trend={metrics.todayPnl >= 0 ? "up" : "down"}
              accentColor={metrics.todayPnl >= 0 ? "var(--color-primary)" : "var(--color-destructive)"}
            />
            <MetricCard 
              label="This Week" 
              value={`${metrics.weekPnl >= 0 ? '+' : ''}₹${metrics.weekPnl.toLocaleString()}`} 
              icon={<TrendingUp className="w-5 h-5" />}
              trend={metrics.weekPnl >= 0 ? "up" : "down"}
              accentColor={metrics.weekPnl >= 0 ? "var(--color-success)" : "var(--color-destructive)"}
            />
            <MetricCard 
              label="Win Rate" 
              value={`${metrics.winRate}%`} 
              icon={<Percent className="w-5 h-5" />}
              accentColor="var(--color-accent)"
            />
            <MetricCard 
              label="Profit Factor" 
              value={metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor} 
              icon={<Activity className="w-5 h-5" />}
              accentColor="var(--color-primary)"
            />
          </div>

          {/* Main Chart and Performance Summary Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PnLChart data={metrics.chartData} />
            </div>
            <div className="lg:col-span-1">
              <PerformanceSummary metrics={metrics} />
            </div>
          </div>

          {/* Recent Trades Row */}
          <div className="w-full">
            <RecentTrades trades={metrics.recentTrades} />
          </div>
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
