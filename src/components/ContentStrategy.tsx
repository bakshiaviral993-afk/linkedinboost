import React, { useState } from "react";
import { FileText, Sparkles, TrendingUp, Zap, ArrowRight, CheckCircle2, AlertCircle, Loader2, BarChart3, ChevronRight, RefreshCw, Target, ShieldCheck, Calendar, Users, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type User = { id: string; name: string; email: string; picture?: string; headline?: string; about?: string };

interface ContentStrategyData {
  pillars: { name: string; description: string; frequency: string; examples: string[] }[];
  weeklySchedule: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
  };
  viralTopics: string[];
  contentMix: { stories: string; insights: string; lists: string; questions: string };
  growthProjection: string;
}

interface ContentStrategyProps {
  user: User;
}

export default function ContentStrategy({ user }: ContentStrategyProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [strategy, setStrategy] = useState<ContentStrategyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    industry: "",
    role: "",
    goals: "",
    audience: ""
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/content-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStrategy(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (strategy) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-display font-extrabold tracking-tight mb-2">30-Day Growth Strategy</h2>
            <p className="text-muted">Your automated roadmap to LinkedIn authority.</p>
          </div>
          <button 
            onClick={() => setStrategy(null)}
            className="btn-secondary py-2 px-4 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Rebuild Strategy
          </button>
        </header>

        {/* Growth Projection Banner */}
        <div className="card bg-gradient-to-r from-accent/10 to-accent2/10 border-accent/20 p-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/10">
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold mb-1 text-accent">Growth Projection</h3>
              <p className="text-sm text-text/80 leading-relaxed">{strategy.growthProjection}</p>
            </div>
          </div>
        </div>

        {/* Weekly Schedule */}
        <section>
          <h3 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-accent2" />
            Weekly Content Schedule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(strategy.weeklySchedule).map(([day, content], i) => (
              <div key={i} className="card p-4 border-t-4 border-t-accent2">
                <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">{day}</div>
                <p className="text-sm text-text leading-relaxed">{content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Content Pillars */}
        <section>
          <h3 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-gold" />
            Strategic Content Pillars
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {strategy.pillars.map((pillar, i) => (
              <div key={i} className="card border-l-4 border-l-gold">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-display text-xl font-bold">{pillar.name}</h4>
                  <span className="tag tag-gold">{pillar.frequency}</span>
                </div>
                <p className="text-sm text-muted mb-6 leading-relaxed">{pillar.description}</p>
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Example Topics</div>
                  <div className="flex flex-wrap gap-2">
                    {pillar.examples.map((ex, j) => (
                      <span key={j} className="tag tag-cyan">{ex}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Viral Topics */}
          <div className="card">
            <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent" />
              High-Potential Topics
            </h3>
            <div className="space-y-4">
              {strategy.viralTopics.map((topic, i) => (
                <div key={i} className="flex gap-4 p-4 bg-surface2 rounded-xl border border-border group hover:border-accent/30 transition-all">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface flex items-center justify-center font-mono font-bold text-accent text-xs">
                    #{i + 1}
                  </div>
                  <p className="text-sm text-text/80 leading-relaxed">{topic}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Content Mix */}
          <div className="card">
            <h3 className="font-display text-xl font-bold mb-8 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent2" />
              Content Mix
            </h3>
            <div className="space-y-6">
              {Object.entries(strategy.contentMix).map(([type, percentage], i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted">
                    <span className="capitalize">{type}</span>
                    <span>{percentage}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: percentage, backgroundColor: i % 2 === 0 ? 'var(--color-accent)' : 'var(--color-accent2)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-fade-in">
      <header>
        <h2 className="text-3xl font-display font-extrabold tracking-tight mb-2">Content Strategy Planner</h2>
        <p className="text-muted">Build a 30-day automated roadmap for your professional brand.</p>
      </header>

      <form onSubmit={handleGenerate} className="card space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted uppercase tracking-widest">Industry</label>
            <input 
              type="text" 
              placeholder="e.g. Fintech, SaaS, AI"
              value={formData.industry} 
              onChange={e => setFormData({...formData, industry: e.target.value})}
              className="input w-full" 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted uppercase tracking-widest">Current Role</label>
            <input 
              type="text" 
              placeholder="e.g. Senior Product Manager"
              value={formData.role} 
              onChange={e => setFormData({...formData, role: e.target.value})}
              className="input w-full" 
              required 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted uppercase tracking-widest">Target Audience</label>
          <input 
            type="text" 
            placeholder="Who are you trying to reach?"
            value={formData.audience} 
            onChange={e => setFormData({...formData, audience: e.target.value})}
            className="input w-full" 
            required 
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted uppercase tracking-widest">Primary Goals</label>
          <textarea 
            rows={4}
            placeholder="What do you want to achieve? (e.g. 'Build thought leadership in AI', 'Generate leads for my agency')"
            value={formData.goals} 
            onChange={e => setFormData({...formData, goals: e.target.value})}
            className="input w-full resize-none" 
            required 
          />
        </div>

        {error && (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isGenerating}
          className="btn-primary w-full py-4 text-lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Building Strategy...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Generate 30-Day Strategy
            </>
          )}
        </button>
      </form>
    </div>
  );
}
