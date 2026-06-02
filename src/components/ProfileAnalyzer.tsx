import React, { useState, useEffect } from "react";
import { Sparkles, TrendingUp, Zap, FileText, ArrowRight, CheckCircle2, AlertCircle, Loader2, ChevronRight, RefreshCw, BarChart3, Users, Target, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { analyzeProfile, type ProfileAnalysis } from "../services/gemini";

type User = { id: string; name: string; email: string; picture?: string; headline?: string; about?: string };

interface ProfileAnalyzerProps {
  user: User;
}

export default function ProfileAnalyzer({ user }: ProfileAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'roadmap' | 'details' | 'fixes'>('overview');

  const runAnalysisAutomatically = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      // First try to load the latest saved analysis for this user
      const res = await fetch(`/api/analysis/${user.id}`);
      if (res.ok) {
        const stored = await res.json();
        setAnalysis(stored);
      } else {
        // If not found, run a deep analysis automatically from LinkedIn profile details
        const autoData = {
          name: user.name,
          headline: user.headline || "Senior Executive & Thought Leader",
          about: user.about || "Senior BFSI technology leader focused on digital transformation and market-driven product strategies.",
          industry: "Finance / BFSI & Fintech",
          experience: "Strategic executive roles guiding corporate governance, tech operations, and fintech innovations.",
          skills: "BFSI Strategy, Fintech, Financial Planning, Portfolio Optimization, Leadership, Digital Transformation",
          connections: "500+"
        };
        const data = await analyzeProfile(autoData);
        setAnalysis(data);
        // Save to SQLite
        await fetch("/api/save-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, analysis: data })
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze profile automatically. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    runAnalysisAutomatically();
  }, [user.id]);

  const handleReanalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const autoData = {
        name: user.name,
        headline: user.headline || "Senior Executive & Thought Leader",
        about: user.about || "Senior BFSI technology leader focused on digital transformation and market-driven product strategies.",
        industry: "Finance / BFSI & Fintech",
        experience: "Strategic executive roles guiding corporate governance, tech operations, and fintech innovations.",
        skills: "BFSI Strategy, Fintech, Financial Planning, Portfolio Optimization, Leadership, Digital Transformation",
        connections: "500+"
      };
      const data = await analyzeProfile(autoData);
      setAnalysis(data);
      // Save to SQLite
      await fetch("/api/save-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, analysis: data })
      });
    } catch (err: any) {
      setError(err.message || "Failed to re-analyze profile. Please try again.");
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-extrabold tracking-tight mb-2">Profile Audit & Roadmap</h2>
          <p className="text-muted">Analyzing your LinkedIn profile to structure a premium content roadmap.</p>
        </div>
        {analysis && (
          <button 
            onClick={handleReanalyze}
            disabled={isAnalyzing}
            className="btn-secondary py-2 px-4 text-sm flex items-center gap-2 self-start md:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`} />
            Refresh Analysis
          </button>
        )}
      </header>

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={handleReanalyze} className="ml-auto underline text-xs font-bold font-mono">Retry</button>
        </div>
      )}

      {isAnalyzing && (
        <div className="card h-[400px] flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 className="w-12 h-12 text-accent animate-spin" />
          <h3 className="text-xl font-display font-bold">Deep Audit in Progress...</h3>
          <p className="text-muted max-w-sm text-sm">
            Evaluating your connected LinkedIn profile, calculating SEO positioning scores, and generating your custom 30-Day Content Roadmap.
          </p>
        </div>
      )}

      {!isAnalyzing && analysis && (
        <div className="space-y-8">
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
                { label: "Headline", score: analysis.categories?.headline?.score || 80 },
                { label: "About Section", score: analysis.categories?.about?.score || 75 },
                { label: "Experience", score: analysis.categories?.experience?.score || 85 },
                { label: "Skills & Endorsements", score: analysis.categories?.skills?.score || 80 },
                { label: "Network Strength", score: analysis.categories?.network?.score || 70 }
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
            {(['overview', 'roadmap', 'details', 'fixes'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-surface text-accent shadow-sm' : 'text-muted hover:text-text'}`}
              >
                {tab === 'fixes' ? 'Priority Fixes' : tab === 'roadmap' ? '30-Day Roadmap' : tab}
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
                      {analysis.strengths && analysis.strengths.map((s, i) => (
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
                      {analysis.criticalFixes && analysis.criticalFixes.map((f, i) => (
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

              {activeTab === 'roadmap' && (
                <div className="space-y-8">
                  <div className="card bg-gradient-to-r from-accent/10 to-accent2/10 border-accent/20">
                    <h3 className="font-display text-2xl font-extrabold tracking-tight mb-2 text-accent">Your Personalized 30-Day Strategic Roadmap</h3>
                    <p className="text-muted text-sm leading-relaxed">
                      Custom milestones tailored to target high-intent B2B and BFSI stakeholders directly. Use these prompts as ready-to-go templates inside the **Post Generator** or **Post Rewriter** tabs.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {analysis.roadmap30Days ? (
                      analysis.roadmap30Days.map((item, i) => (
                        <div key={i} className="card border-l-4 border-l-accent flex flex-col justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-accent uppercase tracking-widest mb-3">{item.week}</div>
                            <h4 className="font-display text-lg font-bold mb-4">{item.focus}</h4>
                            
                            <div className="space-y-4">
                              <div>
                                <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                                  Action Items
                                </div>
                                <ul className="space-y-1.5">
                                  {item.actionItems && item.actionItems.map((act, idx) => (
                                    <li key={idx} className="text-xs text-muted flex gap-2">
                                      <span className="text-success font-bold">•</span>
                                      {act}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="pt-2">
                                <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                                  Suggested Content Ideas
                                </div>
                                <ul className="space-y-1.5">
                                  {item.contentIdeas && item.contentIdeas.map((idea, idx) => (
                                    <li key={idx} className="text-xs text-text/90 italic flex gap-2">
                                      <span className="text-gold font-bold">»</span>
                                      "{idea}"
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted">A customized roadmap is currently being prepared for you.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-8">
                  {analysis.categories && Object.entries(analysis.categories).map(([key, cat]: [string, any], i) => (
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
                    {analysis.criticalFixes && analysis.criticalFixes.map((fix, i) => (
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
      )}
    </div>
  );
}
