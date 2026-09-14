"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface DailyData {
  date: string;
  pnl: number;
  tradeCount: number;
}

export function CalendarHeatmap() {
  const router = useRouter();
  const [periodOffset, setPeriodOffset] = useState(0);
  const [heatmapData, setHeatmapData] = useState<Record<string, DailyData>>({});
  const [loading, setLoading] = useState(false);

  const weeks = 12; // Show 12 weeks at a time
  const daysInWeek = 7;
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const { calendarGrid, monthLabels, dateRange, startDateStr, endDateStr, hasFutureDates } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If offset > 0, we go back in time by that many 'weeks'
    if (periodOffset > 0) {
      today.setDate(today.getDate() - periodOffset * weeks * 7);
    }

    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    // We want the grid to end on Sunday.
    const daysToSunday = currentDay === 0 ? 0 : 7 - currentDay;

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysToSunday);

    const totalDays = weeks * daysInWeek;

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - totalDays + 1);

    const grid: { date: Date; dateStr: string; isFuture: boolean; isWeekend: boolean }[][] = [];
    const months: { label: string; weekIndex: number }[] = [];
    let currentMonth = -1;
    let anyFutureDates = false;

    // We build it week by week
    for (let w = 0; w < weeks; w++) {
      const weekCol = [];
      let weekMonth = -1;

      for (let d = 0; d < daysInWeek; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + w * daysInWeek + d);

        if (d === 0) {
          weekMonth = date.getMonth();
        }

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const realToday = new Date();
        realToday.setHours(0, 0, 0, 0);
        const isFuture = date > realToday;
        if (isFuture) anyFutureDates = true;

        // Monday is d=0, Sunday is d=6
        const isWeekend = d === 5 || d === 6;

        weekCol.push({
          date,
          dateStr,
          isFuture,
          isWeekend,
        });
      }

      if (weekMonth !== currentMonth) {
        months.push({
          label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(weekCol[0].date),
          weekIndex: w,
        });
        currentMonth = weekMonth;
      }

      grid.push(weekCol);
    }

    const startStrFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(startDate);
    const endStrFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(endDate);

    const s_yyyy = startDate.getFullYear();
    const s_mm = String(startDate.getMonth() + 1).padStart(2, "0");
    const s_dd = String(startDate.getDate()).padStart(2, "0");

    const e_yyyy = endDate.getFullYear();
    const e_mm = String(endDate.getMonth() + 1).padStart(2, "0");
    const e_dd = String(endDate.getDate()).padStart(2, "0");

    return {
      calendarGrid: grid,
      monthLabels: months,
      dateRange: `${startStrFmt} - ${endStrFmt}`,
      startDateStr: `${s_yyyy}-${s_mm}-${s_dd}`,
      endDateStr: `${e_yyyy}-${e_mm}-${e_dd}`,
      hasFutureDates: anyFutureDates,
    };
  }, [weeks, periodOffset]);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/calendar?from=${startDateStr}&to=${endDateStr}`);
        if (res.ok && mounted) {
          const data: DailyData[] = await res.json();
          const dataMap: Record<string, DailyData> = {};
          data.forEach((item) => {
            dataMap[item.date] = item;
          });
          setHeatmapData(dataMap);
        }
      } catch (e) {
        console.error("Failed to fetch heatmap data", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, [startDateStr, endDateStr]);

  const maxAbsPnl = useMemo(() => {
    const values = Object.values(heatmapData).map((d) => Math.abs(d.pnl));
    if (values.length === 0) return 0;
    return Math.max(...values);
  }, [heatmapData]);

  // intensity 0-4
  const getIntensityLevel = (pnl: number) => {
    if (pnl === 0) return 0;
    const ratio = Math.abs(pnl) / (maxAbsPnl || 1);
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  const getCellClass = (pnl: number, isFuture: boolean, isWeekend: boolean) => {
    if (isFuture) return "bg-transparent";
    if (pnl === 0) {
      // Neutral cell
      return "bg-white/[0.04] border border-white/[0.02]";
    }

    const intensity = getIntensityLevel(pnl);

    if (pnl > 0) {
      // Green variations
      if (intensity === 1) return "bg-emerald-950 border border-emerald-900/50";
      if (intensity === 2) return "bg-emerald-800 border border-emerald-700/50";
      if (intensity === 3) return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]";
      return "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]";
    } else {
      // Red variations
      if (intensity === 1) return "bg-rose-950 border border-rose-900/50";
      if (intensity === 2) return "bg-rose-800 border border-rose-700/50";
      if (intensity === 3) return "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]";
      return "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]";
    }
  };

  const handleCellClick = (dateStr: string, hasTrades: boolean) => {
    if (hasTrades) {
      router.push(`/trades?date=${dateStr}`);
    }
  };

  const navBtnClass = "px-3 py-1.5 text-xs font-medium rounded-md bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1";

  const totalPeriodPnl = useMemo(() => {
    return Object.values(heatmapData).reduce((sum, d) => sum + d.pnl, 0);
  }, [heatmapData]);

  const activeDaysCount = Object.keys(heatmapData).length;

  return (
    <div className="bg-[#0f1219] backdrop-blur-xl border border-white/5 rounded-3xl p-6 h-full flex flex-col relative overflow-hidden group/card shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none transition-opacity duration-700 opacity-50 group-hover/card:opacity-100" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 relative z-10">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white/90">Activity Calendar</h2>
          <div className="flex items-center gap-3 mt-1.5">
            <p className="text-xs text-white/50 font-medium bg-white/5 px-2 py-0.5 rounded-md">{dateRange}</p>
            {activeDaysCount > 0 && (
              <p className={`text-xs font-semibold ${totalPeriodPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                Total P&L: {totalPeriodPnl >= 0 ? "+" : ""}₹{totalPeriodPnl.toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 border border-white/10 rounded-lg p-1 gap-0.5">
            <button
              onClick={() => setPeriodOffset((prev) => prev + 1)}
              className={navBtnClass}
              title="Previous 12 weeks"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              Prev
            </button>
            <button
              onClick={() => setPeriodOffset(0)}
              className={`${navBtnClass} ${periodOffset === 0 ? "text-white bg-white/10" : ""}`}
              title="Current period"
            >
              Current
            </button>
            <button
              onClick={() => setPeriodOffset((prev) => Math.max(0, prev - 1))}
              disabled={periodOffset === 0}
              className={navBtnClass}
              title="Next 12 weeks"
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col items-center justify-center relative z-10">
        <div className={`flex w-full overflow-x-auto pb-4 no-scrollbar justify-center transition-opacity duration-300 ${loading ? "opacity-50" : "opacity-100"}`}>
          {/* Grid without Labels */}
          <div className="flex gap-2 min-w-max pt-2">
            {calendarGrid.map((week, weekIndex) => (
              <div key={`week-${weekIndex}`} className="flex flex-col gap-2">
                {week.map((day, dayIndex) => {
                  const dayData = heatmapData[day.dateStr];
                  const pnl = dayData?.pnl || 0;
                  const tradeCount = dayData?.tradeCount || 0;
                  const cellColor = getCellClass(pnl, day.isFuture, day.isWeekend);
                  const hasTrades = tradeCount > 0;

                  // Larger, more rounded cells to match reference image
                  const cellSize = "w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10";
                  const cursorClass = hasTrades ? "cursor-pointer" : "cursor-default";
                  const hoverScale = hasTrades ? "hover:scale-110" : "hover:scale-105";

                  const content = (
                    <div
                      onClick={() => handleCellClick(day.dateStr, hasTrades)}
                      className={`${cellSize} rounded-md sm:rounded-lg ${cellColor} transition-all duration-200 ${cursorClass} ${hoverScale}`}
                    />
                  );

                  if (day.isFuture) {
                    return <div key={`day-${weekIndex}-${dayIndex}`}>{content}</div>;
                  }

                  return (
                    <div key={`day-${weekIndex}-${dayIndex}`} className="relative group/cell">
                      {content}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/cell:block z-50 w-max pointer-events-none">
                        <div className="bg-[#1a1d24] border border-white/10 shadow-xl rounded-lg px-3 py-2 text-sm">
                          <p className="font-medium text-white/70 mb-1 text-xs tracking-wide">
                            {day.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                          </p>
                          {hasTrades ? (
                            <>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-white/40 text-[11px]">P&L</span>
                                <span className={`text-xs font-semibold ${pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                  {pnl >= 0 ? "+" : ""}₹{pnl.toLocaleString()}
                                </span>
                              </div>
                              <div className="text-[10px] text-white/40">{tradeCount} trade{tradeCount !== 1 ? "s" : ""}</div>
                            </>
                          ) : (
                            <p className="text-[11px] text-white/40">No trades</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end items-center gap-4 text-xs text-white/40 font-medium">
        <div className="flex items-center gap-1.5">
          <span>Loss</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-[2px] bg-rose-950 border border-rose-900/50"></div>
            <div className="w-2.5 h-2.5 rounded-[2px] bg-rose-800 border border-rose-700/50"></div>
            <div className="w-2.5 h-2.5 rounded-[2px] bg-rose-500"></div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span>No trades</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-white/[0.04] border border-white/[0.02]"></div>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Profit</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-950 border border-emerald-900/50"></div>
            <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-800 border border-emerald-700/50"></div>
            <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
