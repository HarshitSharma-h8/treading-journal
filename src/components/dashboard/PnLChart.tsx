"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface PnLChartProps {
  data: { date: string; pnl: number }[];
}

export function PnLChart({ data }: PnLChartProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 h-full min-h-[350px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">P&L OVER TIME</h2>
          <p className="text-xs text-foreground/50 mt-1">Cumulative profit and loss</p>
        </div>
        
        <div className="flex bg-background/50 border border-border rounded-lg p-1">
          <button className="px-3 py-1 text-xs font-medium rounded-md text-foreground/60 hover:text-foreground transition-colors">
            All Time
          </button>
        </div>
      </div>
      
      <div className="flex-1 w-full relative min-h-[250px]">
        {/* Subtle background glow for chart area */}
        <div className="absolute inset-0 bg-primary/5 blur-[100px] pointer-events-none rounded-full" />
        
        {data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-foreground/50 text-sm">
            No trading data yet. Add your first trade to see your performance here.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--color-foreground)', opacity: 0.5, fontSize: 12 }}
                dy={10}
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--color-foreground)', opacity: 0.5, fontSize: 12 }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)', 
                  borderColor: 'var(--color-border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                }}
                itemStyle={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
                labelStyle={{ color: 'var(--color-foreground)', opacity: 0.7, marginBottom: '4px' }}
                labelFormatter={(label) => new Date(label as any).toLocaleDateString()}
                formatter={(value: any) => [`₹${value.toLocaleString()}`, "P&L"]}            />
              <Area 
                type="monotone" 
                dataKey="pnl" 
                stroke="var(--color-primary)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPnl)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
