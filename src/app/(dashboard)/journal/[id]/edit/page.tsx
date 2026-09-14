"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import JournalForm from "@/components/journal/JournalForm";

interface JournalEntryData {
  id?: string;
  entryDate: string;
  marketThoughts?: string | null;
  whatWentWell?: string | null;
  whatWentWrong?: string | null;
  mistakes?: string | null;
  lessons?: string | null;
}

export default function EditJournalPage() {
  const params = useParams();
  const router = useRouter();
  const [initialData, setInitialData] = useState<JournalEntryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await fetch(`/api/journal/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch journal entry");
        const data = await res.json();
        setInitialData(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchEntry();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-center">Edit Journal Entry</h1>
        <div className="p-6 max-w-3xl mx-auto h-[600px] animate-pulse bg-card border border-border rounded-xl" />
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Edit Journal Entry</h1>
        <p className="text-red-500 my-4">{error || "Entry not found"}</p>
        <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted" onClick={() => router.push("/journal")}>
          Back to Journal
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-center">Edit Journal Entry</h1>
      </div>
      <JournalForm initialData={initialData} isEdit={true} />
    </div>
  );
}
