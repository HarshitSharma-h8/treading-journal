"use client";

import Link from "next/link";
import { Calendar, Plus, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function DashboardHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-1">
          Analyze
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-foreground/60 mt-1">
          Your trading performance at a glance
        </p>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-border/50 transition-colors">
          <Calendar className="w-4 h-4 text-foreground/60" />
          <span>Last 30 Days</span>
        </button>
        <Link href="/add-trade" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-background rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-[0_0_15px_var(--color-primary-glow)]">
          <Plus className="w-4 h-4" />
          <span>Add Trade</span>
        </Link>
        <button onClick={handleLogout} title="Logout" className="flex-none flex items-center justify-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
