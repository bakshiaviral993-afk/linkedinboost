import React, { useState } from "react";
import { Zap, Sparkles, Copy, CheckCircle2, AlertCircle, Loader2, BarChart3, ChevronRight, RefreshCw, Target, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type User = { id: string; name: string; email: string; picture?: string; headline?: string; about?: string };

interface OptimizationResult {
  optimized: string;
  keyImprovements: string[];
  keywordsAdded: string[];
  seoScore: number;
}

interface ProfileOptimizerProps {
  user: User;
}

export default function ProfileOptimizer({ user }: ProfileOptimizerProps) {
  const [activeSection, setActiveSection] = useState<'headline' | 'about' | 'experience'>('headline');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    content: "",
    context: ""
  });

  const sections = [
    { id: 'headline', label: 'Headline', icon: Target, color: 'text-accent', bg: 'bg-accent/10' },
    { id: 'about', label: 'About / Summary', icon: Sparkles, color: 'text-accent2', bg: 'bg-accent2/10' },
    { id: 'experience', label: 'Experience Description', icon: Zap, color: 'text-gold', bg: 'bg-gold/10' }
  ];

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOptimizing(true);
    setError(null);
    try {
      const res = await fetch("/api/optimize-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: activeSection, ...formData })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCopy = () => {
    if (result) navigator.clipboard.writeText(result.optimized);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in">
      <header>
        <h2 className="text-3xl font-display font-extrabold tracking-tight mb-2">Profile Optimizer</h2>
        <p className="text-muted">Rewrite your profile sections for maximum impact and SEO visibility.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex gap-2 p-1 bg-surface2 rounded-xl w-full">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id as any);
                  setResult(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${activeSection === section.id ? 'bg-surface text-text shadow-sm border border-border' : 'text-muted hover:text-text'}`}
              >
                <section.icon className={`w-4 h-4 ${activeSection === section.id ? section.color : ''}`} />
                {section.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleOptimize} className="card space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-widest">Current {activeSection} Content</label>
              <textarea 
                rows={8}
                placeholder={`Paste your current ${activeSection} here...`}
                value={formData.content} 
                onChange={e => setFormData({...formData, content: e.target.value})}
                className="input w-full resize-none" 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-widest">Additional Context / Goals</label>
              <textarea 
                rows={3}
                placeholder="What are you trying to achieve? (e.g. 'I want to sound more authoritative in Fintech')"
                value={formData.context} 
                onChange={e => setFormData({...formData, context: e.target.value})}
                className="input w-full resize-none" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isOptimizing}
              className="btn-primary w-full py-4"
            >
              {isOptimizing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Optimize {activeSection}
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card h-[500px] flex flex-col items-center justify-center text-center text-muted"
              >
                <div className="w-20 h-20 rounded-full bg-surface2 flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 opacity-20" />
                </div>
                <h3 className="text-xl font-display font-bold text-text mb-2">Ready for a makeover?</h3>
                <p className="max-w-xs">Paste your current content to see the AI-optimized version.</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="card space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display text-xl font-bold">Optimized {activeSection}</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <div className="text-[10px] font-bold text-muted uppercase tracking-widest">SEO Score</div>
                        <div className="text-xl font-mono font-bold text-accent">{result.seoScore}</div>
                      </div>
                      <button onClick={handleCopy} className="p-2 hover:bg-surface2 rounded-lg text-muted transition-all" title="Copy to clipboard">
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-accent/5 border border-accent/20 rounded-xl text-text leading-relaxed whitespace-pre-wrap">
                    {result.optimized}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border">
                    <div className="space-y-4">
                      <div className="text-xs font-bold text-muted uppercase tracking-widest">Key Improvements</div>
                      <ul className="space-y-3">
                        {result.keyImprovements.map((imp, i) => (
                          <li key={i} className="text-sm text-muted flex gap-2">
                            <span className="text-accent font-bold">•</span> {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <div className="text-xs font-bold text-muted uppercase tracking-widest">Keywords Added</div>
                      <div className="flex flex-wrap gap-2">
                        {result.keywordsAdded.map((kw, i) => (
                          <span key={i} className="tag tag-cyan">{kw}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card bg-gold/5 border-gold/20">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gold mb-1">SEO Visibility Boost</h4>
                      <p className="text-sm text-muted">This optimized version is predicted to increase your profile's search visibility by 35% for your target keywords.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
