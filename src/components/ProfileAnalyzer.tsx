import React, { useState } from "react";
import { Sparkles, TrendingUp, Zap, FileText, ArrowRight, CheckCircle2, AlertCircle, Loader2, ChevronRight, RefreshCw, BarChart3, Users, Target, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type User = { id: string; name: string; email: string; picture?: string; headline?: string; about?: string };

interface ProfileAnalysis {
  overallScore: number;
  grade: string;
  categories: {
    headline: { score: number; feedback: string; optimized: string };
    about: { score: number; feedback: string; optimized: string };
    experience: { score: number; feedback: string };
    skills: { score: number; feedback: string; suggested: string[] };
    network: { score: number; feedback: string };
  };
  strengths: string[];
  criticalFixes: string[];
  profilePowerStatement: string;
  competitorGap: string;
  viralityPotential: string;
  targetAudienceReach: string;
}

interface ProfileAnalyzerProps {
  user: User;
}

export default function ProfileAnalyzer({ user }: ProfileAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'fixes'>('overview');

  const [formData, setFormData] = useState({
    name: user.name,
    headline: user.headline || "",
    about: user.about || "",
    industry: "",
    experience: "",
    skills: "",
    connections: "500+"
  });

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, profileData: formData })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-success';
    if (grade.startsWith('B')) return 'text-accent';
    if (grade.startsWith('C')) return 'text-gold';
    return 'text-danger';
  };

  if (analysis) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-display font-extrabold tracking-tight mb-2">Profile Intelligence Report</h2>
            <p className="text-muted">Deep analysis and actionable fixes for your LinkedIn presence.</p>
          </div>
          <button 
            onClick={() => setAnalysis(null)}
            className="btn-secondary py-2 px-4 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Re-analyze
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Score Card */}
          <div className="card flex flex-col items-center justify-center text-center p-10">
            <div className="relative w-48 h-48 mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-surface2"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={552.92}
                  strokeDashoffset={552.92 - (552.92 * analysis.overallScore) / 100}
                  className="text-accent transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-mono font-bold text-text">{analysis.overallScore}</span>
                <span className="text-xs font-bold text-muted uppercase tracking-widest">Overall Score</span>
              </div>
            </div>
            <div className={`text-6xl font-display font-extrabold mb-2 ${getGradeColor(analysis.grade)}`}>
              {analysis.grade}
            </div>
            <p className="text-muted text-sm px-4">Your profile is currently in the top {(100 - analysis.overallScore).toFixed(0)}% of your industry.</p>
          </div>

          {/* Category Scores */}
          <div className="lg:col-span-2 card space-y-6">
            <h3 className="font-display text-xl font-bold mb-6">Category Breakdown</h3>
            {[
              { label: "Headline", score: analysis.categories.headline.score },
              { label: "About Section", score: analysis.categories.about.score },
              { label: "Experience", score: analysis.categories.experience.score },
              { label: "Skills & Endorsements", score: analysis.categories.skills.score },
              { label: "Network Strength", score: analysis.categories.network.score }
            ].map((cat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm font-bold uppercase tracking-widest">
                  <span className="text-muted">{cat.label}</span>
                  <span className="text-text">{cat.score}/100</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${cat.score}%`, backgroundColor: cat.score > 80 ? 'var(--color-success)' : cat.score > 60 ? 'var(--color-accent)' : 'var(--color-gold)' }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-surface2 rounded-xl w-fit mb-8">
          {(['overview', 'details', 'fixes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-surface text-accent shadow-sm' : 'text-muted hover:text-text'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="card border-success/20">
                  <h4 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-success">
                    <CheckCircle2 className="w-5 h-5" />
                    Key Strengths
                  </h4>
                  <ul className="space-y-3">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-muted flex gap-2">
                        <span className="text-success font-bold">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card border-danger/20">
                  <h4 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-danger">
                    <AlertCircle className="w-5 h-5" />
                    Critical Fixes
                  </h4>
                  <ul className="space-y-3">
                    {analysis.criticalFixes.map((f, i) => (
                      <li key={i} className="text-sm text-muted flex gap-2">
                        <span className="text-danger font-bold">•</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card border-accent2/20">
                  <h4 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-accent2">
                    <Target className="w-5 h-5" />
                    Competitor Gap
                  </h4>
                  <p className="text-sm text-muted leading-relaxed">{analysis.competitorGap}</p>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-8">
                {Object.entries(analysis.categories).map(([key, cat]: [string, any], i) => (
                  <div key={i} className="card">
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="font-display text-xl font-bold capitalize">{key} Analysis</h4>
                      <div className="tag tag-cyan">{cat.score}/100</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <div className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Feedback</div>
                        <p className="text-sm text-muted leading-relaxed">{cat.feedback}</p>
                      </div>
                      {cat.optimized && (
                        <div>
                          <div className="text-xs font-bold text-accent uppercase tracking-widest mb-3">AI Optimized Version</div>
                          <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl text-sm text-text leading-relaxed">
                            {cat.optimized}
                          </div>
                        </div>
                      )}
                      {cat.suggested && (
                        <div className="md:col-span-2">
                          <div className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Suggested Skills</div>
                          <div className="flex flex-wrap gap-2">
                            {cat.suggested.map((s: string, j: number) => (
                              <span key={j} className="tag tag-purple">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'fixes' && (
              <div className="card">
                <h4 className="font-display text-xl font-bold mb-8">Priority Action Plan</h4>
                <div className="space-y-6">
                  {analysis.criticalFixes.map((fix, i) => (
                    <div key={i} className="flex gap-6 p-6 bg-surface2 rounded-2xl border border-border group hover:border-accent/30 transition-all">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-surface flex items-center justify-center font-mono font-bold text-accent text-lg">
                        {i + 1}
                      </div>
                      <div>
                        <h5 className="font-bold text-lg mb-2">Implement Fix: {fix.split(' ')[0]}...</h5>
                        <p className="text-muted text-sm leading-relaxed">{fix}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-fade-in">
      <header>
        <h2 className="text-3xl font-display font-extrabold tracking-tight mb-2">Profile Analyzer</h2>
        <p className="text-muted">Fill in your profile details for a deep AI audit.</p>
      </header>

      <form onSubmit={handleAnalyze} className="card space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted uppercase tracking-widest">Full Name</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="input w-full" 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted uppercase tracking-widest">Target Industry</label>
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
            <label className="text-xs font-bold text-muted uppercase tracking-widest">Current Headline</label>
            <input 
              type="text" 
              value={formData.headline} 
              onChange={e => setFormData({...formData, headline: e.target.value})}
              className="input w-full" 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted uppercase tracking-widest">Connections</label>
            <input 
              type="text" 
              value={formData.connections} 
              onChange={e => setFormData({...formData, connections: e.target.value})}
              className="input w-full" 
              required 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted uppercase tracking-widest">About / Summary Section</label>
          <textarea 
            rows={4}
            value={formData.about} 
            onChange={e => setFormData({...formData, about: e.target.value})}
            className="input w-full resize-none" 
            required 
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted uppercase tracking-widest">Experience (Key Roles & Achievements)</label>
          <textarea 
            rows={6}
            placeholder="List your major roles and key bullet points..."
            value={formData.experience} 
            onChange={e => setFormData({...formData, experience: e.target.value})}
            className="input w-full resize-none" 
            required 
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted uppercase tracking-widest">Skills (Comma separated)</label>
          <input 
            type="text" 
            placeholder="e.g. Product Management, Python, Strategy"
            value={formData.skills} 
            onChange={e => setFormData({...formData, skills: e.target.value})}
            className="input w-full" 
            required 
          />
        </div>

        {error && (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isAnalyzing}
          className="btn-primary w-full py-4 text-lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Profile...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Run Deep Analysis
            </>
          )}
        </button>
      </form>
    </div>
  );
}
