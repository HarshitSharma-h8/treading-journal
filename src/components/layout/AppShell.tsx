import { Sidebar } from "./Sidebar";
import { MobileNavigation } from "./MobileNavigation";

export function AppShell({ 
  children,
  user
}: { 
  children: React.ReactNode;
  user?: { name?: string | null; email?: string } | null;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row w-full">
      <Sidebar user={user} />
      <MobileNavigation />
      
      {/* Main content area */}
      <main className="flex-1 md:ml-64 pb-24 pt-16 md:pb-0 md:pt-0 w-full relative">
        {/* subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
