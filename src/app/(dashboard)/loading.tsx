import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <DashboardHeader />

      {/* Top Metrics Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 h-32 flex flex-col justify-between">
            <div className="w-1/2 h-4 bg-muted rounded"></div>
            <div className="w-3/4 h-8 bg-muted rounded mt-4"></div>
          </div>
        ))}
      </div>

      {/* Main Chart and Performance Summary Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 h-[350px]">
           <div className="w-1/3 h-6 bg-muted rounded mb-6"></div>
           <div className="w-full h-48 bg-muted rounded"></div>
        </div>
        <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-6 h-[350px]">
           <div className="w-1/2 h-6 bg-muted rounded mb-8"></div>
           <div className="space-y-4">
             {[...Array(6)].map((_, i) => (
               <div key={i} className="w-full h-4 bg-muted rounded"></div>
             ))}
           </div>
        </div>
      </div>

      {/* Recent Trades Row Skeleton */}
      <div className="w-full bg-card border border-border rounded-2xl p-6 h-64">
        <div className="w-1/4 h-6 bg-muted rounded mb-6"></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-full h-8 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
