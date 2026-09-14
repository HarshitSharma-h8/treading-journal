import JournalForm from "@/components/journal/JournalForm";

export const metadata = {
  title: "New Journal Entry | Trading Journal",
  description: "Reflect on your trading day",
};

export default function NewJournalPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-center">New Journal Entry</h1>
      </div>
      <JournalForm />
    </div>
  );
}
