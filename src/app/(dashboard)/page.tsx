import { CalendarHeatmap } from "@/components/dashboard/CalendarHeatmap";
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
import { getCapitalHistory } from "@/lib/server/capital";
import { CapitalJourneyGraph } from "@/components/dashboard/CapitalJourneyGraph";
import { GuardrailStatusCard } from "@/components/dashboard/GuardrailStatusCard";
import { OnboardingModal } from "@/components/dashboard/OnboardingModal";

export default async function Dashboard() {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }

  const userId = session.userId as string;
  const metrics = await getDashboardMetrics(userId);
  const capitalData = await getCapitalHistory(userId);
  const hasTrades = metrics.totalTrades > 0;

  const showOnboarding = !capitalData.profile?.onboardingCompleted;

  return (
    <div className="flex flex-col gap-6">
      {showOnboarding && <OnboardingModal />}
      
      <DashboardHeader />

      {/* Capital Journey Row */}
      {!showOnboarding && (
        <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6 items-stretch">
          <div className="h-[450px]">
            <CapitalJourneyGraph 
              data={capitalData.journey} 
              profitGuardrail={capitalData.profile?.profitGuardrail ? Number(capitalData.profile.profitGuardrail) : null}
              lossGuardrail={capitalData.profile?.lossGuardrail ? Number(capitalData.profile.lossGuardrail) : null}
              baseCapital={capitalData.activeBaseCapital}
            />
          </div>
          <div className="h-[450px]">
            <GuardrailStatusCard 
              currentBalance={capitalData.currentBalance}
              baseCapital={capitalData.activeBaseCapital}
              profitGuardrail={capitalData.profile?.profitGuardrail ? Number(capitalData.profile.profitGuardrail) : null}
              lossGuardrail={capitalData.profile?.lossGuardrail ? Number(capitalData.profile.lossGuardrail) : null}
              status={capitalData.status}
            />
          </div>
        </div>
      )}

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
              <PerformanceSummary metrics={metrics as any} />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <CalendarHeatmap />
            <RecentTrades trades={metrics.recentTrades as any} />
          </div>
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
