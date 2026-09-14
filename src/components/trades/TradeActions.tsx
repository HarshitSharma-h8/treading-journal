"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X } from "lucide-react";
import { deleteTrade } from "@/lib/api/trades";

interface TradeActionsProps {
  tradeId: string;
}

export function TradeActions({ tradeId }: TradeActionsProps) {
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleEdit = () => {
    router.push(`/add-trade?id=${tradeId}`);
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTrade(tradeId);
      router.push("/trades");
      router.refresh();
    } catch (err) {
      console.error("Failed to delete trade", err);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={handleEdit}
          className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Edit Trade
        </button>
        <button
          onClick={() => setShowConfirmDialog(true)}
          className="flex items-center gap-2 bg-danger/10 text-danger hover:bg-danger/20 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-border/50">
              <h3 className="font-bold text-lg">Delete this trade?</h3>
              <button 
                onClick={() => setShowConfirmDialog(false)}
                className="text-foreground/50 hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5">
              <p className="text-foreground/70 mb-6">
                This action cannot be undone. All data and screenshots for this trade will be permanently removed.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 rounded-lg font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg font-medium bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete Trade"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
