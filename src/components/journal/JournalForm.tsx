"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


interface JournalEntryData {
  id?: string;
  entryDate: string;
  marketThoughts?: string | null;
  whatWentWell?: string | null;
  whatWentWrong?: string | null;
  mistakes?: string | null;
  lessons?: string | null;
}

interface JournalFormProps {
  initialData?: JournalEntryData;
  isEdit?: boolean;
}

export default function JournalForm({ initialData, isEdit = false }: JournalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultDate = initialData?.entryDate 
    ? new Date(initialData.entryDate).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    entryDate: defaultDate,
    marketThoughts: initialData?.marketThoughts || "",
    whatWentWell: initialData?.whatWentWell || "",
    whatWentWrong: initialData?.whatWentWrong || "",
    mistakes: initialData?.mistakes || "",
    lessons: initialData?.lessons || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEdit ? `/api/journal/${initialData?.id}` : `/api/journal`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Make sure we pass an ISO string that corresponds to the start of the selected local date
          // Simplest is to append time to make it valid ISO if required by schema, but schema uses `z.string().transform(d => new Date(d))` 
          entryDate: formData.entryDate,
          marketThoughts: formData.marketThoughts || undefined,
          whatWentWell: formData.whatWentWell || undefined,
          whatWentWrong: formData.whatWentWrong || undefined,
          mistakes: formData.mistakes || undefined,
          lessons: formData.lessons || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save journal entry");
      }

      router.push("/journal");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred while saving");
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto border border-border/50 bg-card rounded-xl shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="entryDate" className="text-sm font-medium leading-none">Date</label>
          <input 
            type="date" 
            id="entryDate" 
            name="entryDate" 
            value={formData.entryDate} 
            onChange={handleChange} 
            required
            className="flex h-10 w-full sm:w-auto rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="marketThoughts" className="text-sm font-medium leading-none">How was the market? (Market Thoughts)</label>
          <textarea 
            id="marketThoughts" 
            name="marketThoughts" 
            value={formData.marketThoughts} 
            onChange={handleChange} 
            placeholder="Market was trending after the opening range..." 
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="whatWentWell" className="text-sm font-medium leading-none">What went well?</label>
          <textarea 
            id="whatWentWell" 
            name="whatWentWell" 
            value={formData.whatWentWell} 
            onChange={handleChange} 
            placeholder="Waited for confirmation." 
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="whatWentWrong" className="text-sm font-medium leading-none">What went wrong?</label>
          <textarea 
            id="whatWentWrong" 
            name="whatWentWrong" 
            value={formData.whatWentWrong} 
            onChange={handleChange} 
            placeholder="Entered the second setup too early." 
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="mistakes" className="text-sm font-medium leading-none">Mistakes</label>
          <textarea 
            id="mistakes" 
            name="mistakes" 
            value={formData.mistakes} 
            onChange={handleChange} 
            placeholder="Chased price after missing the first entry." 
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="lessons" className="text-sm font-medium leading-none">Lessons</label>
          <textarea 
            id="lessons" 
            name="lessons" 
            value={formData.lessons} 
            onChange={handleChange} 
            placeholder="Wait for confirmation instead of chasing." 
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
          />
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-border/50">
          <button type="button" className="px-4 py-2 hover:bg-muted text-sm font-medium rounded-md transition-colors" onClick={() => router.back()} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors shadow" disabled={loading}>
            {loading ? "Saving..." : "Save Entry"}
          </button>
        </div>
      </form>
    </div>
  );
}
