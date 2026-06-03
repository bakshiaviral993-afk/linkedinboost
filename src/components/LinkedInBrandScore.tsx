import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  ArrowRight, 
  Activity, 
  BookOpen, 
  Award, 
  Users, 
  FileText,
  BadgeAlert,
  HelpCircle,
  Clock,
  ChevronDown,
  Lock
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";

type User = { id: string; name: string; email: string; picture?: string; headline?: string; about?: string };

interface LinkedInBrandScoreProps {
  user: User;
}

interface BrandScoreRecord {
  id: string;
  brandScore: number;
  grade: string;
  headlineScore: number;
  aboutScore: number;
  keywordScore: number;
  consistencyScore: number;
  completenessScore: number;
  engagementScore: number;
  strengths: string[];
  weaknesses: string[];
  improvementPlan: string[];
  created_at: number;
}

export default function LinkedInBrandScore({ user }: LinkedInBrandScoreProps) {
  const [headline, setHeadline] = useState(user.headline || "");
  const [about, setAbout] = useState(user.about || "");
  const [targetKeywords, setTargetKeywords] = useState("Enterprise Tech, Scaling, Technical Delivery");
  const [postingConsistency, setPostingConsistency] = useState("Weekly");
  const [engagementLevel, setEngagementLevel] = useState("Medium");
  
  // Completeness checkboxes
  const [completeness, setCompleteness] = useState({
    profileImage: true,
    banner: true,
    contactInfo: true,
    featuredSection: false,
    detailedExperience: true,
    education: true,
    skillsList: true,
    recommendations: false
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BrandScoreRecord | null>(null);
  const [history, setHistory] = useState<BrandScoreRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleCompleteness = (key: keyof typeof completeness) => {
    setCompleteness(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getCompletenessScore = () => {
    const checkedCount = Object.values(completeness).filter(Boolean).length;
    // Scale out of 15
    return Math.round((checkedCount / Object.keys(completeness).length) * 15);
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/linkedin-brand-score/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
        if (data.length > 0 && !results) {
          // Default to latest result
          setResults(data[data.length - 1]);
        }
      }
    } catch (err: any) {
      console.error("Failed to load history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user.id]);

  const handleCalculateScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const scoreValue = getCompletenessScore();
      const response = await fetch("/api/linkedin-brand-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          headline,
          about,
          keywords: targetKeywords,
          postingConsistency,
          completenessScore: scoreValue,
          engagementPotential: engagementLevel
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to calculate brand score");
      }

      const freshResult = await response.json();
      setResults(freshResult);
      await fetchHistory();
    } catch (err: any) {
      setError(err.message || "An error occurred during calculation.");
    } finally {
      setLoading(false);
    }
  };

  const getGradeClass = (grade: string) => {
    if (grade.startsWith("A")) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (grade.startsWith("B")) return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    if (grade.startsWith("C")) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  const formattedChartData = history.map(h => ({
    date: new Date(h.created_at * 1000).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    Score: h.brandScore
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in" id="brand-score-view">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-black tracking-tight mb-2">LinkedIn Brand Score Engine</h2>
          <p className="text-sm text-muted">Core algorithmic evaluation grading your LinkedIn authority SEO visibility and content delivery.</p>
        </div>
      </header>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Parameters Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card space-y-4">
            <h3 className="font-display font-extrabold text-lg text-text border-b border-border pb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              <span>Brand Score Modulators</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Headline Quality (Max 20)</label>
              <input 
                type="text" 
                value={headline} 
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Lead Technologist | Software Architect | Cloud Specialist"
                className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">About Bio Quality (Max 20)</label>
              <textarea 
                rows={4}
                value={about} 
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Write your professional story, core values, milestones, and call to action..."
                className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text outline-none focus:border-accent transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Consistency (Max 15)</label>
                <select 
                  value={postingConsistency}
                  onChange={(e) => setPostingConsistency(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text outline-none focus:border-accent"
                >
                  <option value="Daily">Daily Post (15)</option>
                  <option value="2-3 times/week">2-3x / Week (12)</option>
                  <option value="Weekly">Weekly (9)</option>
                  <option value="Monthly">Monthly (5)</option>
                  <option value="Rarely">Rarely (2)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Engagement Power</label>
                <select 
                  value={engagementLevel}
                  onChange={(e) => setEngagementLevel(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text outline-none focus:border-accent"
                >
                  <option value="High">High 100+ likes (15)</option>
                  <option value="Medium">Medium 10-100 likes (10)</option>
                  <option value="Low">Low 0-10 likes (5)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Target SEO Keywords (Max 15)</label>
              <input 
                type="text" 
                value={targetKeywords} 
                onChange={(e) => setTargetKeywords(e.target.value)}
                placeholder="e.g. React.js, Engineering Metrics, Fintech"
                className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-3">Profile Completeness Checks (Max 15)</span>
              <div className="grid grid-cols-2 gap-3 text-xs text-muted max-h-[160px] overflow-y-auto pr-1">
                {Object.keys(completeness).map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer hover:text-text select-none">
                    <input 
                      type="checkbox" 
                      checked={completeness[key as keyof typeof completeness]} 
                      onChange={() => toggleCompleteness(key as keyof typeof completeness)}
                      className="rounded border-border bg-bg text-accent focus:ring-1 focus:ring-accent"
                    />
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              disabled={loading || !headline}
              onClick={handleCalculateScore}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculating Authority Metrics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Compute Brand Score</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Execution Dashboard Results */}
        <div className="lg:col-span-7 space-y-6">
          {results ? (
            <div className="space-y-6">
              {/* Score Display Card */}
              <div className="card grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-6">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    {/* Ring background */}
                    <svg className="absolute w-full h-full transform -rotate-90">
                      <circle cx="72" cy="72" r="62" stroke="var(--border)" strokeWidth="8" fill="transparent" />
                      <circle cx="72" cy="72" r="62" stroke="var(--accent)" strokeWidth="10" fill="transparent" 
                        strokeDasharray={2 * Math.PI * 62}
                        strokeDashoffset={2 * Math.PI * 62 * (1 - results.brandScore / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="text-center">
                      <span className="font-display font-black text-4xl block text-text">{results.brandScore}</span>
                      <span className="text-2xs text-muted uppercase tracking-wider">Brand Score</span>
                    </div>
                  </div>
                  
                  <div className={`mt-4 px-3 py-1 rounded-full text-xs font-black border uppercase tracking-widest ${getGradeClass(results.grade)}`}>
                    Grade: {results.grade}
                  </div>
                </div>

                <div className="md:col-span-7 space-y-4">
                  <h4 className="font-display font-black text-lg text-text">Scoring Categories Breakdown</h4>
                  
                  <div className="space-y-3">
                    {/* Headline score bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted font-medium">Headline Quality</span>
                        <span className="text-text font-bold">{results.headlineScore} / 20</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                        <div className="bg-accent h-full rounded-full" style={{ width: `${(results.headlineScore / 20) * 100}%` }} />
                      </div>
                    </div>

                    {/* About score bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted font-medium">About Section Quality</span>
                        <span className="text-text font-bold">{results.aboutScore} / 20</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                        <div className="bg-accent h-full rounded-full" style={{ width: `${(results.aboutScore / 20) * 100}%` }} />
                      </div>
                    </div>

                    {/* Keywords score bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted font-medium">Keywords Optimization</span>
                        <span className="text-text font-bold">{results.keywordScore} / 15</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                        <div className="bg-accent h-full rounded-full" style={{ width: `${(results.keywordScore / 15) * 100}%` }} />
                      </div>
                    </div>

                    {/* Consistency bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted font-medium">Posting Consistency</span>
                        <span className="text-text font-bold">{results.consistencyScore} / 15</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                        <div className="bg-accent h-full rounded-full" style={{ width: `${(results.consistencyScore / 15) * 100}%` }} />
                      </div>
                    </div>

                    {/* Completeness bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted font-medium">Profile Completeness</span>
                        <span className="text-text font-bold">{results.completenessScore} / 15</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                        <div className="bg-accent h-full rounded-full" style={{ width: `${(results.completenessScore / 15) * 100}%` }} />
                      </div>
                    </div>

                    {/* Engagement bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted font-medium">Engagement Potential</span>
                        <span className="text-text font-bold">{results.engagementScore} / 15</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                        <div className="bg-accent h-full rounded-full" style={{ width: `${(results.engagementScore / 15) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card border-l-4 border-l-emerald-500 bg-emerald-500/5 space-y-2 p-5">
                  <h4 className="font-display font-bold text-sm text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Identified Strengths</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {results.strengths?.map((str, idx) => (
                      <li key={idx} className="text-xs text-muted flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold mt-0.5">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card border-l-4 border-l-rose-500 bg-rose-500/5 space-y-2 p-5">
                  <h4 className="font-display font-bold text-sm text-rose-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <BadgeAlert className="w-4 h-4" />
                    <span>Focus Weaknesses</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {results.weaknesses?.map((weak, idx) => (
                      <li key={idx} className="text-xs text-muted flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold mt-0.5">•</span>
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Plan */}
              <div className="card space-y-4">
                <h4 className="font-display font-black text-lg text-text flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-accent animate-pulse" />
                  <span>Strategic Implementation Plan</span>
                </h4>
                <div className="space-y-3">
                  {results.improvementPlan?.map((plan, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-xl bg-surface2/50 border border-border/60">
                      <div className="w-7 h-7 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center font-bold text-xs text-accent flex-shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-muted leading-relaxed mt-1">{plan}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-dashed border-border rounded-2xl p-12 text-center h-[450px] flex flex-col items-center justify-center text-muted">
              <TrendingUp className="w-12 h-12 text-muted/40 mb-4 animate-bounce" />
              <p className="font-display font-bold text-base text-text">No Score Active</p>
              <p className="text-xs max-w-sm mt-1 leading-relaxed">Fill out the brand parameters on the left and submit to generate your LinkedIn visibility rating.</p>
            </div>
          )}

          {/* Trend History Panel */}
          {history.length > 0 && (
            <div className="card space-y-4">
              <h4 className="font-display font-black text-lg text-text flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                <span>Brand Score Trend History</span>
              </h4>
              <div className="h-[200px] w-full mt-2 pr-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="date" stroke="#e0e0e0" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#e0e0e0" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#111", borderColor: "#333", borderRadius: "10px" }}
                      labelStyle={{ color: "#aaa", fontSize: "11px" }}
                      itemStyle={{ color: "var(--color-accent)", fontSize: "12px", fontWeight: "bold" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Score" 
                      stroke="var(--color-accent)" 
                      strokeWidth={3} 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
