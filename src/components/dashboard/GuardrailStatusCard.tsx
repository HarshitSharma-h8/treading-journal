"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ShieldCheck, PlayCircle, LogOut } from "lucide-react";

interface GuardrailStatusCardProps {
  currentBalance: number;
  baseCapital: number;
  profitGuardrail: number | null;
  lossGuardrail: number | null;
  status: string;
  onRecordWithdrawal?: () => void;
  onTakeBreak?: () => void;
  onResumeTrading?: () => void;
}

export function GuardrailStatusCard({
  currentBalance,
  baseCapital,
  profitGuardrail,
  lossGuardrail,
  status,
}: GuardrailStatusCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [showWithdrawalInput, setShowWithdrawalInput] = useState(false);
  const [showResumeInput, setShowResumeInput] = useState(false);
  const [newCapitalAmount, setNewCapitalAmount] = useState("");

  const handleRecordWithdrawal = async () => {
    if (!withdrawalAmount || isNaN(Number(withdrawalAmount))) return;
    setLoading(true);
    try {
      await fetch("/api/capital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "WITHDRAWAL",
          amount: Number(withdrawalAmount),
          note: "Profit guardrail withdrawal",
        }),
      });
      setShowWithdrawalInput(false);
      setWithdrawalAmount("");
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeBreak = async () => {
    setLoading(true);
    try {
      await fetch("/api/capital/break", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          triggerBalance: currentBalance,
          guardrailType: "LOSS",
          reason: "Loss guardrail hit",
        }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeTrading = async () => {
    setLoading(true);
    try {
      await fetch("/api/capital/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newCapital: newCapitalAmount ? Number(newCapitalAmount) : null,
        }),
      });
      setShowResumeInput(false);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const profitBuffer = profitGuardrail ? profitGuardrail - currentBalance : 0;
  const lossBuffer = lossGuardrail ? currentBalance - lossGuardrail : 0;

  // Calculate percentages for progress bars
  const totalProfitRange = profitGuardrail ? profitGuardrail - baseCapital : 0;
  const currentProfitProgress = profitGuardrail ? currentBalance - baseCapital : 0;
  const profitPercentage = totalProfitRange > 0 
    ? Math.max(0, Math.min(100, (currentProfitProgress / totalProfitRange) * 100)) 
    : (currentBalance >= (profitGuardrail || Infinity) ? 100 : 0);

  const totalLossRange = lossGuardrail ? baseCapital - lossGuardrail : 0;
  const currentLossProgress = lossGuardrail ? baseCapital - currentBalance : 0;
  const lossPercentage = totalLossRange > 0 
    ? Math.max(0, Math.min(100, (currentLossProgress / totalLossRange) * 100)) 
    : (currentBalance <= (lossGuardrail || -Infinity) ? 100 : 0);

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col h-[450px] w-full">
      <div className="flex justify-between items-center mb-5 shrink-0">
        <h3 className="text-lg font-bold text-foreground">Capital Guardrails</h3>
        <button className="bg-background border border-border text-primary hover:bg-muted px-3 py-1 rounded-full text-xs font-medium transition-colors">
          Edit
        </button>
      </div>

      <div className="space-y-3 flex-1 flex flex-col">
        {/* Current Capital */}
        <div className="bg-background/50 border border-border/50 rounded-xl p-4 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-medium">Current Capital</p>
            <p className="text-2xl font-bold text-foreground tracking-tight">₹{currentBalance.toLocaleString()}</p>
          </div>
        </div>

        {/* Profit Guardrail */}
        <div className="bg-background/50 border border-border/50 rounded-xl p-4 flex gap-4 shrink-0">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success shrink-0 shadow-[0_0_15px_var(--color-success-light)] mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-0.5">
              <p className="text-xs text-muted-foreground font-medium">Profit Guardrail</p>
              {profitGuardrail && (
                <p className="text-xs text-foreground/80 font-medium">₹{Math.max(0, profitBuffer).toLocaleString()} to go</p>
              )}
            </div>
            <p className="text-xl font-bold text-foreground mb-2">₹{profitGuardrail?.toLocaleString() || "Not set"}</p>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full transition-all duration-500 ease-out" style={{ width: `${profitPercentage}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground w-6 text-right font-medium">{Math.round(profitPercentage)}%</span>
            </div>
          </div>
        </div>

        {/* Loss Guardrail */}
        <div className="bg-background/50 border border-border/50 rounded-xl p-4 flex gap-4 shrink-0">
          <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center text-danger shrink-0 shadow-[0_0_15px_var(--color-danger-light)] mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="m8 12 4 4 4-4"/></svg>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-0.5">
              <p className="text-xs text-muted-foreground font-medium">Loss Guardrail</p>
              {lossGuardrail && (
                <p className="text-xs text-foreground/80 font-medium">₹{Math.max(0, lossBuffer).toLocaleString()} buffer</p>
              )}
            </div>
            <p className="text-xl font-bold text-foreground mb-2">₹{lossGuardrail?.toLocaleString() || "Not set"}</p>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-danger rounded-full transition-all duration-500 ease-out" style={{ width: `${lossPercentage}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground w-6 text-right font-medium">{Math.round(lossPercentage)}%</span>
            </div>
          </div>
        </div>

        {/* STATUS AREAS */}
        <div className="pt-3 mt-auto">
          {status === "NORMAL" && (
            <div className="bg-background/30 border border-border/30 rounded-xl p-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-3 h-3 rounded-full bg-success shadow-[0_0_8px_var(--color-success)] animate-pulse" />
                <h4 className="font-semibold text-success text-sm">Trading Normally</h4>
              </div>
              <p className="text-xs text-muted-foreground ml-5">You're within your guardrails. Keep following your plan!</p>
            </div>
          )}

          {status === "APPROACHING_PROFIT" && (
            <div className="bg-background/30 border border-border/30 rounded-xl p-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-3 h-3 rounded-full bg-success" />
                <h4 className="font-semibold text-success text-sm">Near Profit Guardrail</h4>
              </div>
              <p className="text-xs text-muted-foreground ml-5">You are close to your profit goal. Consider your next moves carefully.</p>
            </div>
          )}

          {status === "APPROACHING_LOSS" && (
            <div className="bg-background/30 border border-border/30 rounded-xl p-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <h4 className="font-semibold text-warning text-sm">Near Loss Guardrail</h4>
              </div>
              <p className="text-xs text-muted-foreground ml-6">Be careful, you are approaching your loss limit.</p>
            </div>
          )}

          {status === "PROFIT_GUARDRAIL_HIT" && (
            <div className="bg-success/5 border border-success/20 rounded-xl p-4 flex flex-col justify-center">
              <h4 className="font-semibold text-success text-sm mb-1">Profit Guardrail Reached</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Consider protecting some of the profit before continuing.
              </p>
              {!showWithdrawalInput ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowWithdrawalInput(true)}
                    className="flex-1 bg-success text-success-foreground py-1.5 px-3 rounded text-xs font-semibold hover:bg-success/90 transition-colors"
                  >
                    Withdraw
                  </button>
                  <button className="flex-1 bg-transparent border border-success/30 text-success py-1.5 px-3 rounded text-xs font-medium hover:bg-success/10 transition-colors">
                    Keep Trading
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <input 
                    type="number"
                    placeholder="Amount"
                    className="flex-1 bg-card border border-border rounded py-1.5 px-3 text-xs text-foreground focus:outline-none focus:border-success"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                  />
                  <button 
                    onClick={handleRecordWithdrawal}
                    disabled={loading || !withdrawalAmount}
                    className="bg-success text-success-foreground py-1.5 px-3 rounded text-xs font-semibold disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          )}

          {status === "LOSS_GUARDRAIL_HIT" && (
            <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 flex flex-col justify-center">
              <h4 className="font-semibold text-danger text-sm flex items-center gap-2 mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Loss Guardrail Reached
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Consider taking a break and reviewing your trades.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={handleTakeBreak}
                  disabled={loading}
                  className="flex-1 bg-danger text-danger-foreground py-1.5 px-3 rounded text-xs font-semibold hover:bg-danger/90 transition-colors"
                >
                  Take a Break
                </button>
                <button 
                  onClick={() => router.push('/journal')}
                  className="flex-1 bg-transparent border border-danger/30 text-danger py-1.5 px-3 rounded text-xs font-medium hover:bg-danger/10 transition-colors"
                >
                  Review
                </button>
              </div>
            </div>
          )}

          {status === "BREAK_ACTIVE" && (
            <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 flex flex-col justify-center">
              <h4 className="font-semibold text-warning text-sm mb-1">Trading Break Active</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Review your journal before returning.
              </p>
              {!showResumeInput ? (
                <button 
                  onClick={() => setShowResumeInput(true)}
                  className="w-full bg-warning text-warning-foreground py-2 rounded text-xs font-semibold hover:bg-warning/90 transition-colors flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  Resume Trading
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground">Adjust active capital? (Optional)</p>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="number"
                      placeholder={`e.g. ${currentBalance}`}
                      className="flex-1 bg-card border border-border rounded py-1.5 px-3 text-xs text-foreground focus:outline-none focus:border-warning"
                      value={newCapitalAmount}
                      onChange={(e) => setNewCapitalAmount(e.target.value)}
                    />
                    <button 
                      onClick={handleResumeTrading}
                      disabled={loading}
                      className="bg-warning text-warning-foreground py-1.5 px-3 rounded text-xs font-semibold disabled:opacity-50"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
