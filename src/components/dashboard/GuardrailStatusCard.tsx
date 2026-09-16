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
  
  const [showNewCycleInput, setShowNewCycleInput] = useState(false);
  const [newBaseCapital, setNewBaseCapital] = useState("");
  const [newProfitGuardrail, setNewProfitGuardrail] = useState("");
  const [newLossGuardrail, setNewLossGuardrail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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

  const handleTakeBreak = async (type: "PROFIT" | "LOSS", reason: string) => {
    setLoading(true);
    try {
      await fetch("/api/capital/break", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          triggerBalance: currentBalance,
          guardrailType: type,
          reason,
        }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async (type: "PROFIT" | "LOSS") => {
    setLoading(true);
    try {
      await fetch("/api/capital/continue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guardrailType: type,
          currentBalance: currentBalance,
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

  const handleStartNewCycle = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/capital/cycle/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseCapital: Number(newBaseCapital),
          profitGuardrail: Number(newProfitGuardrail),
          lossGuardrail: Number(newLossGuardrail),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to start new cycle");
        setLoading(false);
        return;
      }
      setShowNewCycleInput(false);
      setNewBaseCapital("");
      setNewProfitGuardrail("");
      setNewLossGuardrail("");
      router.refresh();
    } catch (e) {
      console.error(e);
      setErrorMsg("An error occurred");
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
      <div className="flex justify-between items-center mb-3 shrink-0">
        <h3 className="text-lg font-bold text-foreground">Capital Guardrails</h3>
        <button className="bg-background border border-border text-primary hover:bg-muted px-3 py-1 rounded-full text-xs font-medium transition-colors">
          Edit
        </button>
      </div>

      <div className="space-y-2 flex-1 flex flex-col">
        {/* Current Capital */}
        <div className="bg-background/50 border border-border/50 rounded-xl p-3 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-medium">Current Capital</p>
            <p className={`text-lg font-bold tracking-tight ${currentBalance < 0
              ? "text-red-500"
              : currentBalance > 0
                ? "text-green-500"
                : "text-foreground"
              }`}>₹{currentBalance.toLocaleString()}</p>
          </div>
        </div>

        {/* Profit Guardrail */}
        <div className="bg-background/50 border border-border/50 rounded-xl p-2 flex gap-4 shrink-0">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success shrink-0 shadow-[0_0_15px_var(--color-success-light)] mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-0.1">
              <p className="text-xs text-muted-foreground font-medium">Profit Guardrail</p>
              {profitGuardrail && (
                <p className="text-xs text-foreground/80 font-medium">₹{Math.max(0, profitBuffer).toLocaleString()} to go</p>
              )}
            </div>
            <p className="text-lg font-bold text-foreground mb-2">₹{profitGuardrail?.toLocaleString() || "Not set"}</p>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full transition-all duration-500 ease-out" style={{ width: `${profitPercentage}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground w-6 text-right font-medium">{Math.round(profitPercentage)}%</span>
            </div>
          </div>
        </div>

        {/* Loss Guardrail */}
        <div className="bg-background/50 border border-border/50 rounded-xl p-2 flex gap-4 shrink-0">
          <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center text-danger shrink-0 shadow-[0_0_15px_var(--color-danger-light)] mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v8" /><path d="m8 12 4 4 4-4" /></svg>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-0.1">
              <p className="text-xs text-muted-foreground font-medium">Loss Guardrail</p>
              {lossGuardrail && (
                <p className="text-xs text-foreground/80 font-medium">₹{Math.max(0, lossBuffer).toLocaleString()} buffer</p>
              )}
            </div>
            <p className="text-lg font-bold text-foreground mb-2">₹{lossGuardrail?.toLocaleString() || "Not set"}</p>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-danger rounded-full transition-all duration-500 ease-out" style={{ width: `${lossPercentage}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground w-6 text-right font-medium">{Math.round(lossPercentage)}%</span>
            </div>
          </div>
        </div>

        {/* STATUS AREAS */}
        <div className="pt-1 mt-auto">
          {status === "NORMAL" && (
            <div className="bg-background/30 border border-border/30 rounded-xl p-3 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-3 h-3 rounded-full bg-success shadow-[0_0_8px_var(--color-success)] animate-pulse" />
                <h4 className="font-semibold text-success text-sm">Trading Normally</h4>
              </div>
              <p className="text-xs text-muted-foreground ml-5">You&apos;re within your guardrails. Keep following your plan!</p>
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
              <h4 className="font-semibold text-success text-sm mb-1">🟢 Profit Guardrail Reached</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Your capital is above your profit guardrail. Consider protecting some of your gains.
              </p>
              {!showWithdrawalInput ? (
                <>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setWithdrawalAmount((currentBalance > baseCapital ? currentBalance - baseCapital : 0).toString());
                        setShowWithdrawalInput(true);
                      }}
                      className="flex-[2] bg-success text-success-foreground py-1.5 px-3 rounded text-xs font-semibold hover:bg-success/90 transition-colors"
                    >
                      Withdraw
                    </button>
                    <button
                      onClick={() => handleContinue("PROFIT")}
                      disabled={loading}
                      className="flex-1 bg-transparent border border-success/30 text-success py-1.5 px-3 rounded text-xs font-medium hover:bg-success/10 transition-colors"
                    >
                      Continue
                    </button>
                    <button
                      onClick={() => handleTakeBreak("PROFIT", "Profit guardrail hit")}
                      disabled={loading}
                      className="flex-1 bg-transparent border border-success/30 text-success py-1.5 px-3 rounded text-xs font-medium hover:bg-success/10 transition-colors"
                    >
                      Break
                    </button>
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={() => setShowNewCycleInput(true)}
                      disabled={loading}
                      className="w-full bg-background border border-border text-foreground py-1.5 rounded text-xs font-semibold hover:bg-muted transition-colors"
                    >
                      Start New Cycle
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                    <span>Keep base: ₹{baseCapital.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="Amount"
                      className="flex-1 bg-card border border-border rounded py-1.5 px-3 text-xs text-foreground focus:outline-none focus:border-success"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                    />
                    <button
                      onClick={() => setShowWithdrawalInput(false)}
                      disabled={loading}
                      className="bg-transparent border border-border text-foreground py-1.5 px-3 rounded text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRecordWithdrawal}
                      disabled={loading || !withdrawalAmount}
                      className="bg-success text-success-foreground py-1.5 px-3 rounded text-xs font-semibold disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {status === "LOSS_GUARDRAIL_HIT" && (
            <div className="bg-danger/5 border border-danger/20 rounded-xl p-2 flex flex-col justify-center">
              <h4 className="font-semibold text-danger text-sm flex items-center gap-2 mb-1">
                🔴 Loss Guardrail Reached
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Your capital has reached your loss guardrail. 
                {/* Consider taking a break and reviewing your trades. */}
              </p>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => handleTakeBreak("LOSS", "Loss guardrail hit")}
                  disabled={loading}
                  className="flex-[2] bg-danger text-danger-foreground py-1.5 px-3 rounded text-xs font-semibold hover:bg-danger/90 transition-colors"
                >
                  Take a Break
                </button>
                <button
                  onClick={() => handleContinue("LOSS")}
                  disabled={loading}
                  className="flex-1 bg-transparent border border-danger/30 text-danger py-1.5 px-3 rounded text-xs font-medium hover:bg-danger/10 transition-colors"
                >
                  Continue
                </button>
              </div>
              <button
                onClick={() => setShowNewCycleInput(true)}
                disabled={loading}
                className="w-full bg-background border border-border text-foreground py-1.5 rounded text-xs font-semibold hover:bg-muted transition-colors"
              >
                Start New Cycle
              </button>
            </div>
          )}

          {status === "BREAK_ACTIVE" && (
            <div className="bg-warning/5 border border-warning/20 rounded-xl p-2 flex flex-col justify-center">
              <h4 className="font-semibold text-warning text-sm mb-1">🟡 Trading Break Active</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Review your recent journal before returning.
              </p>
              {!showResumeInput ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push('/journal')}
                    className="flex-[2] bg-warning text-warning-foreground py-2 rounded text-xs font-semibold hover:bg-warning/90 transition-colors flex items-center justify-center gap-2"
                  >
                    Review Trade Journal
                  </button>
                  <button
                    onClick={() => setShowResumeInput(true)}
                    className="flex-1 bg-transparent border border-warning/30 text-warning py-2 rounded text-xs font-medium hover:bg-warning/10 transition-colors flex items-center justify-center"
                  >
                    Resume
                  </button>
                </div>
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
          
          {showNewCycleInput && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="bg-card border border-border p-6 rounded-xl w-full max-w-sm shadow-lg">
                <h3 className="text-lg font-bold mb-2">Start New Capital Cycle</h3>
                <p className="text-xs text-muted-foreground mb-4">Set your new capital limits.</p>
                
                {errorMsg && (
                  <div className="bg-danger/10 text-danger text-xs p-2 rounded mb-4">
                    {errorMsg}
                  </div>
                )}
                
                <div className="space-y-3 mb-5">
                  <div>
                    <label className="text-xs font-medium block mb-1">New Base Capital (₹)</label>
                    <input 
                      type="number" 
                      value={newBaseCapital}
                      onChange={(e) => setNewBaseCapital(e.target.value)}
                      className="w-full bg-background border border-border rounded py-2 px-3 text-sm focus:outline-none focus:border-primary"
                      placeholder="e.g. 12000"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1">New Profit Guardrail (₹)</label>
                    <input 
                      type="number" 
                      value={newProfitGuardrail}
                      onChange={(e) => setNewProfitGuardrail(e.target.value)}
                      className="w-full bg-background border border-border rounded py-2 px-3 text-sm focus:outline-none focus:border-primary"
                      placeholder="e.g. 14000"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1">New Loss Guardrail (₹)</label>
                    <input 
                      type="number" 
                      value={newLossGuardrail}
                      onChange={(e) => setNewLossGuardrail(e.target.value)}
                      className="w-full bg-background border border-border rounded py-2 px-3 text-sm focus:outline-none focus:border-primary"
                      placeholder="e.g. 10000"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setShowNewCycleInput(false);
                      setErrorMsg("");
                    }}
                    disabled={loading}
                    className="flex-1 border border-border bg-transparent text-foreground py-2 rounded text-sm font-semibold hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleStartNewCycle}
                    disabled={loading || !newBaseCapital || !newProfitGuardrail || !newLossGuardrail}
                    className="flex-[2] bg-primary text-primary-foreground py-2 rounded text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    Start New Cycle
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
