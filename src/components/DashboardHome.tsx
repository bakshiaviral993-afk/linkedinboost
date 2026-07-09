import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  TrendingUp, 
  Zap, 
  FileText, 
  ArrowRight, 
  Lightbulb, 
  Target, 
  BarChart3, 
  RefreshCw, 
  UserCheck, 
  Award, 
  Key, 
  Calendar, 
  Layers, 
  Compass, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  Download,
  Flame,
  Check,
  Briefcase,
  Users,
  Compass as CompassIcon,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";

type User = { 
  id: string; 
  name: string; 
  email: string; 
  picture?: string; 
  headline?: string; 
  about?: string; 
  onboarding_goal?: string; 
  onboarding_completed?: number;
  followers_count?: number;
  connections_count?: number;
};
type View = 'dashboard' | 'analyzer' | 'generator' | 'optimizer' | 'strategy' | 'history' | 'analytics' | 'rewriter' | 'settings' | 'resumebuilder';

interface DashboardHomeProps {
  user: User;
  onNavigate: (view: View) => void;
}

interface GamificationData {
  xp: number;
  level: number;
  current_streak: number;
  max_streak: number;
  badges: string[];
}

interface SavedReport {
  id: string;
  report_title: string;
  score_data: string;
  content_data: string;
  created_at: number;
}

