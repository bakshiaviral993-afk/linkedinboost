import React, { useState, useEffect } from "react";
import { Linkedin, Sparkles, TrendingUp, FileText, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface LandingProps {
  onAuthSuccess: (userId: string) => void;
}

export default function Landing({ onAuthSuccess }: LandingProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden flex flex-col">
      {/* Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20" 
        style={{ 
          backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} 
      />
      
      {/* Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent2/10 blur-[120px] rounded-full z-0" />

      {/* Header */}
      <header className="relative z-10 container mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent2 rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
            <Zap className="text-bg w-6 h-6 fill-current" />
          </div>
          <span className="font-display text-2xl font-extrabold tracking-tight">Narratiq <span className="text-accent">AI</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="tag tag-cyan">v2.5 Production</span>
          <span className="tag tag-purple">Gemini Powered</span>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-grow container mx-auto px-6 flex flex-col items-center justify-center text-center py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface2 border border-border rounded-full mb-8"
        >
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="text-xs font-medium text-muted uppercase tracking-widest">The #1 LinkedIn Growth Platform</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-8xl font-display font-extrabold tracking-tighter leading-[0.9] mb-8"
        >
          Scale Your <br />
          <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">Professional Voice</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-muted max-w-2xl mb-12 leading-relaxed"
        >
          Narratiq uses elite growth strategies and Gemini 2.5 Intelligence to optimize your profile, generate viral content, and automate your LinkedIn success.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
        >
          <button 
            onClick={handleConnect}
            disabled={isConnecting}
            className="btn-primary flex-1 py-4 text-lg"
          >
            {isConnecting ? (
              <div className="loader" />
            ) : (
              <>
                <Linkedin className="w-5 h-5 fill-current" />
                Connect LinkedIn
              </>
            )}
          </button>
          <button className="btn-secondary flex-1 py-4 text-lg">
            View Demo
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {error}
          </motion.div>
        )}

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-32 w-full">
          {[
            { icon: Sparkles, title: "Profile Analyzer", desc: "Get a professional score and actionable fixes.", color: "text-accent" },
            { icon: TrendingUp, title: "Post Generator", desc: "Create viral content with predicted engagement.", color: "text-accent2" },
            { icon: Zap, title: "Profile Optimizer", desc: "Rewrite sections for maximum SEO and impact.", color: "text-gold" },
            { icon: FileText, title: "Content Strategy", desc: "30-day automated planning for your brand.", color: "text-success" }
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + (i * 0.1) }}
              className="card text-left group"
            >
              <div className={`w-12 h-12 rounded-xl bg-surface2 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* About the Creator */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-40 w-full max-w-4xl mx-auto"
        >
          <div className="card p-12 border-accent/20 bg-accent/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap className="w-32 h-32 text-accent" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="w-32 h-32 rounded-full border-4 border-accent/30 p-1 flex-shrink-0">
                <div className="w-full h-full rounded-full bg-surface2 flex items-center justify-center text-3xl font-bold text-accent">AB</div>
              </div>
              <div className="text-left">
                <h2 className="text-3xl font-display font-bold mb-4">Built by Aviral Bakshi</h2>
                <p className="text-lg text-muted leading-relaxed mb-6">
                  AI consultant and BFSI specialist with 12+ years in finance. This tool was born from the frustration of watching great professionals stay invisible on LinkedIn.
                </p>
                <div className="flex gap-4">
                  <a href="https://aviral.in" target="_blank" rel="noopener noreferrer" className="btn-secondary py-2 px-6 text-sm">Visit aviral.in</a>
                  <a href="https://linkedin.com/in/aviralbakshi" target="_blank" rel="noopener noreferrer" className="btn-primary py-2 px-6 text-sm">Connect on LinkedIn</a>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="relative z-10 container mx-auto px-6 py-12 border-t border-border mt-20 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-muted text-sm">© 2026 Narratiq · Built by <span className="text-text font-bold">Aviral Bakshi</span> · <a href="https://aviral.in" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">aviral.in</a></div>
        <div className="flex gap-8 text-muted text-sm">
          <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-accent transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}
