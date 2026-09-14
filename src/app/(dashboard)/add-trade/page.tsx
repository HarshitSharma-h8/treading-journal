import { TradeForm } from "@/components/add-trade/TradeForm";

export const metadata = {
  title: "Add Trade | Trading Journal",
  description: "Record your trade in the trading journal",
};

export default async function AddTradePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const isEditMode = !!resolvedParams.id;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Top subtle glow matching dashboard */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {isEditMode ? "EDIT TRADE" : "ADD TRADE"}
          </h1>
          <p className="text-foreground/60 text-lg">
            {isEditMode ? "Update your trade details" : "Record your trade"}
          </p>
        </div>
        
        <TradeForm tradeId={resolvedParams.id} />
      </main>
    </div>
  );
}
