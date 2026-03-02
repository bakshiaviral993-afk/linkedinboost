import React, { useState, useEffect } from "react";
import { 
  Linkedin, 
  Sparkles, 
  TrendingUp, 
  FileText, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  User,
  LayoutDashboard,
  PenTool,
  Settings,
  LogOut,
  ChevronRight,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { analyzeProfile, generatePosts, type ProfileAnalysis, type PostDraft } from "./services/gemini";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [profileText, setProfileText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [posts, setPosts] = useState<PostDraft[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "generator" | "settings">("dashboard");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [debugStatus, setDebugStatus] = useState<{ hasClientId: boolean, hasClientSecret: boolean } | null>(null);

  useEffect(() => {
    // Fetch system status for debug
    fetch('/api/health')
      .then(r => r.json())
      .then(data => setDebugStatus(data))
      .catch(err => console.error("Health check failed", err));

    const savedUserId = localStorage.getItem("linkboost_user_id");
    if (savedUserId) {
      fetchUser(savedUserId);
    } else {
      setLoading(false);
    }

    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        const userId = event.data.userId;
        localStorage.setItem("linkboost_user_id", userId);
        fetchUser(userId);
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, []);

  const fetchUser = async (id: string) => {
    try {
      const res = await fetch(`/api/user/${id}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem("linkboost_user_id");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (isConnecting) return;
    
    // Open a blank popup immediately to bypass popup blockers
    const popup = window.open("about:blank", "linkedin_oauth", "width=600,height=700");
    
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      setStatusMessage({ type: "error", text: "Popup blocked! Please allow popups for this site." });
      return;
    }

    setIsConnecting(true);
    try {
      const res = await fetch("/api/auth/url");
      const data = await res.json();
      
      if (data.error) {
        popup.close();
        setStatusMessage({ type: "error", text: data.error });
        return;
      }
      
      // Redirect the existing popup to the LinkedIn auth URL
      popup.location.href = data.url;
    } catch (err) {
      console.error(err);
      if (popup) popup.close();
      setStatusMessage({ type: "error", text: "Failed to connect to LinkedIn. Please check your internet connection." });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("linkboost_user_id");
    setUser(null);
    setAnalysis(null);
    setPosts([]);
  };

  const handleAnalyze = async () => {
    if (!profileText) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeProfile(profileText);
      setAnalysis(result);
      setActiveTab("dashboard");
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Profile analysis failed" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!targetRole) return;
    setIsGenerating(true);
    try {
      const result = await generatePosts(profileText || analysis?.summary || "", targetRole);
      setPosts(result);
      setActiveTab("generator");
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Content generation failed" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePost = async (content: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, content }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: "success", text: "Post published successfully!" });
      } else {
        throw new Error(data.error || "Failed to post");
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-900">
        <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <span>LinkBoost <span className="text-indigo-600">AI</span></span>
          </div>
          <button 
            onClick={handleConnect}
            disabled={isConnecting}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-70"
          >
            {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Linkedin className="w-4 h-4" />}
            {isConnecting ? "Connecting..." : "Connect LinkedIn"}
          </button>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              <TrendingUp className="w-4 h-4" />
              AI-Powered LinkedIn Growth
            </div>
            <h1 className="text-6xl font-bold leading-[1.1] mb-6 tracking-tight">
              Optimize your profile. <br />
              <span className="text-indigo-600">Automate your content.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg">
              The all-in-one AI engine to score your LinkedIn profile, generate high-impact posts, and schedule them automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Get Started for Free"}
                {!isConnecting && <ChevronRight className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-4 px-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <img 
                      key={i}
                      src={`https://picsum.photos/seed/user${i}/100/100`} 
                      className="w-10 h-10 rounded-full border-2 border-white"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <div className="text-sm text-slate-500 font-medium">
                  Joined by 2,000+ professionals
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative z-10 overflow-hidden mb-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full" />
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-slate-800 animate-pulse" />
                <div className="space-y-2">
                  <div className="w-32 h-4 bg-slate-800 rounded animate-pulse" />
                  <div className="w-24 h-3 bg-slate-800/50 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">AI Analysis</span>
                    <span className="text-xs text-slate-400">Score: 88/100</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "88%" }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="h-full bg-indigo-500" 
                    />
                  </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Generated Post</div>
                  <p className="text-sm text-slate-300 italic leading-relaxed">
                    "Just realized that the best way to scale is to stop doing things that don't scale..."
                  </p>
                </div>
              </div>
            </div>

            {/* System Status Debug Box on Landing Page */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-400" />
                System Status (Debug)
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">LinkedIn Client ID:</span>
                  <span className={`font-mono font-bold ${debugStatus?.hasClientId ? 'text-emerald-600' : 'text-red-500'}`}>
                    {debugStatus === null ? 'Checking...' : (debugStatus.hasClientId ? 'Configured ✅' : 'Missing ❌')}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">LinkedIn Client Secret:</span>
                  <span className={`font-mono font-bold ${debugStatus?.hasClientSecret ? 'text-emerald-600' : 'text-red-500'}`}>
                    {debugStatus === null ? 'Checking...' : (debugStatus.hasClientSecret ? 'Configured ✅' : 'Missing ❌')}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase font-bold mb-2">Required Redirect URI:</div>
                  <div className="bg-slate-50 p-2 rounded-lg text-[9px] font-mono break-all text-slate-600 border border-slate-100">
                    {window.location.origin}/auth/linkedin/callback
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2 font-bold text-xl mb-12">
          <div className="bg-indigo-600 p-1 rounded-lg">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span>LinkBoost AI</span>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "dashboard" ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Profile Analyzer
          </button>
          <button 
            onClick={() => setActiveTab("generator")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "generator" ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <PenTool className="w-5 h-5" />
            Content Generator
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "settings" ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </nav>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-6 px-2">
            <img src={user.picture} className="w-10 h-10 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
            <div className="overflow-hidden">
              <div className="font-semibold text-sm truncate">{user.name}</div>
              <div className="text-xs text-slate-500 truncate">{user.email}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {statusMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 ${statusMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}
            >
              {statusMessage.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{statusMessage.text}</span>
              <button onClick={() => setStatusMessage(null)} className="ml-2 opacity-50 hover:opacity-100">×</button>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === "dashboard" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-5xl mx-auto"
          >
            <header className="mb-10 flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Profile Analyzer</h2>
                <p className="text-slate-500">Analyze your LinkedIn profile to get a score and recommendations.</p>
              </div>
              {!analysis && (
                <button 
                  onClick={() => setActiveTab("generator")}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
                >
                  <Plus className="w-5 h-5" />
                  Analyze New Profile
                </button>
              )}
            </header>

            <div className="grid lg:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Profile Score</div>
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                    <motion.circle 
                      cx="64" cy="64" r="58" fill="transparent" stroke="#4f46e5" strokeWidth="12" 
                      strokeDasharray={364.4}
                      initial={{ strokeDashoffset: 364.4 }}
                      animate={{ strokeDashoffset: 364.4 * (1 - (analysis?.score || 0) / 100) }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-black text-slate-900">{analysis?.score || "--"}</span>
                  </div>
                </div>
                <p className="text-center text-sm text-slate-500 font-medium">
                  {analysis ? "Great job! Your profile is strong." : "Analyze your profile to get a score."}
                </p>
                {!analysis && (
                  <button 
                    onClick={() => setActiveTab("generator")}
                    className="w-full mt-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all"
                  >
                    Start Analysis
                  </button>
                )}
              </div>

              <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">How to get started</div>
                  <HelpCircle className="w-5 h-5 text-slate-400" />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                      <p className="text-sm text-slate-600 leading-relaxed">Go to your LinkedIn profile and click <strong>"More"</strong> then <strong>"Save to PDF"</strong>.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                      <p className="text-sm text-slate-600 leading-relaxed">Open the PDF, copy all the text, and paste it into the <strong>Content Generator</strong> tab.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                      <p className="text-sm text-slate-600 leading-relaxed">Click <strong>"Analyze Profile"</strong> to get your score and AI-optimized headline.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                      <p className="text-sm text-slate-600 leading-relaxed">Enter your target role and click <strong>"Generate Posts"</strong> to see the magic!</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab("generator")}
                  className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  Go to Content Generator
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-10">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Optimized Headline</div>
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                  <p className="text-lg font-semibold text-slate-800 leading-relaxed">
                    {analysis?.headline || "Your AI-optimized headline will appear here."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis?.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Actionable Recommendations</div>
                <div className="space-y-4">
                  {analysis?.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{rec}</p>
                    </div>
                  )) || (
                    <div className="text-center py-12 text-slate-400">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>Paste your profile data to get recommendations.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Optimized Summary</div>
                <div className="prose prose-slate prose-sm max-w-none">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {analysis?.summary || "Your AI-optimized summary will appear here."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "generator" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-5xl mx-auto"
          >
            <header className="mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Content Generator</h2>
              <p className="text-slate-500">Generate high-impact LinkedIn posts tailored to your professional profile.</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider">Step 1: Profile Data</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setProfileText("Name: Aviral Bakshi\nRole: Senior Product Manager\nExperience: 8+ years in SaaS and Fintech. Led cross-functional teams to deliver high-impact products. Expertise in user research, product strategy, and data-driven decision making.")}
                        className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded-md font-bold hover:bg-slate-100 transition-all"
                      >
                        Try Sample
                      </button>
                      <button 
                        onClick={() => setProfileText(`Name: ${user.name}\nEmail: ${user.email}\n\n[Paste your LinkedIn "About" and "Experience" sections here for a full analysis]`)}
                        className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-bold hover:bg-indigo-100 transition-all"
                      >
                        Fetch Basic Info
                      </button>
                    </div>
                  </div>
                  <textarea 
                    value={profileText}
                    onChange={(e) => setProfileText(e.target.value)}
                    placeholder="Paste your LinkedIn profile text (About, Experience, etc.) or export your profile as PDF and paste the text here..."
                    className="w-full h-48 p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm resize-none mb-4"
                  />
                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !profileText}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
                  >
                    {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isAnalyzing ? "Analyzing..." : "Analyze & Save Profile"}
                  </button>
                </div>

                <div className={`bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm transition-all ${!analysis && !profileText ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Step 2: Target Role</label>
                  <input 
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Product Manager"
                    className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm mb-4"
                  />
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !targetRole || (!profileText && !analysis)}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4" />}
                    {isGenerating ? "Generating..." : "Generate Posts"}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                {posts.length > 0 ? (
                  posts.map((post, i) => (
                    <motion.div 
                      key={post.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm group"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{post.type}</div>
                            <div className="text-sm font-bold text-slate-900">{post.hook}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handlePost(post.content)}
                          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 opacity-0 group-hover:opacity-100"
                        >
                          <Send className="w-4 h-4" />
                          Post Now
                        </button>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm font-medium">
                          {post.content}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="bg-white rounded-[2rem] border border-slate-200 border-dashed p-20 flex flex-col items-center justify-center text-slate-400">
                    <PenTool className="w-16 h-16 mb-6 opacity-10" />
                    <p className="text-lg font-medium">No posts generated yet.</p>
                    <p className="text-sm">Enter your target role and hit generate to see the magic.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto"
          >
            <header className="mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Settings</h2>
              <p className="text-slate-500">Manage your account and preferences.</p>
            </header>

            <div className="space-y-6">
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                  <h3 className="font-bold text-lg mb-6">LinkedIn Integration</h3>
                  <div className="flex items-center justify-between p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Linkedin className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-emerald-900">Connected to LinkedIn</div>
                        <div className="text-sm text-emerald-700 opacity-80">Your account is synced and ready to post.</div>
                      </div>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="font-bold text-lg mb-6">Danger Zone</h3>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-red-100 text-red-500 font-bold hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    Disconnect Account
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
                <h3 className="font-bold text-lg mb-4">System Status (Debug)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">LinkedIn Client ID:</span>
                    {analysis || user ? (
                      <span className="font-mono font-bold text-indigo-600">Configured ✅</span>
                    ) : (
                      <span className="font-mono font-bold text-red-500">Missing ❌</span>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">LinkedIn Client Secret:</span>
                    {analysis || user ? (
                      <span className="font-mono font-bold text-indigo-600">Configured ✅</span>
                    ) : (
                      <span className="font-mono font-bold text-red-500">Missing ❌</span>
                    )}
                  </div>
                  <div className="pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-400 uppercase font-bold mb-2">Required Redirect URI:</div>
                    <div className="bg-slate-50 p-3 rounded-xl text-[10px] font-mono break-all text-slate-600 border border-slate-100">
                      {window.location.origin}/auth/linkedin/callback
                    </div>
                  </div>
                </div>
                {!user && (
                  <p className="mt-4 text-xs text-slate-400 italic">
                    If keys show as "Missing", please add them to the Secrets panel in AI Studio and restart the server.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
