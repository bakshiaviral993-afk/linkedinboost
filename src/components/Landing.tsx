import React, { useState, useEffect } from "react";
import { Linkedin, Sparkles, TrendingUp, FileText, Zap, ShieldCheck, ArrowRight, ChevronDown, Check, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LandingProps {
  onAuthSuccess: (userId: string) => void;
}

export default function Landing({ onAuthSuccess }: LandingProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        onAuthSuccess(event.data.userId);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "lb_user_id" && event.newValue) {
        onAuthSuccess(event.newValue);
      }
    };

    // Fail-safe interval polling of localStorage
    const intervalId = setInterval(() => {
      const savedUserId = localStorage.getItem("lb_user_id");
      if (savedUserId) {
        clearInterval(intervalId);
        onAuthSuccess(savedUserId);
      }
    }, 1000);

    window.addEventListener("message", handleMessage);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, [onAuthSuccess]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/url");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      window.open(data.url, "linkedin_oauth", "width=600,height=700");
    } catch (err: any) {
      setError(err.message);
      setIsConnecting(false);
    }
  };

  const faqItems = [
    {
      q: "How does the profile analysis scoring system work?",
      a: "Our system runs your headline, about info, and experience records through Gemini 2.5 LLMs coupled with an actual 500+ LinkedIn expert rulebook. It assigns an optimization index score and maps precise micro-fixes for your hooks, CTAs, and keywords density."
    },
    {
      q: "Can I manage payments through Razorpay securely?",
      a: "Absolutely. Payment order forms are routed entirely through secure, state-certified Razorpay checkout widgets. We never store or preview card numbers, UPI credentials, or OTP logs directly inside our database endpoints."
    },
    {
      q: "How does the Perplexity/Kimi key fallback system play out?",
      a: "In the event that the primary Gemini model reaches local quota limits, Narratiq dynamically rolls back through other calibrated backup AI endpoints (such as Kimi, Perplexity, or Claude) to keep your post generation fully uninterrupted."
    },
    {
      q: "Can I downgrade my subscription anytime?",
      a: "Yes! There are no lock-in contract periods. You can cancel your subscription with a single click in the Billing & Usage tab, instantly reverting your profile limits to standard Lifetime Free access."
    }
  ];

  const pricingPlans = [
    {
      id: "free",
      name: "Free Trial",
      price: "₹0",
      description: "Step-one LinkedIn branding review.",
      features: ["5 Profile Analyses", "10 AI Generated Posts", "2 Roadmap Constructions"]
    },
    {
      id: "creator",
      name: "Creator",
      price: "₹299",
      description: "For highly active branding freelancers.",
      features: ["20 Profile Analyses / mo", "100 AI Generated Posts / mo", "10 Roadmap Constructions / mo"],
      popular: false
    },
    {
      id: "pro",
      name: "Pro Growth",
      price: "₹499",
      description: "The gold standard executive setup.",
      features: ["Unlimited Analyses", "Unlimited AI Post Gen", "Unlimited 30-Day Roadmaps", "24/7 Priority Support"],
      popular: true
    },
    {
      id: "agency",
      name: "Growth Agency",
      price: "₹2999",
      description: "Scale executive output across teams.",
      features: ["Everything in Pro", "API Access Credentials", "Custom PDF Reports Branding"],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden flex flex-col font-sans" id="landing-page-root">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }} 
      />
      
      {/* Dynamic Aura Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] bg-accent/8 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-10%] w-[50%] h-[50%] bg-accent2/8 blur-[130px] rounded-full pointer-events-none" />

      {/* Primary Top Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center border-b border-border/40 bg-surface/25 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-accent to-accent2 rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
            <Zap className="text-bg w-5 h-5 fill-current animate-pulse" />
          </div>
          <span className="font-display text-2xl font-black tracking-tight text-text">Narratiq</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex px-3 py-1 bg-surface2 text-muted text-xs font-semibold rounded-full border border-border">v2.5 Product Suite</span>
          <button 
            onClick={handleConnect}
            disabled={isConnecting}
            className="btn bg-accent hover:bg-accent/85 text-white py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-accent/10"
          >
            <Linkedin className="w-3.5 h-3.5 fill-current" />
            Get Started
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="relative z-10 flex-grow">
        <section className="container mx-auto px-6 text-center py-20 md:py-28 max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-surface2 border border-border/80 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] font-black text-text/80 uppercase tracking-widest">GEMINI 2.5 LINKEDIN REVENUE & ENGAGEMENT ENGINE</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-extrabold tracking-tighter leading-[0.95] text-text">
            Command Your <br />
            <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">Professional Voice</span>
          </h1>

          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Narratiq is the ultimate LinkedIn branding suite. Analyze profiles, optimize summaries, generate viral frameworks with high verisimilitude scores, and structure exact 30-day content strategies.
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 justify-center max-w-md mx-auto pt-4">
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="btn bg-accent hover:bg-accent/80 text-white py-4 px-8 text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent/25 transition-all duration-300 transform hover:scale-[1.01]"
            >
              {isConnecting ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Linkedin className="w-4 h-4 fill-current" />
                  Connect LinkedIn Profile
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-xs max-w-md mx-auto flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              {error}
            </div>
          )}
        </section>

        {/* FEATURES GRID SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-20 border-t border-border/40">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="badge badge-accent px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-accent/15 border border-accent/20">The Platform</span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-text">
              Fully Automated Branding Infrastructure
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Why leave personal growth to chance? Bring enterprise-grade predictive metrics to your executive profile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Sparkles, title: "Brutal Profile Analyzer", desc: "Instantly score headlines, summaries, and experience structures with actionable fix roadmaps.", color: "text-accent" },
              { icon: TrendingUp, title: "Predictive Post Generator", desc: "Generate multi-concept viral templates and hashtags engineered for high LinkedIn CTR algorithms.", color: "text-accent2" },
              { icon: Zap, title: "Section Rewrite Optimizer", desc: "Re-phrase personal profile sections instantly for ultimate corporate lookup and search indexing.", color: "text-gold" },
              { icon: FileText, title: "30-Day Campaign Blueprint", desc: "Build thematic recurring calendar roadmaps so you never look at a blank publishing sheet again.", color: "text-success" }
            ].map((f, i) => (
              <div key={i} className="card p-6 bg-surface border border-border flex flex-col justify-between transition-all duration-300 hover:border-accent/30 group">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-surface2 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <f.icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <h3 className="font-display text-lg font-bold mb-2 text-text">{f.title}</h3>
                  <p className="text-muted text-xs leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING GRID SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-20 border-t border-border/40">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="badge badge-accent px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-accent2/15 border border-accent2/20">Direct Value</span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-text">
              Predictable Pricing Tiers
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Unlock unlimited features with secured Razorpay credit gateway panels. Downgrade instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {pricingPlans.map((p) => (
              <div 
                key={p.id} 
                className={`card p-6 flex flex-col justify-between border relative transition-all duration-300 ${
                  p.popular 
                    ? "border-accent ring-2 ring-accent/30 bg-accent/4 shadow-xl" 
                    : "border-border bg-surface shadow-sm"
                }`}
              >
                {p.popular && (
                  <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-accent text-white px-3 py-0.5 text-[8px] font-extrabold rounded-full font-sans tracking-wider">
                    MOST POPULAR
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-display font-extrabold text-base text-text">{p.name}</h3>
                    <p className="text-[11px] text-muted leading-tight mt-1">{p.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold tracking-tight text-text">{p.price}</span>
                    <span className="text-[10px] text-muted">/mo</span>
                  </div>

                  <ul className="space-y-2.5 border-t border-border pt-4 text-xs text-text/90">
                    {p.features.map((f, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-success" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className={`w-full py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                      p.popular 
                        ? "bg-accent text-white hover:bg-accent/90" 
                        : "bg-surface2 text-text border border-border hover:bg-surface3"
                    }`}
                  >
                    Select Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-20 border-t border-border/40">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="badge badge-accent px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-gold/15 border border-gold/20">Beta Validated</span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-text">
              Loved by Elite Growth Leaders
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Hear directly from top creators who rely on Narratiq profiles optimization to secure deals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { text: "Narratiq helped me increase my LinkedIn profile views by 450% in just 3 weeks with its brutal feedback tool. The recommendations are instantly implementable.", author: "Sanjay Mehta", role: "SaaS Founder & Angle Investor" },
              { text: "The AI post rewriter is like magic. It translates my rough bullet points into high-engagement lead generation assets in seconds. Totally worth the creator plan.", author: "Priya Sharma", role: "Premium Freelance UX Designer" },
              { text: "Building my personal presence was always a secondary chore. Narratiq's automated 30-day strategy matrices changed everything. An absolute lifesaver.", author: "Aviral Bakshi", role: "BFSI Specialist & Narratiq Author" }
            ].map((t, idx) => (
              <div key={idx} className="card p-6 bg-surface/50 border border-border flex flex-col justify-between hover:scale-[1.01] transition-transform shadow-sm">
                <div className="space-y-4">
                  <MessageSquare className="w-5 h-5 text-accent/30" />
                  <p className="text-xs text-text/90 italic leading-relaxed">"{t.text}"</p>
                </div>
                <div className="pt-6 border-t border-border/50 mt-4">
                  <div className="font-bold text-xs text-text">{t.author}</div>
                  <div className="text-[10px] text-muted">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="max-w-4xl mx-auto px-6 py-20 border-t border-border/40">
          <div className="text-center space-y-3 mb-16">
            <span className="badge badge-accent px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-success/15 border border-success/20">FAQ Answers</span>
            <h2 className="text-3xl font-display font-extrabold tracking-tight text-text">
              Frequently Clarified Inquiries
            </h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((faq, i) => (
              <div 
                key={i} 
                className="card p-5 bg-surface border border-border/80 rounded-xl cursor-pointer select-none transition-all hover:border-accent/20"
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <div className="flex justify-between items-center gap-4">
                  <h4 className="font-semibold text-sm text-text">{faq.q}</h4>
                  <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-300 ${activeFaq === i ? "rotate-180" : ""}`} />
                </div>
                {activeFaq === i && (
                  <p className="text-xs text-muted leading-relaxed mt-3.5 pt-3 border-t border-border/40 animate-fade-in pl-1">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM FINAL CTA */}
        <section className="max-w-5xl mx-auto px-6 py-12 mb-20">
          <div className="card p-10 bg-gradient-to-br from-accent/10 to-accent2/10 border border-accent/20 flex flex-col items-center text-center space-y-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Zap className="w-48 h-48 text-accent" />
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-text">
              Start Scaling Your Brand Reach Today
            </h2>
            <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto leading-relaxed">
              Connect your authentic profile safely. Leverage elite generative frameworks and join hundreds of professional creators in the executive ring.
            </p>

            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="btn bg-accent hover:bg-accent/90 text-white font-extrabold text-sm py-3 px-8 flex items-center gap-2 shadow-lg shadow-accent/20 transition-all rounded-xl"
            >
              <Linkedin className="w-4 h-4 fill-current" />
              Upgrade My Professional Voice Now
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-10 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4 text-muted text-xs">
        <div>
          © 2026 Narratiq · Engineered by <span className="text-text font-bold">Aviral Bakshi</span> · <a href="https://aviral.in" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">aviral.in</a>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-accent transition-colors">Support Center</a>
          <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-accent transition-colors font-bold">Terms of Use</a>
        </div>
      </footer>
    </div>
  );
}
