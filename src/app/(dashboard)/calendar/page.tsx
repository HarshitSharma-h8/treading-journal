import TradingCalendar from "@/components/calendar/TradingCalendar";

export const metadata = {
  title: "Calendar | Trading Journal",
  description: "Your trading performance by day",
};

export default function CalendarPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <TradingCalendar />
    </div>
  );
}