export default function DashboardHome({ user, onNavigate }: DashboardHomeProps) {
  const firstName = user.name.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // State Management
  const [latestAudit, setLatestAudit] = useState<any | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeRoadmapWeek, setActiveRoadmapWeek] = useState<number>(1);
  
  // Onboarding & Gamification States
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [userGoal, setUserGoal] = useState<string>(user.onboarding_goal || "");
  const [gamification, setGamification] = useState<GamificationData>({
    xp: 0,
    level: 1,
    current_streak: 0,
    max_streak: 0,
    badges: []
  });

  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ name: string; message: string; xp?: number } | null>(null);

  // Dynamic priorities Checklist
  const [priorities, setPriorities] = useState([
    { id: "headline", text: "Improve Headline Focus", completed: false, xp: 50, category: "Headline optimization" },
    { id: "keywords", text: "Add Missing High-Intent Keywords", completed: false, xp: 50, category: "SEO Indexing" },
    { id: "post", text: "Generate High-Virality Post", completed: false, xp: 50, category: "Content deployment" },
    { id: "resume", text: "Complete ATS Resume Scan", completed: false, xp: 50, category: "Job profile weight" }
  ]);

  // Fetch standard data, gamification metrics and saved reports
  async function fetchLatestData() {
    try {
      const dbUrl = `/api/analysis/${user.id}`;
      const analysisRes = await fetch(dbUrl);
      if (analysisRes.ok) {
        const data = await analysisRes.json();
        setLatestAudit(data);
      } else {
        setLatestAudit(null);
      }
    } catch (err) {
      console.error("Error loading latest audit:", err);
      setLatestAudit(null);
    }

    try {
      const analyticsRes = await fetch(`/api/analytics/${user.id}`);
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error("Error loading analytics:", err);
    }
  }

  async function fetchGamification() {
    try {
      const res = await fetch(`/api/user/${user.id}/gamification`);
      if (res.ok) {
        const data = await res.json();
        setGamification(data);
      }
    } catch (e) {
      console.warn("Failed fetching gamification metrics:", e);
    }
  }

  async function fetchReports() {
    try {
      const res = await fetch(`/api/user/${user.id}/reports`);
      if (res.ok) {
        const data = await res.json();
        setSavedReports(data);
      }
    } catch (e) {
      console.warn("Failed fetching saved reports:", e);
    }
  }

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([fetchLatestData(), fetchGamification(), fetchReports()]);
    
    // Check onboarding completion status
    const onboardingComplete = user.onboarding_completed === 1 || !!localStorage.getItem(`onboarding_complete_${user.id}`);
    if (!onboardingComplete && !user.onboarding_goal) {
      setShowOnboarding(true);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  // Handle achievement toasts
  const triggerToast = (name: string, message: string, xp?: number) => {
    setToastMessage({ name, message, xp });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Onboarding Submit
  const handleOnboardingSubmit = async (selectedGoal: string) => {
    try {
      const res = await fetch(`/api/user/${user.id}/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: selectedGoal })
      });
      if (res.ok) {
        const data = await res.json();
        setUserGoal(selectedGoal);
        localStorage.setItem(`onboarding_complete_${user.id}`, "true");
        setShowOnboarding(false);
        
        // Award instant visual feedback
        triggerToast("LinkedIn Rookie Unlocked! 🏅", "Goal personalized. Welcome to Narratiq Career Growth Engine!", 200);
        fetchGamification();
      }
    } catch (e) {
      console.error("Onboarding failed:", e);
    }
  };

  // Toggle Prioritized Task completion
  const handleTogglePriority = async (taskIndex: number) => {
    const updated = [...priorities];
    const task = updated[taskIndex];
    if (task.completed) return; // Only allow ticking once to prevent gaming system

    task.completed = true;
    setPriorities(updated);

    try {
      const res = await fetch(`/api/user/${user.id}/roadmap-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        triggerToast("Progress XP Earned! ⚡", `Completed priority check: "${task.text}"`, task.xp);
        fetchGamification();
      }
    } catch (err) {
      console.warn("Error finalizing prio complete:", err);
    }
  };

  // Career consulting Report Generator in jsPDF
  const handleGenerateCareerReport = async () => {
    setIsGeneratingReport(true);
    triggerToast("Generating Report... 📄", "Laying out Executive Diagnostic PDF. Please hold.", 0);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const navy = "#0f172a";
      const gold = "#f59e0b";
      const slate = "#334155";
      const cream = "#f8fafc";

      // ─── PAGE 1: COVER PAGE ───
      doc.setFillColor(navy);
      doc.rect(0, 0, 210, 297, "F");

      doc.setFillColor(gold);
      doc.rect(15, 15, 6, 267, "F");

      doc.setTextColor("#ffffff");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(28);
      doc.text("NARRATIQ EXECUTIVE", 30, 80);
      doc.text("CAREER AUDIT REPORT", 30, 95);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor("#94a3b8");
      doc.text("A customized strategic assessment and 30-day professional campaign plan", 30, 115);
      doc.text("calculated specifically for digital presence optimization.", 30, 122);

      doc.setFontSize(10);
      doc.setTextColor("#cbd5e1");
      doc.text("PREPARED FOR:", 30, 190);
      doc.setFont("Helvetica", "bold");
      doc.text(user.name.toUpperCase(), 30, 196);

      doc.setFont("Helvetica", "normal");
      doc.text("STRATEGIC TARGET VECTOR:", 30, 210);
      doc.setFont("Helvetica", "bold");
      doc.text(userGoal ? userGoal.toUpperCase() : "CROSS-INDUSTRY GROWTH", 30, 216);

      doc.setFont("Helvetica", "normal");
      doc.text("DATE COMPILED:", 30, 230);
      doc.setFont("Helvetica", "bold");
      doc.text(new Date().toLocaleDateString().toUpperCase(), 30, 236);

      doc.setTextColor(gold);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.text("CONFIDENTIAL  •  NARRATIQ SYSTEMS GLOBAL", 30, 265);

      // ─── PAGE 2: SUMMARY & PROFILE HEALTH ───
      doc.addPage();
      doc.setFillColor(cream);
      doc.rect(0, 0, 210, 297, "F");

      doc.setFillColor(navy);
      doc.rect(0, 0, 210, 35, "F");

      doc.setTextColor("#ffffff");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.text("EXECUTIVE DIAGNOSTIC DASHBOARD", 15, 22);

      doc.setTextColor(navy);
      doc.setFontSize(16);
      doc.text("PORTFOLIO RANKING INDEX", 15, 52);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(slate);
      doc.setFontSize(10);
      doc.text("Narratiq's automated assessment engine has parsed your online presence keywords,", 15, 62);
      doc.text("achievement benchmarks, and recruiter signal strengths. Overall indexing is outlined below:", 15, 67);

      // Score display box
      doc.setFillColor("#ffffff");
      doc.setDrawColor("#e2e8f0");
      doc.rect(15, 75, 180, 52, "FD");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(navy);
      doc.text("ASSESSMENT FACTOR", 22, 87);
      doc.text("INDEX SCORE", 150, 87);

      doc.setDrawColor("#cbd5e1");
      doc.line(15, 92, 195, 92);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(slate);
      doc.text("LinkedIn Brand Authority Rank", 22, 100);
      doc.text(`${brandScoreVal}/100`, 150, 100);

      doc.text("ATS Resume Matching Weight", 22, 108);
      doc.text(`${atsScoreVal}/100`, 150, 108);

      doc.text("Search Keyword SEO Density", 22, 116);
      doc.text(`${keywordCoverage}%`, 150, 116);

      // Strengths & Weaknesses
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(navy);
      doc.text("CORE GROWTH OPPORTUNITIES", 15, 145);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(slate);
      let yRecs = 155;
      (auditRecommendations || []).slice(0, 4).forEach((rec: string, i: number) => {
        doc.text(`[Opportunity 0${i+1}]  ${rec}`, 15, yRecs, { maxWidth: 180 });
        yRecs += 12;
      });

      // Missed Keywords
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(navy);
      doc.text("HIGH-PRIORITY SEARCH TAGS TO INCORPORATE", 15, yRecs + 8);
      
      const keywordsStr = (missingKeywords || []).join(", ");
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(slate);
      doc.text(keywordsStr || "No critical missed keywords registered.", 15, yRecs + 16, { maxWidth: 180 });

      // ─── PAGE 3: 30-DAY IMPLEMENTATION CAMPAIGN ───
      doc.addPage();
      doc.setFillColor(cream);
      doc.rect(0, 0, 210, 297, "F");

      doc.setFillColor(navy);
      doc.rect(0, 0, 210, 35, "F");

      doc.setTextColor("#ffffff");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.text("TACTICAL 30-DAY ACTION MAP", 15, 22);

      doc.setTextColor(navy);
      doc.setFontSize(16);
      doc.text("TACTICAL LAUNCH SCHEDULE", 15, 52);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(slate);
      doc.setFontSize(10);
      doc.text("We recommend organizing your profile enhancements across the following timeline blocks:", 15, 62);

      let yWeek = 75;
      (rawRoadmap || []).slice(0, 4).forEach((wk: any) => {
        doc.setFillColor("#ffffff");
        doc.setDrawColor("#e2e8f0");
        doc.rect(15, yWeek, 180, 42, "FD");

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(navy);
        doc.text(`WEEK 0${wk.weekNum}: ${wk.theme || "Strategic Milestones"}`, 22, yWeek + 8);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(slate);
        doc.text(`Focus Indicator: ${wk.focus || "Action planning & presence alignment"}`, 22, yWeek + 16, { maxWidth: 170 });
        doc.text(`Actionable Steps: ${(wk.actionItems || []).slice(0, 2).join(", ")}`, 22, yWeek + 23, { maxWidth: 170 });
        doc.text(`Suggested Post Theme: ${(wk.contentIdeas || []).slice(0, 1).join("")}`, 22, yWeek + 31, { maxWidth: 170 });

        yWeek += 48;
      });

      // Footer disclaimer
      doc.setFontSize(8);
      doc.setTextColor("#94a3b8");
      doc.text("This report is created and distributed securely by Narratiq. All rights reserved.", 15, 282);

      // Download trigger
      doc.save(`Narratiq_Executive_Career_Report_${firstName}.pdf`);

      // Store report on backend SQLite
      const reportId = "rep_" + Math.random().toString(36).substring(2, 9);
      const res = await fetch(`/api/user/${user.id}/save-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: reportId,
          title: `Executive Diagnostic Report - ${userGoal || "Professional Career"}`,
          scoreData: { brandScore: brandScoreVal, atsScore: atsScoreVal, seoCoverage: keywordCoverage, profileCompletion: auditCompletion },
          contentData: { date: new Date().toLocaleDateString(), userGoal }
        })
      });

      if (res.ok) {
        const resJson = await res.json();
        // Trigger Toast for report completion plus 120 XP
        triggerToast("Executive Audit Report Ready! 📑", "Download initialized. Saved securely in Achievements and awarded +120 XP!", 120);
        fetchGamification();
        fetchReports();
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
      triggerToast("Failed to output report", "There was an issue creating PDF client-side.", 0);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-4">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
        <p className="text-muted text-sm font-mono tracking-wider animate-pulse">BOOTING NARRATIQ SYSTEMS OVERVIEW...</p>
      </div>
    );
  }

  // Fallback audit state mappings
  const auditName = latestAudit?.profileSnapshot?.name || user.name || "LinkedIn Member";
  const auditHeadline = latestAudit?.profileSnapshot?.headline || latestAudit?.categories?.headline?.optimized || user.headline || "Senior Executive & Domain Expert";
  const auditIndustry = latestAudit?.profileSnapshot?.industry || "Finance / Technology / Corporate";
  const auditCompletion = latestAudit?.profileSnapshot?.profileCompletion || analyticsData?.profile_completion_score || 85;
  const brandScoreVal = latestAudit?.brandScore?.score || latestAudit?.overallScore || 78;
  const brandGradeVal = latestAudit?.brandScore?.grade || latestAudit?.grade || "B";
  const atsScoreVal = analyticsData?.ats_score || 72; // loaded dynamically from analytics
  const detectedKeywords = latestAudit?.keywordSeo?.detectedKeywords || ["Leadership", "Cloud Architecture", "Strategy", "SaaS Delivery"];
  const missingKeywords = latestAudit?.keywordSeo?.missingKeywords || latestAudit?.categories?.skills?.suggested || ["Kubernetes", "GraphQL", "Product Roadmap"];
  const keywordCoverage = latestAudit?.keywordSeo?.keywordCoverage || 75;
  const recommendedTopics = latestAudit?.contentStrategy?.recommendedTopics || ["Digital scaling metrics", "Leadership performance systems", "SaaS patterns"];
  const postingFrequency = latestAudit?.contentStrategy?.postingFrequency || "3 targeted posts per week";
  const contentPillars = latestAudit?.contentStrategy?.contentPillars || ["Technical Case Studies", "Operational Efficiency Coaching"];

  const rawRoadmap = latestAudit?.growthRoadmap30Days ? [
    { weekNum: 1, ...latestAudit.growthRoadmap30Days.week1 },
    { weekNum: 2, ...latestAudit.growthRoadmap30Days.week2 },
    { weekNum: 3, ...latestAudit.growthRoadmap30Days.week3 },
    { weekNum: 4, ...latestAudit.growthRoadmap30Days.week4 }
  ] : (latestAudit?.roadmap30Days || []).map((w: any, idx: number) => ({
    weekNum: idx + 1,
    theme: w.week || `Week ${idx + 1}: Goal Launch`,
    focus: w.focus || "Action planning & setup alignment",
    actionItems: w.actionItems || ["Refactor credentials list"],
    contentIdeas: w.contentIdeas || ["Share an organic milestone story"]
  }));

  const activeRoadmapData = (rawRoadmap && rawRoadmap.length > 0)
    ? (rawRoadmap.find((w: any) => w.weekNum === activeRoadmapWeek) || rawRoadmap[0] || {
        weekNum: activeRoadmapWeek,
        theme: "Strategic Milestones Launch",
        focus: "Action planning & setup alignment",
        actionItems: ["Refactor profile sections", "Optimize connection tags"],
        contentIdeas: ["Share an organic milestone story", "Publish a structured case study"]
      })
    : {
        weekNum: activeRoadmapWeek,
        theme: "Strategic Milestones Launch",
        focus: "Action planning & setup alignment",
        actionItems: ["Refactor profile sections", "Optimize connection tags"],
        contentIdeas: ["Share an organic milestone story", "Publish a structured case study"]
      };
  const auditRecommendations = latestAudit?.aiAuditSummary?.recommendations || [
    "Refactor headline hooks with high-intent industry keywords.",
    "Introduce quantified metrics and budget accomplishments standard in job logs.",
    "Formulate daily professional publishing workflows around your target sectors."
  ];

  // Dynamic coaching logic based on selected Onboarding Goal
  const getCoachInsights = () => {
    switch (userGoal) {
      case "Get a High-Paying Job":
        return {
          header: "Today I found 3 job-seeking opportunities to optimize your Profile.",
          impact: "Complete ATS Resume Scan",
          points: "+45 pts",
          view: "resumebuilder" as View,
          desc: " recruiters search specifically for candidates with standardized metrics and 95%+ keyword coverage schemas."
        };
      case "Grow LinkedIn Personal Brand":
        return {
          header: "Today I found 3 branding opportunities to scale your professional voice.",
          impact: "Complete Headline Hook refinement",
          points: "+35 pts",
          view: "optimizer" as View,
          desc: "An optimization Audit will structure your display hooks and bio keywords to trigger algorithmic views."
        };
      case "Attract High-Ticket Clients":
        return {
          header: "Today I found 4 high-value client lead-acquisition signals.",
          impact: "Draft specialized Authority Pitch",
          points: "+50 pts",
          view: "generator" as View,
          desc: "Create specialized technical content models focused on client case highlights and problem frameworks."
        };
      case "Become Full-Time Creator":
        return {
          header: "Today I detected 3 high-virality creation trends.",
          impact: "Draft a viral interactive Post",
          points: "+40 pts",
          view: "generator" as View,
          desc: "A well-structured Creator story will expand visibility and engagement indices directly in target feeds."
        };
      default:
        return {
          header: "Today I found 3 core profile opportunities to drive executive traffic.",
          impact: "Improve Index Keyword Coverage",
          points: "+25 pts",
          view: "analyzer" as View,
          desc: "Increasing SEO coverage metrics from 75% to 90% drives consistent search impressions."
        };
    }
  };

  const coachInfo = getCoachInsights();

  // Score metrics
  const completionPercentage = priorities.filter(p => p.completed).length * 25;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 relative">
      
      {/* Dynamic Toast Popup Notification for Gamification achievements */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-accent to-[#7c3aed] text-white p-5 rounded-2xl shadow-2xl border border-white/20 max-w-sm flex items-start gap-4"
          >
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Award className="w-5 h-5 text-yellow-300 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-medium text-sm leading-tight text-yellow-100">{toastMessage.name}</h4>
              <p className="text-xs text-white/95 leading-normal">{toastMessage.message}</p>
              {toastMessage.xp ? (
                <span className="inline-block mt-2 px-2 py-0.5 bg-yellow-300 text-bg font-mono font-black text-[9px] rounded uppercase tracking-wider animate-pulse">
                  + {toastMessage.xp} Earned XP
                </span>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Dialog Select Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-50 bg-bg/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card max-w-lg w-full bg-surface border border-border p-8 rounded-3xl shadow-xl text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-accent shrink-0 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-display font-extrabold tracking-tight text-white">Personalize Your Growth</h2>
                <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                  Select your primary career vector to curate specialized task checklists, coach priorities, and personalized dashboard recommendations.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 text-left pt-2">
                {[
                  { id: "job", label: "Get a High-Paying Job", icon: "🎯", desc: "Focuses on ATS resume builder matches and corporate recruiters." },
                  { id: "brand", label: "Grow LinkedIn Personal Brand", icon: "🚀", desc: "Build authority and launch high-impact executive publishing channels." },
                  { id: "clients", label: "Attract High-Ticket Clients", icon: "💼", desc: "For consultants, coaches, agency runners, and deal hunters." },
                  { id: "creator", label: "Become Full-Time Creator", icon: "✍️", desc: "Grow impressions, create newsletters, and write viral content." },
                  { id: "agency", label: "Scale Agency Operations", icon: "🏢", desc: "For recruitment setups, candidate pools, and branding agencies." }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOnboardingSubmit(option.label)}
                    className="w-full p-3.5 rounded-xl border border-border bg-surface2/40 hover:bg-accent/5 hover:border-accent/40 active:bg-accent/10 transition-all text-left flex items-start gap-4 group"
                  >
                    <span className="text-2xl shrink-0 group-hover:scale-115 transition-transform">{option.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-text group-hover:text-accent transition-colors">{option.label}</div>
                      <div className="text-[10px] text-muted mt-0.5 leading-relaxed">{option.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Database alerts */}
      {analyticsData && analyticsData.supabase_warning && (
        <div className="p-4 border border-red-500/30 bg-red-950/10 rounded-2xl flex items-start gap-3">
          <div className="p-2 rounded-xl bg-red-500/10 text-red-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 bg-transparent border-0" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-red-400 leading-tight">Supabase Configuration Warning</h4>
            <p className="text-[11px] text-muted leading-relaxed">
              Service role secrets are configured incorrectly. Backends are resolving requests locally, but cloud-run reboots may clear cached records. Please set valid keys in your local environment parameters.
            </p>
          </div>
        </div>
      )}

      {/* Gamification Level and Streak status bar HUD */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-surface rounded-2xl border border-border relative overflow-hidden gap-4">
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center font-display font-black text-xl text-accent border border-accent/20">
            Lvl {gamification.level}
          </div>
          <div className="space-y-1 min-w-[200px]">
            <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
              <span>XP Level Progress</span>
              <span>{gamification.xp} / {gamification.level * 500} XP</span>
            </div>
            <div className="w-full h-2 bg-surface2 rounded-full overflow-hidden border border-border/80">
              <div 
                className="h-full bg-gradient-to-r from-accent to-accent2 transition-all duration-500"
                style={{ width: `${Math.min(100, (gamification.xp / (gamification.level * 500)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 .py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400">
            <Flame className="w-4 h-4 fill-current animate-pulse bg-transparent border-0" />
            <div className="text-left shrink-0">
              <span className="text-[9px] uppercase tracking-wider block font-bold text-orange-400/85">Daily Activity Streak</span>
              <span className="text-xs font-mono font-black">{gamification.current_streak} DAY{gamification.current_streak !== 1 ? 'S' : ''}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {gamification.badges.length > 0 ? (
              gamification.badges.map((badgeName) => (
                <span 
                  key={badgeName} 
                  className="px-2 py-0.5 text-[8px] font-extrabold uppercase bg-gold/15 text-gold border border-gold/25 rounded tracking-widest cursor-default select-none animate-pulse"
                  title="Achievement Badge Unlocked"
                >
                  🏆 {badgeName}
                </span>
              ))
            ) : (
              <span className="text-[10px] font-mono text-muted tracking-tight">Perform audits or scans to unlock badges!</span>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 1: HERO CONTAINER */}
      <section className="p-8 rounded-3xl bg-gradient-to-br from-surface to-[#111827]/40 border border-border relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-mono font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Career Growth Operating System
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight leading-none text-white">
              {greeting}, <span className="text-accent">{firstName}</span>
            </h1>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              Your dashboard has been personalized for: <strong className="text-text font-bold">{userGoal || "Senior Leader"}</strong>. Run audits below to pinpoint growth milestones.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button 
              onClick={() => onNavigate('analyzer')}
              className="btn-primary py-2.5 px-5 text-xs font-bold inline-flex items-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow bg-transparent border-0" />
              Run New Audit
            </button>
            <button 
              onClick={() => onNavigate('generator')}
              className="btn-secondary py-2.5 px-5 text-xs font-bold inline-flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5 text-accent" />
              Generate LinkedIn Post
            </button>
          </div>

          <div className="flex items-center gap-5 pt-4 border-t border-border/40 max-w-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted font-bold">Followers</div>
                <div className="text-sm font-bold text-white font-mono">
                  {user.followers_count !== undefined 
                    ? Number(user.followers_count).toLocaleString() 
                    : (analyticsData?.followers_count 
                      ? Number(analyticsData.followers_count).toLocaleString() 
                      : "1,280")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 border-l border-border/30 pl-5">
              <UserCheck className="w-4 h-4 text-accent" />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted font-bold">Connections</div>
                <div className="text-sm font-bold text-white font-mono">
                  {user.connections_count !== undefined 
                    ? Number(user.connections_count).toLocaleString() 
                    : (analyticsData?.connections_count 
                      ? Number(analyticsData.connections_count).toLocaleString() 
                      : "500")}+
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress gauge element: Toward TOP 10% Profile */}
        <div className="p-5 rounded-2xl bg-surface2/50 border border-border flex items-center gap-5 shrink-0 w-full sm:w-auto relative group">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" className="stroke-border" strokeWidth="6" fill="transparent" />
              <circle 
                cx="50" 
                cy="50" 
                r="42" 
                className="stroke-accent transition-all duration-500" 
                strokeWidth="6" 
                fill="transparent" 
                strokeDasharray={`${2 * Math.PI * 42}`} 
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - brandScoreVal / 100)}`} 
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-mono font-black text-white">{brandScoreVal}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent font-extrabold">CREATOR STANDING</div>
            <h4 className="text-sm font-bold text-text truncate max-w-[150px]">Top 10% Standard</h4>
            <p className="text-[11px] text-muted max-w-[180px] leading-relaxed">
              Calculated overall diagnostic power based on metric indices.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SECTION 2: TODAY'S PRIORITIES (5 cols) */}
        <section className="lg:col-span-5 card space-y-6 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Target className="w-4.5 h-4.5 text-accent" />
                <h3 className="text-base font-display font-bold">Today's Priorities</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 rounded uppercase tracking-wider">
                {completionPercentage}% DONE
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed mt-3 mb-4">
              Tick off these high-priority benchmarks generated directly from your Narratiq score:
            </p>

            <div className="space-y-3">
              {priorities.map((task, i) => (
                <div 
                  key={task.id}
                  onClick={() => handleTogglePriority(i)}
                  className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all cursor-pointer select-none group ${
                    task.completed 
                      ? 'bg-success/5 border-success/20 text-success opacity-85' 
                      : 'bg-surface2/30 border-border/70 hover:bg-surface2 hover:border-border text-text'
                  }`}
                >
                  <div className={`w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 border mt-0.5 transition-all ${
                    task.completed 
                      ? 'bg-success border-success text-bg' 
                      : 'border-muted/50 group-hover:border-accent'
                  }`}>
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                  </div>
                  <div>
                    <div className={`text-xs font-semibold ${task.completed ? 'line-through text-success/80' : 'text-text'}`}>
                      {task.text}
                    </div>
                    <div className="text-[10px] text-muted mt-0.5 uppercase tracking-wide font-mono font-bold">
                      {task.category}  ·  +{task.xp} XP
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border/80 text-[10px] text-muted flex justify-between items-center bg-transparent mt-4">
            <span>Progress drives XP Levels</span>
            <span className="font-mono font-bold uppercase text-accent">Interactive Tasks</span>
          </div>
        </section>

        {/* SECTION 3: AI COACH (7 cols) */}
        <section className="lg:col-span-7 card flex flex-col justify-between relative bg-gradient-to-br from-surface to-surface/40 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent2/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-accent2 animate-pulse bg-transparent border-0" />
                <h3 className="text-base font-display font-bold">Narratiq AI Coach</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-accent2 bg-accent2/10 px-2 py-0.5 rounded uppercase tracking-wider">
                Aura AI Live
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-surface2/50 border border-border mt-5 space-y-3.5">
              <h4 className="text-sm font-bold text-text font-display leading-snug">
                "{coachInfo.header}"
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Based on your personalized track, your current profile positioning indicates:
                <span className="text-text font-medium">{coachInfo.desc}</span>
              </p>

              <div className="flex items-center justify-between p-3.5 bg-accent/5 rounded-xl border border-accent/15">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-muted block font-bold">Highest Impact Action</span>
                  <span className="text-xs font-bold text-white leading-tight">{coachInfo.impact}</span>
                </div>
                <div className="text-right pl-4 shrink-0">
                  <span className="inline-block px-2 py-1 rounded bg-[#a78bfa]/15 text-[#a78bfa] text-[10px] font-mono font-extrabold tracking-wide">
                    {coachInfo.points} Estimated
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-border flex justify-between items-center mt-6">
            <p className="text-[11px] text-muted max-w-sm leading-relaxed">
              Deploy optimized sections inside profile properties to trigger immediate algorithmic indexing updates.
            </p>
            <button 
              onClick={() => onNavigate(coachInfo.view)}
              className="btn-secondary py-2 px-4 text-[11px] font-bold inline-flex items-center gap-1 shrink-0"
            >
              Action Coach
              <ArrowRight className="w-3.5 h-3.5 text-accent ml-1" />
            </button>
          </div>
        </section>

      </div>

      {/* SECTION 4: PROFILE HEALTH GAUGES */}
      <section className="card space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-border/80">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            <h3 className="text-base font-display font-bold">Profile Health Indicators</h3>
          </div>
          <span className="text-[9px] font-mono uppercase tracking-wider text-muted">Aura Performance gauges</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* LinkedIn Brand Score Gauge */}
          <div className="p-5 rounded-2xl bg-surface2/40 border border-border flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="32" className="stroke-border" strokeWidth="5" fill="transparent" />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="32" 
                  className="stroke-accent" 
                  strokeWidth="5" 
                  fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 32}`} 
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - brandScoreVal / 100)}`} 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-mono font-black text-white">{brandScoreVal}</span>
                <span className="text-[8px] uppercase font-bold text-muted bg-[#111827]/30 px-1 py-0.2 rounded font-mono">Index</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-text uppercase tracking-widest">LinkedIn Brand Score</div>
              <p className="text-[10px] text-muted leading-relaxed mt-1">Grade {brandGradeVal} authority metrics.</p>
            </div>
          </div>

          {/* ATS Resume score gauge */}
          <div className="p-5 rounded-2xl bg-surface2/40 border border-border flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="32" className="stroke-border" strokeWidth="5" fill="transparent" />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="32" 
                  className="stroke-accent2" 
                  strokeWidth="5" 
                  fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 32}`} 
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - atsScoreVal / 100)}`} 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-mono font-black text-white">{atsScoreVal}</span>
                <span className="text-[8px] uppercase font-bold text-muted bg-[#111827]/30 px-1 py-0.2 rounded font-mono">ATS</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-text uppercase tracking-widest">ATS Resume Score</div>
              <p className="text-[10px] text-muted leading-relaxed mt-1">Parsed match weights versus hiring tags.</p>
            </div>
          </div>

          {/* SEO Density gauge */}
          <div className="p-5 rounded-2xl bg-surface2/40 border border-border flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="32" className="stroke-border" strokeWidth="5" fill="transparent" />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="32" 
                  className="stroke-cyan-500" 
                  strokeWidth="5" 
                  fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 32}`} 
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - keywordCoverage / 100)}`} 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-mono font-black text-white">{keywordCoverage}%</span>
                <span className="text-[8px] uppercase font-bold text-muted bg-[#111827]/30 px-1 py-0.2 rounded font-mono">Density</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-text uppercase tracking-widest">SEO Search Score</div>
              <p className="text-[10px] text-muted leading-relaxed mt-1">Coverage of missed executive search keywords.</p>
            </div>
          </div>

          {/* Completion Density gauge */}
          <div className="p-5 rounded-2xl bg-surface2/40 border border-border flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="32" className="stroke-border" strokeWidth="5" fill="transparent" />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="32" 
                  className="stroke-yellow-500" 
                  strokeWidth="5" 
                  fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 32}`} 
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - auditCompletion / 100)}`} 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-mono font-black text-white">{auditCompletion}%</span>
                <span className="text-[8px] uppercase font-bold text-muted bg-[#111827]/30 px-1 py-0.2 rounded font-mono">Specs</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-text uppercase tracking-widest">Profile Completion</div>
              <p className="text-[10px] text-muted leading-relaxed mt-1">Completeness weighting based on standard tags.</p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 5: RECENT ACHIEVEMENTS & REPORTS GENERATOR FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* RECENT FEED AND EXECUTIVE REPORTS LISTING (7 cols) */}
        <section className="lg:col-span-7 card space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-accent" />
                <h3 className="text-base font-display font-bold">Recent Achievements</h3>
              </div>
              <span className="text-[9px] font-mono uppercase bg-accent/15 text-accent px-2 py-0.5 rounded tracking-wider font-extrabold">Achievements Log</span>
            </div>

            <div className="space-y-3 mt-4">
              
              {/* Latest analysis event log */}
              <div className="p-4 rounded-xl bg-surface2/40 border border-border/80 flex justify-between items-center hover:border-accent/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg text-accent">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-text">Completed Core Profile Audit</div>
                    <div className="text-[10px] text-muted font-mono leading-normal mt-0.5">
                      Analyzed snapshot indices: {brandScoreVal}/100 Grade {brandGradeVal}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('analyzer')}
                  className="rounded-lg p-1.5 hover:bg-surface2/60 text-muted hover:text-text transition-colors"
                >
                  <ArrowRight className="w-4 h-4 bg-transparent border-0" />
                </button>
              </div>

              {/* Latest resume scan event log */}
              <div className="p-4 rounded-xl bg-surface2/40 border border-border/80 flex justify-between items-center hover:border-accent/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#22d3ee]/10 rounded-lg text-[#22d3ee]">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-text">Completed ATS Resume Scan</div>
                    <div className="text-[10px] text-muted font-mono leading-normal mt-0.5">
                      Matched CV weight density overall standing: {atsScoreVal}/100
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('resumebuilder')}
                  className="rounded-lg p-1.5 hover:bg-surface2/60 text-muted hover:text-text transition-colors"
                >
                  <ArrowRight className="w-4 h-4 bg-transparent border-0" />
                </button>
              </div>

              {/* List newly saved career reports */}
              {savedReports.length > 0 ? (
                savedReports.slice(0, 3).map((report) => {
                  let parsedScore: any = {};
                  try {
                    parsedScore = JSON.parse(report.score_data || "{}");
                  } catch(e) {}
                  return (
                    <div key={report.id} className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/5 to-transparent border border-yellow-500/15 flex justify-between items-center hover:border-yellow-500/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                          <FileText className="w-4 h-4 bg-transparent border-0" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-text">{report.report_title}</div>
                          <div className="text-[10px] text-muted font-mono leading-normal mt-0.5">
                            Brand score: {parsedScore.brandScore || brandScoreVal} · Match Match: {parsedScore.atsScore || atsScoreVal}
                          </div>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono uppercase bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded tracking-widest font-extrabold cursor-default">Saved Report</span>
                    </div>
                  );
                })
              ) : null}

            </div>
          </div>

          <p className="text-[10px] text-muted font-mono italic leading-normal bg-transparent mt-5">
            Narratiq records audits durably in SQLite. Upgrades or re-scans automatically log updates here.
          </p>
        </section>

        {/* INTEGRATED EXECUTIVE PDF CONSULT REPORT ACTION BLOCK (5 cols) */}
        <section className="lg:col-span-5 card bg-gradient-to-br from-surface to-surface2/30 relative flex flex-col justify-between overflow-hidden border border-border">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div className="flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-yellow-500" />
                <h3 className="text-base font-display font-bold">Executive Report</h3>
              </div>
              <span className="text-[8px] font-mono uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-2.5 py-0.5 rounded font-extrabold">Consultant Style</span>
            </div>

            <div className="space-y-4 pt-4">
              <div className="p-4 rounded-xl bg-surface2/60 border border-border/60">
                <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest block font-mono">Premium Consulting PDF</div>
                <p className="text-[11px] text-muted mt-1.5 leading-relaxed">
                  Generate a downloadable, comprehensive consultant-grade PDF auditing overall digital signals, missing industry search keywords, and full 30-day publishing roadmaps.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <div className="p-3.5 rounded-xl border border-border/50 text-left bg-surface/50">
                  <div className="text-[9px] text-[#22d3ee] font-mono font-bold uppercase tracking-wider">Scoring Included</div>
                  <span className="text-xs font-medium text-text mt-1 inline-block">Exec Summary &amp; Index</span>
                </div>
                <div className="p-3.5 rounded-xl border border-border/50 text-left bg-surface/50">
                  <div className="text-[9px] text-yellow-500 font-mono font-bold uppercase tracking-wider">Rewards</div>
                  <span className="text-xs font-medium text-text mt-1 inline-block">+120 XP Awarded</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border mt-8 flex flex-col gap-2 bg-transparent">
            <button
              onClick={handleGenerateCareerReport}
              disabled={isGeneratingReport}
              className={`w-full py-2.5 px-4 rounded-xl font-display font-semibold text-xs flex items-center justify-center gap-2 shadow-lg leading-normal ${
                isGeneratingReport 
                  ? 'bg-yellow-500/10 text-yellow-500/50 cursor-not-allowed border border-yellow-500/15' 
                  : 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-bg border border-yellow-600 transition-colors'
              }`}
            >
              {isGeneratingReport ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0 bg-transparent border-0" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 shrink-0 bg-transparent border-0" strokeWidth="2.5" />
                  Download Career Report PDF
                </>
              )}
            </button>
          </div>
        </section>

      </div>

      {/* 30-DAY GROW PLANNING CAMPAIGN ROADMAP WEEK SECTOR */}
      <section className="card space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-border/80">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-500" />
            <h3 className="text-base font-display font-bold">30-Day Growth Roadmap Strategy</h3>
          </div>
          <div className="flex p-0.5 bg-surface2 border border-border/80 rounded-xl w-full sm:w-auto overflow-hidden">
            {[1, 2, 3, 4].map((wk) => (
              <button
                key={wk}
                onClick={() => setActiveRoadmapWeek(wk)}
                className={`flex-1 sm:flex-initial py-1 px-3.5 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase transition-all ${
                  activeRoadmapWeek === wk 
                    ? 'bg-yellow-500/15 text-yellow-500 border border-yellow-500/25 font-extrabold shadow-sm' 
                    : 'text-muted hover:text-text hover:bg-surface/30'
                }`}
              >
                Week 0{wk}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-surface2/30 p-4 rounded-2xl border border-border/60">
          <div className="lg:col-span-5 space-y-3">
            <div className="text-[10px] font-mono tracking-widest text-yellow-500 font-bold uppercase">Focus Campaign Goal</div>
            <h4 className="text-base font-display font-black leading-snug">{activeRoadmapData.theme}</h4>
            <p className="text-xs text-muted leading-relaxed">
              {activeRoadmapData.focus}
            </p>
          </div>

          <div className="lg:col-span-3.5 space-y-2.5">
            <div className="text-[10px] font-mono tracking-widest text-[#a78bfa] font-bold uppercase">Checklist items</div>
            <ul className="space-y-1.5 list-none pl-0">
              {(activeRoadmapData.actionItems || []).map((action: string, idx: number) => (
                <li key={idx} className="text-xs text-muted flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] shrink-0 mt-1.5" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3.5 space-y-2.5">
            <div className="text-[10px] font-mono tracking-widest text-accent font-bold uppercase">Content theme suggestions</div>
            <div className="space-y-1.5">
              {(activeRoadmapData.contentIdeas || []).map((idea: string, idx: number) => (
                <div key={idx} className="p-3 bg-surface/60 rounded-xl border border-border/80 text-[11px] text-muted leading-relaxed flex gap-2 hover:border-accent/15 transition-all">
                  <Lightbulb className="w-4 h-4 text-accent shrink-0 mt-0.5 bg-transparent border-0" />
                  <p>{idea}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: ALGORITHMIC DEPLOY SYSTEM */}
      <section className="card bg-gradient-to-br from-surface to-surface2/10 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-3 border-b border-border mb-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#a78bfa]" />
            <h3 className="text-base font-display font-bold">Algorithmic Content Strategy Plan</h3>
          </div>
          <span className="text-[8px] font-mono uppercase bg-accent/10 text-accent px-2.5 py-0.5 rounded font-extrabold tracking-widest">Algorithm Index</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-4 bg-surface rounded-2xl border border-border flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest font-mono font-black text-[#a78bfa] block">RECOMMENDED ISSUES</span>
              <p className="text-xs text-muted leading-normal">
                Action-thematic fields calculated specifically based on indexing analytics results.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {recommendedTopics.map((topicStr: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-surface2/80 text-[10px] rounded border border-border/70 text-text/90 font-mono">
                    {topicStr}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-2xl border border-border flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest font-mono font-black text-cyan-400 block font-bold">CADENCE DENSITY</span>
              <p className="text-xs text-muted leading-normal">
                Calculated optimal delivery frequencies engineered to capture target feed profiles.
              </p>
              <div className="tag tag-cyan inline-flex items-center justify-center text-xs font-mono font-extrabold px-3 py-1.5 rounded-lg border w-fit mt-3">
                {postingFrequency}
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-2xl border border-border flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest font-mono font-black text-yellow-500 block">strategic pillars</span>
              <p className="text-xs text-muted leading-normal">
                Pillars that ground and center executive messaging authority.
              </p>
              <ul className="space-y-1.5 list-none pl-0 pt-2">
                {contentPillars.map((pillar: string, i: number) => (
                  <li key={i} className="text-[11px] text-muted flex items-start gap-2">
                    <span className="text-yellow-500 mt-1 select-none font-bold">•</span>
                    <span>{pillar}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-8 pt-6 border-t border-border">
          <div className="text-xs text-muted max-w-md text-center sm:text-left leading-relaxed">
            Deploy this plan to drive impressions using our high-virality creation generators.
          </div>
          <button 
            onClick={() => onNavigate('generator')}
            className="btn-primary py-2.5 px-6 text-xs font-display font-semibold inline-flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            Create Your Next Post
            <ArrowRight className="w-4 h-4 bg-bg rounded-full p-0.5 text-accent shrink-0" />
          </button>
        </div>
      </section>

    </div>
  );
}
