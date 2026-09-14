"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  LineChart, 
  CalendarDays, 
  BarChart3, 
  BookOpen, 
  Settings,
  PlusCircle,
} from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: "Trades", href: "/trades", icon: <LineChart className="w-5 h-5" /> },
  { name: "Calendar", href: "/calendar", icon: <CalendarDays className="w-5 h-5" /> },
  { name: "Analytics", href: "/analytics", icon: <BarChart3 className="w-5 h-5" /> },
  { name: "Journal", href: "/journal", icon: <BookOpen className="w-5 h-5" /> },
];

export function Sidebar({ user }: { user?: { name?: string | null; email?: string } | null }) {
  const pathname = usePathname();
  
  // A helper function to determine if a route is active
  const isActive = (href: string) => {
    if (href === "/" && pathname !== "/") return false;
    return pathname?.startsWith(href);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 border-r border-border bg-card z-40">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
            T
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">TradingJournal</span>
        </div>
        
        <Link 
          href="/add-trade"
          className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 px-4 rounded-xl font-medium transition-all shadow-lg shadow-primary/20 mb-6"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Trade</span>
        </Link>
        
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  active 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-foreground/60 hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <div className={active ? "text-primary" : "text-foreground/50"}>
                  {item.icon}
                </div>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto p-6 border-t border-border/50">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2 ${
            isActive("/settings")
              ? "bg-primary/10 text-primary font-medium"
              : "text-foreground/60 hover:bg-white/5 hover:text-foreground"
          }`}
        >
          <Settings className="w-5 h-5 text-foreground/50" />
          <span>Settings</span>
        </Link>
        
        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-foreground/50 truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
