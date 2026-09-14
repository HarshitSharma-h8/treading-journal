"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OnboardingModalProps {
  onComplete?: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    experienceLevel: "Beginner",
    primaryMarket: "Stocks",
    startingCapital: "",
    profitGuardrail: "",
    lossGuardrail: "",
  });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startingCapital: Number(formData.startingCapital),
          profitGuardrail: Number(formData.profitGuardrail),
          lossGuardrail: Number(formData.lossGuardrail),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete onboarding");
      }

      if (onComplete) {
        onComplete();
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 flex-1 rounded-full ${step >= i ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {step === 1 && "Basic Profile"}
            {step === 2 && "Trading Account"}
            {step === 3 && "Capital Guardrails"}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {step === 1 && "Let's set up your trading profile."}
            {step === 2 && "What amount do you currently trade with?"}
            {step === 3 && "Set limits to help maintain discipline."}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Trading Experience</label>
                <select 
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Primary Market</label>
                <select 
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.primaryMarket}
                  onChange={(e) => setFormData({ ...formData, primaryMarket: e.target.value })}
                >
                  <option>Stocks</option>
                  <option>Options</option>
                  <option>Futures</option>
                  <option>Crypto</option>
                  <option>Forex</option>
                </select>
              </div>
            </>
          )}

          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Current Trading Capital (₹)</label>
              <input 
                type="number"
                min="0"
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. 10000"
                value={formData.startingCapital}
                onChange={(e) => setFormData({ ...formData, startingCapital: e.target.value })}
              />
            </div>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Profit Guardrail (₹)</label>
                <input 
                  type="number"
                  min="0"
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. 15000"
                  value={formData.profitGuardrail}
                  onChange={(e) => setFormData({ ...formData, profitGuardrail: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">When your account reaches this level, we'll remind you to consider protecting some profit.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1 mt-4">Loss Guardrail (₹)</label>
                <input 
                  type="number"
                  min="0"
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. 8000"
                  value={formData.lossGuardrail}
                  onChange={(e) => setFormData({ ...formData, lossGuardrail: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">When your account reaches this level, we'll remind you to stop and review before continuing.</p>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex justify-between gap-3">
          {step > 1 ? (
            <button 
              onClick={prevStep}
              className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
            >
              Back
            </button>
          ) : (
            <div /> // placeholder for spacing
          )}
          
          {step < 3 ? (
            <button 
              onClick={nextStep}
              disabled={step === 2 && !formData.startingCapital}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={loading || !formData.profitGuardrail || !formData.lossGuardrail}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Saving...
                </>
              ) : "Finish Setup"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
