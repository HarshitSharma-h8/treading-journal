"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
      <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Unable to load your trading data.</h2>
      <p className="text-foreground/60 max-w-md mb-8">
        We encountered a problem while fetching your dashboard metrics. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-medium transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
