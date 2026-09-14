"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  LineChart, 
  CalendarDays, 
  BarChart3, 
  PlusCircle,
  Menu,
  X,
  BookOpen,
  Settings
} from "lucide-react";
import { useState } from "react";

const mainNavItems = [
  { name: "Home", href: "/", icon: <LayoutDashboard className="w-6 h-6" /> },
  { name: "Trades", href: "/trades", icon: <LineChart className="w-6 h-6" /> },
  { name: "Add", href: "/add-trade", icon: <PlusCircle className="w-6 h-6" />, isPrimary: true },
  { name: "Calendar", href: "/calendar", icon: <CalendarDays className="w-6 h-6" /> },
];

const moreNavItems = [
  { name: "Analytics", href: "/analytics", icon: <BarChart3 className="w-5 h-5" /> },
  { name: "Trade Journal", href: "/journal", icon: <BookOpen className="w-5 h-5" /> },
  { name: "Settings", href: "/settings", icon: <Settings className="w-5 h-5" /> },
];

export function MobileNavigation() {
  const pathname = usePathname();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  const isActive = (href: string) => {
    if (href === "/" && pathname !== "/") return false;
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-md border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            T
          </div>
          <span className="font-bold tracking-tight text-foreground">TradingJournal</span>
        </div>
      </header>

      {/* More Menu Overlay */}
      {isMoreMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40 mb-16 flex flex-col justify-end">
          <div className="bg-card border-t border-border rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">More</h3>
              <button 
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-2 rounded-full bg-white/5 text-foreground/60 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="space-y-2">
              {moreNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMoreMenuOpen(false)}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    isActive(item.href)
                      ? "bg-primary/10 text-primary font-medium"
                      : "bg-white/5 text-foreground/80"
                  }`}
                >
                  <div className={isActive(item.href) ? "text-primary" : "text-foreground/50"}>
                    {item.icon}
                  </div>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-card border-t border-border z-50 px-2 pb-safe">
        <div className="flex items-center justify-between h-full max-w-md mx-auto">
          {mainNavItems.map((item) => {
            const active = isActive(item.href);
            
            if (item.isPrimary) {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex flex-col items-center justify-center -mt-6 relative z-10"
                >
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-medium mt-1 text-foreground/60">{item.name}</span>
                </Link>
              );
            }
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
                  active ? "text-primary" : "text-foreground/50"
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
          
          {/* More Button */}
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
              isMoreMenuOpen ? "text-primary" : "text-foreground/50"
            }`}
          >
            <Menu className="w-6 h-6" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
