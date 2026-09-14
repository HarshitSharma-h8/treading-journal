import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PostTradeReflectionProps {
  whatWentWell: string;
  setWhatWentWell: (v: string) => void;
  whatWentWrong: string;
  setWhatWentWrong: (v: string) => void;
  lesson: string;
  setLesson: (v: string) => void;
}

export function PostTradeReflection({
  whatWentWell,
  setWhatWentWell,
  whatWentWrong,
  setWhatWentWrong,
  lesson,
  setLesson,
}: PostTradeReflectionProps) {
  const [isExpanded, setIsExpanded] = useState(
    !!(whatWentWell || whatWentWrong || lesson)
  );

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden mt-8">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-sm font-medium hover:bg-white/5 transition-colors"
      >
        <span className="flex items-center gap-2">
          Add reflection
          <span className="text-foreground/50 text-xs font-normal uppercase tracking-widest ml-2">After the trade</span>
        </span>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 border-t border-border space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">What went well?</label>
            <input
              type="text"
              value={whatWentWell}
              onChange={(e) => setWhatWentWell(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g. Waited for confirmation"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">What went wrong?</label>
            <input
              type="text"
              value={whatWentWrong}
              onChange={(e) => setWhatWentWrong(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g. Exit was slightly early"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Lesson?</label>
            <input
              type="text"
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g. Let the setup develop"
            />
          </div>
        </div>
      )}
    </div>
  );
}
