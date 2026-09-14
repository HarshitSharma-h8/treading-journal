"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Send, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call for password reset
    // We don't reveal if the email exists to prevent enumeration
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50 p-4 selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 -z-10" />
      
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-zinc-100">TRADING JOURNAL</h1>
          <p className="text-zinc-400">Reset your password</p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          
          {submitted ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-400">
                <Send className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-zinc-100 mb-2">Check your email</h3>
                <p className="text-zinc-400 text-sm">
                  If an account exists for <span className="text-zinc-200">{email}</span>, you will receive password reset instructions.
                </p>
              </div>
              <Link
                href="/login"
                className="w-full bg-zinc-800 text-zinc-100 hover:bg-zinc-700 font-medium rounded-xl py-2.5 flex items-center justify-center gap-2 transition-colors mt-6"
              >
                <ArrowLeft className="w-4 h-4" /> Return to log in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-zinc-100 placeholder:text-zinc-600"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-100 text-zinc-900 hover:bg-white font-medium rounded-xl py-2.5 flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Send reset instructions
                  </>
                )}
              </button>
            </form>
          )}

          {!submitted && (
            <div className="mt-8 text-center text-sm text-zinc-400">
              <Link href="/login" className="flex items-center justify-center gap-1.5 text-zinc-400 hover:text-white transition-all">
                <ArrowLeft className="w-4 h-4" /> Back to log in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
