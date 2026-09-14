"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface DayData {
  date: string;
  pnl: number;
  trades: number;
  hasJournal: boolean;
}

export default function TradingCalendar() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysData, setDaysData] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    let active = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/calendar?year=${year}&month=${month}`);
        if (!res.ok) throw new Error("Failed to fetch calendar data");
        
        const data = await res.json();
        
        if (!active) return;

        const aggregated: Record<string, DayData> = {};
        
        const formatToLocalDate = (dateStr: string) => {
          const d = new Date(dateStr);
          return d.toLocaleDateString('en-CA');
        };

        data.trades?.forEach((trade: { tradeDate: string; pnl: string | number }) => {
          const dateKey = formatToLocalDate(trade.tradeDate);
          if (!aggregated[dateKey]) {
            aggregated[dateKey] = { date: dateKey, pnl: 0, trades: 0, hasJournal: false };
          }
          aggregated[dateKey].pnl += parseFloat(trade.pnl.toString());
          aggregated[dateKey].trades += 1;
        });

        data.journalEntries?.forEach((entry: { entryDate: string }) => {
          const dateKey = formatToLocalDate(entry.entryDate);
          if (!aggregated[dateKey]) {
            aggregated[dateKey] = { date: dateKey, pnl: 0, trades: 0, hasJournal: false };
          }
          aggregated[dateKey].hasJournal = true;
        });

        setDaysData(aggregated);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    
    return () => { active = false; };
  }, [currentDate]);

  // Expose manual refetch for the Try Again button
  const handleRetry = () => {
    setCurrentDate(new Date(currentDate.getTime())); // triggers effect
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (dateString: string, hasTrades: boolean, hasJournal: boolean) => {
    if (hasTrades) {
      router.push(`/trades?date=${dateString}`);
    } else if (hasJournal) {
      // Find journal entry ID? We don't have the ID here, just a boolean.
      // Easiest is to go to journal list or we could fetch the ID.
      // For now, if no trades but has journal, maybe just go to /journal
      router.push(`/journal`);
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // 0 = Sunday, 1 = Monday. We want Monday as start of week.
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6; // Sunday becomes 6

    const days = [];
    const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Add week headers
    WEEKDAYS.forEach((day) => {
      days.push(
        <div key={`header-${day}`} className="text-center font-semibold p-2 text-sm text-foreground/60">
          {day}
        </div>
      );
    });

    // Add empty cells for padding
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-border/50 bg-background/20 min-h-[100px]"></div>);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toLocaleDateString('en-CA');
      const data = daysData[dateKey];
      const isToday = new Date().toLocaleDateString('en-CA') === dateKey;

      let cellStyle = "bg-card";
      if (data?.pnl > 0) cellStyle = "bg-green-500/10 border-green-500/30";
      else if (data?.pnl < 0) cellStyle = "bg-red-500/10 border-red-500/30";
      else if (data?.trades > 0) cellStyle = "bg-foreground/5 border-border";
      
      const isClickable = data?.trades > 0 || data?.hasJournal;

      days.push(
        <div 
          key={day} 
          onClick={() => isClickable && handleDayClick(dateKey, data?.trades > 0, data?.hasJournal)}
          className={`p-2 border border-border/50 min-h-[100px] flex flex-col transition-colors ${cellStyle} ${isClickable ? 'cursor-pointer hover:bg-foreground/10' : ''} ${isToday ? 'ring-1 ring-primary/50' : ''}`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-foreground/80'}`}>{day}</span>
            {data?.hasJournal && (
              <span className="text-xs text-primary" title="Journal Entry">● Journal</span>
            )}
          </div>
          
          {data?.trades > 0 && (
            <div className="mt-auto pt-2 flex flex-col gap-1 text-xs">
              <span className={`font-semibold ${data.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {data.pnl >= 0 ? '+' : ''}₹{Math.abs(data.pnl).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-foreground/60">{data.trades} trade{data.trades > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-[1px] bg-border/50 rounded-lg overflow-hidden border border-border/50">
        {days}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Your trading performance by day</p>
        </div>
        
        <div className="flex items-center gap-2 bg-card border border-border/50 p-1 rounded-md shadow-sm">
          <button className="p-2 hover:bg-muted rounded-md transition-colors" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="w-36 text-center font-medium">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </div>
          <button className="p-2 hover:bg-muted rounded-md transition-colors" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button className="px-3 py-1.5 text-sm hover:bg-muted rounded-md transition-colors" onClick={handleToday}>
            Today
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-12 flex flex-col items-center justify-center text-center border border-red-500/20 bg-red-500/5 rounded-xl">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted" onClick={handleRetry}>
            Try again
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-7 gap-[1px] bg-border/50 rounded-lg overflow-hidden border border-border/50 animate-pulse">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="bg-card min-h-[100px]" />
          ))}
        </div>
      ) : (
        <>
          {renderCalendar()}
          
          {Object.keys(daysData).length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              No trades this month
            </div>
          )}
        </>
      )}
    </div>
  );
}
