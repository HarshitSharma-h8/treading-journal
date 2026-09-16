import { Direction } from "@/lib/types";

interface TradeTypeSelectorProps {
  value: Direction;
  onChange: (value: Direction) => void;
}

export function TradeTypeSelector({ value, onChange }: TradeTypeSelectorProps) {
  return (
    <div className="flex bg-card border border-border rounded-lg p-1">
      <button
        type="button"
        onClick={() => onChange("BUY")}
        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
          value === "BUY"
            ? "bg-success text-white shadow-sm shadow-success-light"
            : "text-foreground hover:bg-white/5"
        }`}
      >
        BUY
      </button>
      <button
        type="button"
        onClick={() => onChange("SELL")}
        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
          value === "SELL"
            ? "bg-danger text-white shadow-sm shadow-danger-light"
            : "text-foreground hover:bg-white/5"
        }`}
      >
        SELL
      </button>
    </div>
  );
}
