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
    : 0;

  const totalLossRange = lossGuardrail ? baseCapital - lossGuardrail : 0;
  const currentLossProgress = lossGuardrail ? baseCapital - currentBalance : 0;
  const lossPercentage = totalLossRange > 0 
    ? Math.max(0, Math.min(100, (currentLossProgress / totalLossRange) * 100)) 
    : 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col h-full w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-foreground">Capital Guardrails</h3>
        <button className="bg-muted text-primary hover:bg-muted/80 px-3 py-1 rounded-md text-sm font-medium transition-colors">
          Edit
        </button>
      </div>

      <div className="space-y-4 flex-1">
        {/* Current Capital */}
        <div className="bg-background border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-0.5">Current Capital</p>
            <p className="text-2xl font-bold text-foreground">₹{currentBalance.toLocaleString()}</p>
          </div>
        </div>

        {/* Profit Guardrail */}
        <div className="bg-background border border-border rounded-xl p-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success shrink-0 shadow-[0_0_15px_var(--color-success-light)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
            <div className="flex-1 w-full">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className="text-sm text-muted-foreground">Profit Guardrail</p>
                  <p className="text-xl font-bold text-foreground">₹{profitGuardrail?.toLocaleString() || "Not set"}</p>
                </div>
                {profitGuardrail && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">₹{Math.max(0, profitBuffer).toLocaleString()} to go</p>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: `${profitPercentage}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{Math.round(profitPercentage)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loss Guardrail */}
        <div className="bg-background border border-border rounded-xl p-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center text-danger shrink-0 shadow-[0_0_15px_var(--color-danger-light)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="m8 12 4 4 4-4"/></svg>
            </div>
            <div className="flex-1 w-full">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className="text-sm text-muted-foreground">Loss Guardrail</p>
                  <p className="text-xl font-bold text-foreground">₹{lossGuardrail?.toLocaleString() || "Not set"}</p>
                </div>
                {lossGuardrail && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">₹{Math.max(0, lossBuffer).toLocaleString()} buffer</p>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-danger rounded-full" style={{ width: `${lossPercentage}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{Math.round(lossPercentage)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATUS AREAS */}
        <div className="pt-2 mt-auto">
          {status === "NORMAL" && (
            <div className="bg-background border border-success/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-3 h-3 rounded-full bg-success shadow-[0_0_8px_var(--color-success)] animate-pulse" />
                <h4 className="font-semibold text-success">Trading Normally</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-6">You're within your guardrails. Keep following your plan!</p>
            </div>
          )}

          {status === "APPROACHING_PROFIT" && (
            <div className="bg-background border border-success/40 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-3 h-3 rounded-full bg-success" />
                <h4 className="font-semibold text-success">Near Profit Guardrail</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-6">You are close to your profit goal. Consider your next moves carefully.</p>
            </div>
          )}

          {status === "APPROACHING_LOSS" && (
            <div className="bg-background border border-warning/40 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-1">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <h4 className="font-semibold text-warning">Near Loss Guardrail</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-7">Be careful, you are approaching your loss limit.</p>
            </div>
          )}

          {status === "PROFIT_GUARDRAIL_HIT" && (
            <div className="bg-background border border-success rounded-xl p-4 shadow-[0_0_15px_var(--color-success-light)]">
              <h4 className="font-semibold text-success mb-1">Profit Guardrail Reached</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Consider protecting some of the profit before continuing.
              </p>
              {!showWithdrawalInput ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowWithdrawalInput(true)}
                    className="flex-1 bg-success text-success-foreground py-1.5 px-3 rounded text-sm font-semibold hover:bg-success/90 transition-colors"
                  >
                    Withdraw
                  </button>
                  <button className="flex-1 bg-transparent border border-success/30 text-success py-1.5 px-3 rounded text-sm font-medium hover:bg-success/10 transition-colors">
                    Keep Trading
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <input 
                    type="number"
                    placeholder="Amount"
                    className="flex-1 bg-card border border-border rounded py-1.5 px-3 text-sm text-foreground focus:outline-none focus:border-success"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                  />
                  <button 
                    onClick={handleRecordWithdrawal}
                    disabled={loading || !withdrawalAmount}
                    className="bg-success text-success-foreground py-1.5 px-4 rounded text-sm font-semibold disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          )}

          {status === "LOSS_GUARDRAIL_HIT" && (
            <div className="bg-background border border-danger rounded-xl p-4 shadow-[0_0_15px_var(--color-danger-light)]">
              <h4 className="font-semibold text-danger flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4" />
                Loss Guardrail Reached
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Consider taking a break and reviewing your trades.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={handleTakeBreak}
                  disabled={loading}
                  className="flex-1 bg-danger text-danger-foreground py-1.5 px-3 rounded text-sm font-semibold hover:bg-danger/90 transition-colors"
                >
                  Take a Break
                </button>
                <button 
                  onClick={() => router.push('/journal')}
                  className="flex-1 bg-transparent border border-danger/30 text-danger py-1.5 px-3 rounded text-sm font-medium hover:bg-danger/10 transition-colors"
                >
                  Review
                </button>
              </div>
            </div>
          )}

          {status === "BREAK_ACTIVE" && (
            <div className="bg-background border border-warning rounded-xl p-4">
              <h4 className="font-semibold text-warning mb-1">Trading Break Active</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Review your journal before returning.
              </p>
              {!showResumeInput ? (
                <button 
                  onClick={() => setShowResumeInput(true)}
                  className="w-full bg-warning text-warning-foreground py-2 rounded text-sm font-semibold hover:bg-warning/90 transition-colors flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-5 h-5" />
                  Resume Trading
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Adjust active capital? (Optional)</p>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="number"
                      placeholder={`e.g. ${currentBalance}`}
                      className="flex-1 bg-card border border-border rounded py-1.5 px-3 text-sm text-foreground focus:outline-none focus:border-warning"
                      value={newCapitalAmount}
                      onChange={(e) => setNewCapitalAmount(e.target.value)}
                    />
                    <button 
                      onClick={handleResumeTrading}
                      disabled={loading}
                      className="bg-warning text-warning-foreground py-1.5 px-4 rounded text-sm font-semibold disabled:opacity-50"
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
