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
  Users, 
  FileText,
  BadgeAlert,
  Clock,
  Zap,
  Calendar,
  MessageSquare,
  Compass,
  Eye,
  Lock,
  Copy,
  Plus
} from "lucide-react";

type User = { id: string; name: string; email: string; picture?: string; headline?: string; about?: string };

interface GrowthCopilotProps {
  user: User;
}

type TabType = "calendar" | "comments" | "virality" | "competitor";

export default function GrowthCopilot({ user }: GrowthCopilotProps) {
  const [activeTab, setActiveTab] = useState<TabType>("calendar");

  // Feature 4: Comment Generator State
  const [postContent, setPostContent] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsResult, setCommentsResult] = useState<any[]>([]);
  const [commentsHistory, setCommentsHistory] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Feature 5: Virality Prediction State
  const [draftContent, setDraftContent] = useState("");
  const [viralityLoading, setViralityLoading] = useState(false);
  const [viralityResult, setViralityResult] = useState<any | null>(null);

  // Feature 6: Competitor Analyzer State
  const [competitorBio, setCompetitorBio] = useState("");
  const [competitorLoading, setCompetitorLoading] = useState(false);
  const [competitorResult, setCompetitorResult] = useState<any | null>(null);

  // Feature 7: Content Calendar State
  const [industryTarget, setIndustryTarget] = useState("SaaS Founders & AI Tech Leaders");
  const [calendarDuration, setCalendarDuration] = useState(30);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [activeCalendar, setActiveCalendar] = useState<any | null>(null);
  const [completedDays, setCompletedDays] = useState<string[]>([]);
  const [calendarId, setCalendarId] = useState("");

  const [errorMSG, setErrorMSG] = useState<string | null>(null);

  // Initialize history
  useEffect(() => {
    fetchCommentsHistory();
    fetchActiveCalendar();
  }, [user.id]);

  // Comment Handlers
  const fetchCommentsHistory = async () => {
    try {
      const res = await fetch(`/api/comments-history/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setCommentsHistory(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateComments = async () => {
    if (!postContent) return;
    setCommentLoading(true);
    setErrorMSG(null);
    try {
      const res = await fetch("/api/generate-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, postContent })
      });
      if (res.ok) {
        const data = await res.json();
        setCommentsResult(data.comments || []);
        fetchCommentsHistory();
      } else {
        throw new Error("Failed to generate custom comments");
      }
    } catch (e: any) {
      setErrorMSG(e.message);
    } finally {
      setCommentLoading(false);
    }
  };

  const copyComment = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Virality Handlers
  const handleScoreVirality = async () => {
    if (!draftContent) return;
    setViralityLoading(true);
    setErrorMSG(null);
    try {
      const res = await fetch("/api/predict-virality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draftContent })
      });
      if (res.ok) {
        const data = await res.json();
        setViralityResult(data);
      } else {
        throw new Error("Virality assessment failed");
      }
    } catch (e: any) {
      setErrorMSG(e.message);
    } finally {
      setViralityLoading(false);
    }
  };

  // Competitor Handlers
  const handleAnalyzeCompetitor = async () => {
    if (!competitorBio) return;
    setCompetitorLoading(true);
    setErrorMSG(null);
    try {
      const res = await fetch("/api/competitor-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitorUrlOrBio: competitorBio })
      });
      if (res.ok) {
        const data = await res.json();
        setCompetitorResult(data);
      } else {
        throw new Error("Analytical mapping failed");
      }
    } catch (e: any) {
      setErrorMSG(e.message);
    } finally {
      setCompetitorLoading(false);
    }
  };

  // Content Calendar Handlers
  const fetchActiveCalendar = async () => {
    try {
      const res = await fetch(`/api/content-calendar/${user.id}`);
      if (res.ok) {
        const calendars = await res.json();
        if (calendars && calendars.length > 0) {
          const latest = calendars[0];
          setActiveCalendar(latest.calendar);
          setCompletedDays(latest.completedItems || []);
          setCalendarId(latest.id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBuildCalendar = async () => {
    setCalendarLoading(true);
    setErrorMSG(null);
    try {
      const res = await fetch("/api/content-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, industryTopic: industryTarget, planDuration: calendarDuration })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveCalendar(data.calendar);
        setCompletedDays([]);
        setCalendarId(data.id);
      } else {
        throw new Error("Failed to produce content roadmap");
      }
    } catch (e: any) {
      setErrorMSG(e.message);
    } finally {
      setCalendarLoading(false);
    }
  };

  const toggleDayCompletion = async (day: number) => {
    if (!calendarId) return;
    try {
      const res = await fetch("/api/content-calendar-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calendarId, completedDay: day })
      });
      if (res.ok) {
        const data = await res.json();
        setCompletedDays(data.completedItems || []);
      }
    } catch (e) {
      console.warn("Failed to toggle roadmap day:", e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in" id="growth-copilot-view">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="badge badge-accent px-3 py-1 text-xs font-bold uppercase tracking-widest bg-accent/15 border border-accent/20">Growth Suite</span>
          <h2 className="text-3xl font-display font-black tracking-tight mt-1">LinkedIn Growth Copilot</h2>
          <p className="text-sm text-muted">Leverage context-aware commenting, virality metrics, competitor replication, and content calendars.</p>
        </div>
      </header>

      {errorMSG && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMSG}</span>
        </div>
      )}

      {/* Copilot Tab Switcher */}
      <div className="bg-surface border border-border p-2 rounded-2xl flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex-grow md:flex-initial flex items-center justify-center gap-2 py-3 px-6 text-xs font-black rounded-xl transition-all cursor-pointer ${
            activeTab === "calendar" 
              ? "bg-accent/15 text-accent border border-accent/25" 
              : "text-muted hover:text-text hover:bg-surface2"
          }`}
        >
          <Calendar className="w-4 h-4" /> Content Calendar
        </button>

        <button
          onClick={() => setActiveTab("comments")}
          className={`flex-grow md:flex-initial flex items-center justify-center gap-2 py-3 px-6 text-xs font-black rounded-xl transition-all cursor-pointer ${
            activeTab === "comments" 
              ? "bg-accent/15 text-accent border border-accent/25" 
              : "text-muted hover:text-text hover:bg-surface2"
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Comment Generator
        </button>

        <button
          onClick={() => setActiveTab("virality")}
          className={`flex-grow md:flex-initial flex items-center justify-center gap-2 py-3 px-6 text-xs font-black rounded-xl transition-all cursor-pointer ${
            activeTab === "virality" 
              ? "bg-accent/15 text-accent border border-accent/25" 
              : "text-muted hover:text-text hover:bg-surface2"
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Virality Predictor
        </button>

        <button
          onClick={() => setActiveTab("competitor")}
          className={`flex-grow md:flex-initial flex items-center justify-center gap-2 py-3 px-6 text-xs font-black rounded-xl transition-all cursor-pointer ${
            activeTab === "competitor" 
              ? "bg-accent/15 text-accent border border-accent/25" 
              : "text-muted hover:text-text hover:bg-surface2"
          }`}
        >
          <Compass className="w-4 h-4" /> Competitor Analyzer
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* TAB 1: CONTENT CALENDAR ROADMAP */}
        {activeTab === "calendar" && (
          <div className="space-y-6">
            <div className="card grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div className="md:col-span-5 space-y-2">
                <label className="block text-xs font-bold text-muted uppercase tracking-wider">Target Industry or Value Proposition Topic</label>
                <input 
                  type="text" 
                  value={industryTarget} 
                  onChange={(e) => setIndustryTarget(e.target.value)}
                  placeholder="e.g. Fintech Tech Stack, Startups Scaling, AI Engineering"
                  className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text outline-none focus:border-accent"
                />
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="block text-xs font-bold text-muted uppercase tracking-wider">Plan Duration</label>
                <select 
                  value={calendarDuration}
                  onChange={(e) => setCalendarDuration(Number(e.target.value))}
                  className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text outline-none focus:border-accent"
                >
                  <option value={10}>10 High-Impact Days</option>
                  <option value={30}>30 Days Scale Up</option>
                  <option value={90}>90 Days Enterprise Authority</option>
                </select>
              </div>

              <div className="md:col-span-4">
                <button
                  disabled={calendarLoading || !industryTarget}
                  onClick={handleBuildCalendar}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 cursor-pointer text-xs font-black uppercase tracking-wider"
                >
                  {calendarLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Drafting Strategic Grid...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>Generate Content Calendar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {activeCalendar ? (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-xl text-text">Active Authority Curriculum Roadmap</h3>
                  <span className="text-2xs text-muted font-bold uppercase font-mono">
                    {completedDays.length} of {activeCalendar.length} items logged
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeCalendar.map((item: any, idx: number) => {
                    const isDone = completedDays.includes(String(item.day));
                    return (
                      <div 
                        key={idx} 
                        className={`card relative overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                          isDone 
                            ? "border-emerald-500/20 bg-emerald-500/5 group" 
                            : "bg-surface hover:border-border-hover"
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <span className={`text-[10px] font-mono font-black border uppercase px-2.5 py-0.5 rounded-full ${
                              isDone ? "color-emerald bg-emerald-500/10 border-emerald-500/20" : "text-accent bg-accent/15 border-accent/25"
                            }`}>
                              Day {item.day}
                            </span>
                            <span className="text-[10px] text-muted font-mono">{item.postingTime || "09:00 AM"}</span>
                          </div>

                          <div className="space-y-2">
                            <h4 className={`font-display font-extrabold text-base leading-snug ${isDone ? "text-muted line-through" : "text-text"}`}>
                              {item.topic}
                            </h4>
                            <div className="p-3 bg-bg/60 border border-border/40 rounded-lg text-xs italic text-muted leading-relaxed">
                              "{item.hook}"
                            </div>
                            <div className="text-2xs text-muted leading-relaxed mt-1">
                              <strong>Call to Action:</strong> "{item.cta}"
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-4 grid-cols-2 gap-4">
                          <div className="flex flex-wrap gap-1">
                            {item.hashtags?.map((tag: string, i: number) => (
                              <span key={i} className="text-3xs text-muted">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <button
                            onClick={() => toggleDayCompletion(item.day)}
                            className={`px-3 py-1.5 rounded-lg text-3xs font-black uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer ${
                              isDone 
                                ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30" 
                                : "bg-surface2 hover:bg-surface3 text-muted"
                            }`}
                          >
                            {isDone ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Done
                              </>
                            ) : (
                              "Toggle Complete"
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="card h-[350px] border border-dashed border-border flex flex-col items-center justify-center text-center text-muted">
                <Calendar className="w-12 h-12 text-muted/30 mb-4 animate-bounce" />
                <p className="font-display font-extrabold text-base text-text">No active content calendar roadmap</p>
                <p className="text-xs max-w-sm mt-1 leading-relaxed">Set your industry theme above and run the content calendar builder to organize a sequential 10-90 day timeline.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AI COMMENT GENERATOR */}
        {activeTab === "comments" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Comment inputs column */}
              <div className="lg:col-span-5 space-y-6">
                <div className="card space-y-4">
                  <h3 className="font-display font-black text-lg text-text border-b border-border pb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-accent" />
                    <span>Post Engagement Engine</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Paste Original LinkedIn Post Content</label>
                    <textarea 
                      rows={6}
                      value={postContent} 
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Paste the target post body you want to draft a high-agency comment for..."
                      className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text outline-none focus:border-accent transition-colors resize-none"
                    />
                  </div>

                  <button
                    disabled={commentLoading || !postContent}
                    onClick={handleGenerateComments}
                    className="btn-primary w-full py-4 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs uppercase tracking-wider"
                  >
                    {commentLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Evaluating Narrative Context...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-current" />
                        <span>Formulate Custom Comments</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Comment results column */}
              <div className="lg:col-span-7 space-y-6">
                {commentsResult.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-display font-black text-lg text-text">Top 5 Engagement Strategies</h3>
                    <div className="space-y-4">
                      {commentsResult.map((comment, index) => (
                        <div key={index} className="card relative border-l-4 border-l-accent space-y-3 p-5 text-left">
                          <div className="flex justify-between items-center">
                            <span className="px-2 py-0.5 rounded text-3xs font-mono font-black uppercase tracking-widest text-accent bg-accent/10 border border-accent/20">
                              {comment.type}
                            </span>
                            <span className="text-[10px] text-muted font-bold uppercase font-mono">
                              Engagement Potential: {comment.score || 90}%
                            </span>
                          </div>
                          
                          <p className="text-xs text-muted leading-relaxed italic">
                            "{comment.text}"
                          </p>

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => copyComment(comment.text, index)}
                              className="px-2.5 py-1 rounded bg-surface2 hover:bg-surface3 text-[10px] font-bold text-text flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {copiedIndex === index ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" /> Copy Comment Text
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="card h-[380px] border border-dashed border-border flex flex-col items-center justify-center text-center text-muted">
                    <MessageSquare className="w-12 h-12 text-muted/30 mb-4 animate-bounce" />
                    <p className="font-display font-extrabold text-base text-text">No Custom Comments Selected</p>
                    <p className="text-xs max-w-sm mt-1 leading-relaxed">Provide the target text on the left, and Narattiq will construct five distinct strategy comments mapped to high-agency themes.</p>
                  </div>
                )}

                {/* Hist log comments */}
                {commentsHistory.length > 0 && (
                  <div className="card space-y-4">
                    <h3 className="font-display font-black text-sm uppercase tracking-wider text-text">Historical Comment Outlines</h3>
                    <div className="divide-y divide-border/60">
                      {commentsHistory.map((h, idy) => (
                        <div key={idy} className="py-2.5 flex justify-between items-center text-2xs text-muted">
                          <span className="truncate pr-4 max-w-md">"{h.postContent}"</span>
                          <span className="text-accent hover:underline cursor-pointer" onClick={() => {
                            setPostContent(h.postContent);
                            setCommentsResult(h.comments || []);
                          }}>
                            Load Drafts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VIRALITY PREDICTOR */}
        {activeTab === "virality" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-4">
                <div className="card space-y-4">
                  <h3 className="font-display font-black text-lg text-text border-b border-border pb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-accent" />
                    <span>Algorithmic Sandbox Scan</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Draft LinkedIn Post Body</label>
                    <textarea 
                      rows={8}
                      value={draftContent} 
                      onChange={(e) => setDraftContent(e.target.value)}
                      placeholder="Paste your next draft here to evaluate its hook potency, CTA weight, and emotional index..."
                      className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text outline-none focus:border-accent transition-colors resize-none"
                    />
                  </div>

                  <button
                    disabled={viralityLoading || !draftContent}
                    onClick={handleScoreVirality}
                    className="btn-primary w-full py-4 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs uppercase tracking-wider"
                  >
                    {viralityLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Gating Hook Resonance...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-current" />
                        <span>Run Algorithmic Virality Audit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                {viralityResult ? (
                  <div className="space-y-6 animate-fade-in text-left">
                    {/* Circle Score block */}
                    <div className="card grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-5 flex flex-col items-center justify-center text-center">
                        <div className="text-5xl font-display font-black text-accent">{viralityResult.viralityScore}</div>
                        <span className="text-3xs uppercase text-muted tracking-widest font-extrabold mt-1">Virality potential Index</span>
                        <div className="text-xs font-mono font-bold bg-zinc-800 text-sky-400 px-3 py-1 rounded-full mt-3">
                          Est Reach: {viralityResult.predictedReach || "15k - 25k"}
                        </div>
                      </div>

                      <div className="md:col-span-7 space-y-3 border-l border-border/60 pl-4">
                        <h4 className="font-display font-black text-sm uppercase tracking-wider text-text">Index Component Weighting</h4>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-2xs mb-0.5">
                              <span className="text-muted">Hook Potency</span>
                              <span className="text-text font-bold">{viralityResult.hookScore}%</span>
                            </div>
                            <div className="w-full bg-border rounded-full h-1">
                              <div className="bg-accent h-full rounded-full" style={{ width: `${viralityResult.hookScore}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-2xs mb-0.5">
                              <span className="text-muted">CTA Conversation Weight</span>
                              <span className="text-text font-bold">{viralityResult.ctaScore}%</span>
                            </div>
                            <div className="w-full bg-border rounded-full h-1">
                              <div className="bg-accent h-full rounded-full" style={{ width: `${viralityResult.ctaScore}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-2xs mb-0.5">
                              <span className="text-muted">Mobile Readability Rhythm</span>
                              <span className="text-text font-bold">{viralityResult.readabilityScore}%</span>
                            </div>
                            <div className="w-full bg-border rounded-full h-1">
                              <div className="bg-accent h-full rounded-full" style={{ width: `${viralityResult.readabilityScore}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-2xs mb-0.5">
                              <span className="text-muted">Emotional Intensity</span>
                              <span className="text-text font-bold">{viralityResult.emotionalImpact}%</span>
                            </div>
                            <div className="w-full bg-border rounded-full h-1">
                              <div className="bg-accent h-full rounded-full" style={{ width: `${viralityResult.emotionalImpact}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Suggestions list */}
                    <div className="card space-y-3">
                      <h4 className="font-display font-black text-sm uppercase tracking-wider text-accent">Strategic Post Improvements</h4>
                      <p className="text-xs text-muted leading-relaxed">Adjust your draft to conform to these specific micro-editing guidelines:</p>
                      <ul className="space-y-2 pb-1">
                        {viralityResult.suggestions?.map((item: string, idx: number) => (
                          <div key={idx} className="flex gap-3 items-start p-3 bg-surface2/60 border border-border/40 rounded-xl text-xs text-muted leading-relaxed">
                            <span className="w-5 h-5 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center font-bold text-accent text-3xs flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="card h-[380px] border border-dashed border-border flex flex-col items-center justify-center text-center text-muted">
                    <TrendingUp className="w-12 h-12 text-muted/30 mb-4 animate-bounce" />
                    <p className="font-display font-extrabold text-base text-text">Run Virality Prediction Simulator</p>
                    <p className="text-xs max-w-sm mt-1 leading-relaxed">Provide your drafted paragraph outline on the left, and Narattiq will compute estimated algorithm metrics before publication.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COMPETITOR ANALYZER */}
        {activeTab === "competitor" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-4">
                <div className="card space-y-4">
                  <h3 className="font-display font-black text-lg text-text border-b border-border pb-3 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-accent" />
                    <span>Competitive Landscape</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Competitor LinkedIn Bio or Context</label>
                    <textarea 
                      rows={8}
                      value={competitorBio} 
                      onChange={(e) => setCompetitorBio(e.target.value)}
                      placeholder="Paste competitor's profile text, description, or focus pillars to map their content formula..."
                      className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text outline-none focus:border-accent transition-colors resize-none"
                    />
                  </div>

                  <button
                    disabled={competitorLoading || !competitorBio}
                    onClick={handleAnalyzeCompetitor}
                    className="btn-primary w-full py-4 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs uppercase tracking-wider"
                  >
                    {competitorLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Deconstructing Growth Pillars...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-current" />
                        <span>Formulate Competitive Plan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                {competitorResult ? (
                  <div className="space-y-6 animate-fade-in text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Pillars & Schedule */}
                      <div className="card space-y-3">
                        <h4 className="font-display font-bold text-xs text-muted uppercase tracking-widest">Identified Content Pillars</h4>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {competitorResult.contentPillars?.map((pil: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 text-2xs font-bold rounded-lg bg-accent/5 border border-accent/15 text-accent">{pil}</span>
                          ))}
                        </div>
                      </div>

                      <div className="card space-y-3">
                        <h4 className="font-display font-bold text-xs text-muted uppercase tracking-widest">Growth Tactics & Schedule</h4>
                        <ul className="space-y-2 text-2xs text-muted pr-1">
                          <li><strong>Schedule:</strong> {competitorResult.postingSchedule?.join(", ") || "Mon, Wed, Fri"}</li>
                          <li><strong>Tone:</strong> {competitorResult.tone || "Empathetic, Technical"}</li>
                          <li><strong>Hashtags:</strong> {competitorResult.hashtags?.join(" ") || "#CareerGrowth"}</li>
                        </ul>
                      </div>
                    </div>

                    {/* Replication Plan */}
                    <div className="card space-y-3">
                      <h4 className="font-display font-black text-sm uppercase tracking-wider text-accent">Strategy to Outperform Competitor</h4>
                      <p className="text-xs text-muted leading-relaxed">Execute these precise architectural content rules to outpace competitor indexing:</p>
                      <div className="space-y-2">
                        {competitorResult.recommendations?.map((rec: string, id: number) => (
                          <div key={id} className="p-3 bg-surface2/60 border border-border/40 rounded-xl text-xs text-muted leading-relaxed">
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card h-[380px] border border-dashed border-border flex flex-col items-center justify-center text-center text-muted">
                    <Compass className="w-12 h-12 text-muted/30 mb-4 animate-bounce" />
                    <p className="font-display font-extrabold text-base text-text">No Competitor Strategy Created</p>
                    <p className="text-xs max-w-sm mt-1 leading-relaxed">Input details or target profile bio parameters on the left and Map competitor growth strategies.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
