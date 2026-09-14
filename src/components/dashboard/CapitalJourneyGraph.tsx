"use client";

import { useEffect, useState } from "react";
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine,
  Scatter,
  Cell
} from "recharts";
import { CapitalPoint } from "@/lib/server/capital";

interface CapitalJourneyGraphProps {
  data: CapitalPoint[];
  profitGuardrail: number | null;
  lossGuardrail: number | null;
  baseCapital: number;
}

export function CapitalJourneyGraph({ data, profitGuardrail, lossGuardrail, baseCapital }: CapitalJourneyGraphProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[300px] bg-muted/20 animate-pulse rounded-lg border border-border" />;

  // Enhance data for chart
  const chartData = data.map(d => ({
    ...d,
    isWithdrawal: d.eventType === "WITHDRAWAL",
    isDeposit: d.eventType === "DEPOSIT",
    isReset: d.eventType === "CAPITAL_RESET"
  }));

  // Find y-axis domain ensuring guardrails are visible
  const allValues = [
    ...chartData.map(d => d.balance), 
    baseCapital, 
    profitGuardrail || baseCapital, 
    lossGuardrail || baseCapital
  ];
  const minVal = Math.min(...allValues) * 0.95;
  const maxVal = Math.max(...allValues) * 1.05;

  // Calculate gradient offset
  const gradientOffset = () => {
    const dataMax = maxVal;
    const dataMin = minVal;
    if (dataMax <= dataMin) return 0;
    if (baseCapital <= dataMin) return 1;
    if (baseCapital >= dataMax) return 0;
    return (dataMax - baseCapital) / (dataMax - dataMin);
  };
  
  const off = gradientOffset();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-xl p-4 shadow-2xl text-sm min-w-[200px]">
          <p className="text-muted-foreground mb-1">{data.date}</p>
          <p className="text-muted-foreground/80 text-xs mb-0.5">Account Balance</p>
          <p className="font-bold text-foreground text-2xl mb-2">₹{data.balance.toLocaleString()}</p>
          
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Event</p>
            {data.eventType === 'TRADE' && (
              <>
                <p className="text-foreground font-medium text-sm">Trade logged</p>
                <p className={`font-medium text-sm ${data.amount >= 0 ? 'text-success' : 'text-danger'}`}>
                  {data.amount >= 0 ? '+' : ''}₹{data.amount.toLocaleString()} (Trade)
                </p>
              </>
            )}
            {data.eventType === 'WITHDRAWAL' && (
              <>
                <p className="text-foreground font-medium text-sm">Withdrawal recorded</p>
                <p className="font-medium text-sm text-danger">
                  -₹{data.amount.toLocaleString()}
                </p>
              </>
            )}
            {data.eventType === 'DEPOSIT' && (
              <>
                <p className="text-foreground font-medium text-sm">Deposit recorded</p>
                <p className="font-medium text-sm text-success">
                  +₹{data.amount.toLocaleString()}
                </p>
              </>
            )}
            {data.eventType === 'CAPITAL_RESET' && (
              <>
                <p className="text-foreground font-medium text-sm">Capital reset</p>
                <p className="font-medium text-sm text-primary">
                  ₹{data.amount.toLocaleString()}
                </p>
              </>
            )}
            
            {data.guardrailHit === 'PROFIT' && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-success font-semibold text-sm">🟢 Profit Guardrail Reached</p>
                <p className="text-muted-foreground text-xs">Consider protecting some gains</p>
              </div>
            )}
            {data.guardrailHit === 'LOSS' && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-danger font-semibold text-sm">🔴 Loss Guardrail Reached</p>
                <p className="text-muted-foreground text-xs">Consider taking a break and reviewing your trades</p>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBadge = ({ viewBox, value, text, color, bgColor }: any) => {
    const { x, y, width } = viewBox;
    const badgeWidth = 90;
    const badgeHeight = 24;
    return (
      <g>
        <rect 
          x={x + width + 10} 
          y={y - badgeHeight / 2} 
          width={badgeWidth} 
          height={badgeHeight} 
          fill={bgColor} 
          rx={4}
        />
        <text 
          x={x + width + 10 + badgeWidth / 2} 
          y={y + 4} 
          fill={color} 
          fontSize={12} 
          fontWeight="bold" 
          textAnchor="middle"
        >
          ₹{value.toLocaleString()}
        </text>
        <text 
          x={x + width + 10 + badgeWidth / 2} 
          y={y + 24} 
          fill={bgColor} 
          fontSize={10} 
          textAnchor="middle"
        >
          {text}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col h-[450px] w-full">
      <div className="mb-6 flex justify-between items-start shrink-0">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-1">Capital Journey</h3>
          <p className="text-sm text-foreground/50">Your trading account over time</p>
        </div>
        <select className="bg-background border border-border text-foreground text-sm rounded-md px-3 py-1.5 focus:outline-none">
          <option>Last 6 Months</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 110, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={off} stopColor="var(--color-success)" stopOpacity={1} />
                  <stop offset={off} stopColor="var(--color-danger)" stopOpacity={1} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                minTickGap={30}
                dy={10}
              />
              <YAxis 
                domain={[minVal, maxVal]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                tickFormatter={(val) => `₹${val.toLocaleString()}`}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-border)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              
              {profitGuardrail && (
                <ReferenceLine 
                  y={profitGuardrail} 
                  stroke="var(--color-success)" 
                  strokeDasharray="4 4" 
                  strokeOpacity={0.8}
                  label={(props) => <CustomBadge {...props} value={profitGuardrail} text="Profit Guardrail" color="#ffffff" bgColor="var(--color-success)" />}
                />
              )}
              
              {lossGuardrail && (
                <ReferenceLine 
                  y={lossGuardrail} 
                  stroke="var(--color-danger)" 
                  strokeDasharray="4 4" 
                  strokeOpacity={0.8}
                  label={(props) => <CustomBadge {...props} value={lossGuardrail} text="Loss Guardrail" color="#ffffff" bgColor="var(--color-danger)" />}
                />
              )}

              <ReferenceLine 
                y={baseCapital} 
                stroke="var(--color-primary)" 
                strokeOpacity={0.8}
                strokeDasharray="4 4"
                label={(props) => <CustomBadge {...props} value={baseCapital} text="Base Capital" color="#ffffff" bgColor="var(--color-primary)" />}
              />

              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="url(#splitColor)" 
                strokeWidth={3}
                dot={{ r: 5, strokeWidth: 2, fill: "var(--color-card)", stroke: "url(#splitColor)" }}
                activeDot={{ r: 7, fill: "var(--color-success)", strokeWidth: 0, className: "drop-shadow-[0_0_8px_var(--color-success)]" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
}
