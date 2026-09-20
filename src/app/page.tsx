import Link from "next/link";
import { ArrowRight, BarChart2, Shield, Zap, Target, TrendingUp, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative bg-[var(--color-background)] text-[var(--color-foreground)] overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-[var(--color-primary-glow)] rounded-full blur-[150px] opacity-30 transform translate-x-1/4 translate-y-1/4"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-[var(--color-accent-glow)] rounded-full blur-[150px] opacity-30 transform -translate-x-1/4 -translate-y-1/4"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-[var(--color-border)] backdrop-blur-md bg-[var(--color-background)]/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">TradeJournal</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#analytics" className="hover:text-white transition-colors">Analytics</Link>
          <Link href="#testimonials" className="hover:text-white transition-colors">Testimonials</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-medium hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/signup" 
            className="text-sm font-medium px-4 py-2 rounded-full bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card)]/50 backdrop-blur-sm mb-8">
            <span className="flex h-2 w-2 rounded-full bg-[var(--color-primary)]"></span>
            <span className="text-xs font-medium">TradeJournal v2.0 is now live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl">
            Master your trades with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
              precision analytics.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl">
            The ultimate trading journal that helps you track performance, analyze patterns, and build the discipline needed to become consistently profitable.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link 
              href="/signup" 
              className="group relative w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-semibold text-lg overflow-hidden transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Trading Smarter
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
            </Link>
            
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-[var(--color-border)] bg-[var(--color-card)]/50 text-[var(--color-foreground)] font-semibold text-lg hover:bg-[var(--color-card)] transition-colors flex items-center justify-center"
            >
              View Demo
            </Link>
          </div>
        </section>

        {/* Dashboard Preview (Glassmorphism Mockup) */}
        <section id="analytics" className="w-full max-w-6xl mx-auto px-6 pb-24 relative">
          <div className="relative rounded-2xl md:rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-card)]/40 backdrop-blur-xl p-4 md:p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50"></div>
            
            {/* Mockup Top Bar */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--color-border)]/50">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-400">Dashboard Preview</div>
            </div>

            {/* Mockup Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2 space-y-6">
                <div className="h-48 md:h-64 rounded-xl border border-[var(--color-border)] bg-gradient-to-b from-[var(--color-card)] to-transparent p-6 flex flex-col justify-end relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
                  <div className="relative z-10 flex justify-between items-end w-full h-24">
                    {[40, 60, 45, 80, 55, 90, 75, 100].map((h, i) => (
                      <div key={i} className="w-8 md:w-12 bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-accent)] rounded-t-sm" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/50 p-5">
                    <div className="text-gray-400 text-sm mb-2">Win Rate</div>
                    <div className="text-3xl font-bold text-[var(--color-success)]">68.5%</div>
                    <div className="text-xs text-[var(--color-success)] mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +2.4% this week</div>
                  </div>
                  <div className="h-32 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/50 p-5">
                    <div className="text-gray-400 text-sm mb-2">Net P&L</div>
                    <div className="text-3xl font-bold">$12,450</div>
                    <div className="text-xs text-gray-400 mt-2">Last 30 days</div>
                  </div>
                </div>
              </div>
              <div className="col-span-1 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${i === 2 ? 'bg-[var(--color-danger-light)] text-[var(--color-danger)]' : 'bg-[var(--color-success-light)] text-[var(--color-success)]'}`}>
                        {i === 2 ? <TrendingUp className="w-5 h-5 rotate-180" /> : <TrendingUp className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-medium">{i === 1 ? 'AAPL' : i === 2 ? 'TSLA' : 'BTC/USD'}</div>
                        <div className="text-xs text-gray-400">{i === 1 ? 'Long' : i === 2 ? 'Short' : 'Long'}</div>
                      </div>
                    </div>
                    <div className={`font-bold ${i === 2 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
                      {i === 2 ? '-$340' : '+$850'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full bg-[var(--color-card)]/30 border-t border-[var(--color-border)] py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need to succeed</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">Stop guessing. Start analyzing. Our platform provides the exact tools professional traders use to refine their edge.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <BarChart2 className="w-6 h-6" />,
                  title: "Advanced Analytics",
                  desc: "Dive deep into your performance with interactive charts, win-rate analysis, and risk-reward tracking."
                },
                {
                  icon: <Target className="w-6 h-6" />,
                  title: "Strategy Optimization",
                  desc: "Tag trades by strategy and discover exactly which setups are making you money and which are draining your account."
                },
                {
                  icon: <Zap className="w-6 h-6" />,
                  title: "Lightning Fast Entry",
                  desc: "Log your trades in seconds with our optimized interface. Spend less time logging and more time trading."
                },
                {
                  icon: <Shield className="w-6 h-6" />,
                  title: "Secure & Private",
                  desc: "Your trading data is encrypted and secure. We never share your personal strategies or financial information."
                },
                {
                  icon: <CheckCircle2 className="w-6 h-6" />,
                  title: "Psychology Tracking",
                  desc: "Record your emotional state for each trade to identify how your mood impacts your trading decisions."
                },
                {
                  icon: <TrendingUp className="w-6 h-6" />,
                  title: "Performance Goals",
                  desc: "Set weekly or monthly targets and track your progress in real-time right from your dashboard."
                }
              ].map((feature, i) => (
                <div key={i} className="group p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] hover:bg-[var(--color-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-[var(--color-primary)]/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary-glow)] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-primary)] mb-6 border border-[var(--color-primary)]/20 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="testimonials" className="w-full py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-primary-glow)] opacity-20 pointer-events-none"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to find your edge?</h2>
            <p className="text-xl text-gray-400 mb-10">Join thousands of traders who are already improving their performance.</p>
            <Link 
              href="/signup" 
              className="inline-flex px-8 py-4 rounded-full bg-[var(--color-foreground)] text-[var(--color-background)] font-bold text-lg hover:scale-105 transition-transform"
            >
              Create Your Free Account
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-[var(--color-border)] bg-[var(--color-background)] text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <TrendingUp className="w-4 h-4" />
            <span className="font-bold text-[var(--color-foreground)]">TradeJournal</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-[var(--color-foreground)] transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-[var(--color-foreground)] transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-[var(--color-foreground)] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
