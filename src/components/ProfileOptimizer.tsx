import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  BarChart3, 
  ChevronRight, 
  RefreshCw, 
  Target, 
  ShieldCheck, 
  Code, 
  ExternalLink, 
  Check, 
  User, 
  Layers, 
  Download,
  Info 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { optimizeSection, type OptimizationResult } from "../services/gemini";

type User = { id: string; name: string; email: string; picture?: string; headline?: string; about?: string };

interface ProfileOptimizerProps {
  user: User;
  onUpdateUser?: (updated: Partial<User>) => void;
}

export default function ProfileOptimizer({ user, onUpdateUser }: ProfileOptimizerProps) {
  const [activeTab, setActiveTab] = useState<'blueprint' | 'lab' | 'extension'>('blueprint');
  
  // Section Lab States
  const [activeSection, setActiveSection] = useState<'headline' | 'about' | 'experience'>('headline');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [labResult, setLabResult] = useState<OptimizationResult | null>(null);
  const [labError, setLabError] = useState<string | null>(null);
  const [labFormData, setLabFormData] = useState({ content: "", context: "" });

  // Blueprint Generator States
  const [industry, setIndustry] = useState("Technology Strategy & Leadership");
  const [focusGoal, setFocusGoal] = useState("Position as a thought leader & drive consulting clients");
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [blueprintResult, setBlueprintResult] = useState<{
    suggestedHeadline: string;
    suggestedAbout: string;
    suggestedSkills: string[];
    suggestedBanner: string;
  } | null>(null);
  const [blueprintError, setBlueprintError] = useState<string | null>(null);
  const [blueprintSavedNotify, setBlueprintSavedNotify] = useState(false);

  // Database integration sync state loaders
  const [headlineSavedState, setHeadlineSavedState] = useState(false);
  const [aboutSavedState, setAboutSavedState] = useState(false);

  // Copy success tooltips states
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Chrome Extension Simulation Playground States
  const [simHeadline, setSimHeadline] = useState(user.headline || "Unoptimized Professional Headline");
  const [simAbout, setSimAbout] = useState(user.about || "Experienced specialist with demonstrated history working in the market.");
  const [simSkills, setSimSkills] = useState<string[]>([]);
  const [isSimulatingInject, setIsSimulatingInject] = useState(false);
  const [simStep, setSimStep] = useState<string | null>(null);
  const [simFinished, setSimFinished] = useState(false);

  // Synchronize Section Lab form content with user profiles
  useEffect(() => {
    let content = "";
    if (activeSection === 'headline') {
      content = user.headline || "";
    } else if (activeSection === 'about') {
      content = user.about || "";
    }
    setLabFormData(prev => ({ ...prev, content }));
    setLabResult(null);
  }, [activeSection, user.headline, user.about]);

  // Load existing profile blueprints on mount if available
  useEffect(() => {
    const fetchExistingBlueprint = async () => {
      try {
        const res = await fetch(`/api/profile-blueprint/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.suggested_headline || data.suggested_about) {
            let skills: string[] = [];
            try {
              skills = JSON.parse(data.suggested_skills || "[]");
            } catch (e) {
              skills = [];
            }
            setBlueprintResult({
              suggestedHeadline: data.suggested_headline,
              suggestedAbout: data.suggested_about,
              suggestedSkills: skills,
              suggestedBanner: data.suggested_banner || "High-Impact Leader | Strategic Business Scaling Architect"
            });
          }
        }
      } catch (err) {
        console.error("Failed to sync current blueprint state from db:", err);
      }
    };
    fetchExistingBlueprint();
  }, [user.id]);

  // Handler for Copy actions
  const triggerCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Handler for Section optimization API
  const handleOptimizeSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOptimizing(true);
    setLabError(null);
    try {
      const data = await optimizeSection(activeSection, labFormData.content, labFormData.context);
      setLabResult(data);
    } catch (err: any) {
      setLabError(err.message || "Failed optimizing profile section.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Handler for Full Blueprint Generation
  const handleGenerateFullBlueprint = async () => {
    setIsGeneratingBlueprint(true);
    setBlueprintError(null);
    try {
      const response = await fetch("/api/generate-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          currentHeadline: user.headline || "",
          currentAbout: user.about || "",
          industry,
          focusGoal
        })
      });

      if (!response.ok) {
        throw new Error("Failed generating layout recommendations. Please retry.");
      }

      const data = await response.json();
      setBlueprintResult(data);

      // Save suggestion results into profile_blueprints automatically
      await fetch("/api/profile-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          suggestedHeadline: data.suggestedHeadline,
          suggestedAbout: data.suggestedAbout,
          suggestedSkills: data.suggestedSkills,
          suggestedBanner: data.suggestedBanner
        })
      });
    } catch (err: any) {
      setBlueprintError(err.message || "Profile Blueprint Generation failed.");
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  // Persistent updates database callers
  const handleApplyHeadline = async (headlineVal: string) => {
    try {
      const response = await fetch(`/api/user/${user.id}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: headlineVal,
          about: user.about || ""
        })
      });
      if (response.ok) {
        onUpdateUser?.({ headline: headlineVal });
        setHeadlineSavedState(true);
        setTimeout(() => setHeadlineSavedState(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyAbout = async (aboutVal: string) => {
    try {
      const response = await fetch(`/api/user/${user.id}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: user.headline || "",
          about: aboutVal
        })
      });
      if (response.ok) {
        onUpdateUser?.({ about: aboutVal });
        setAboutSavedState(true);
        setTimeout(() => setAboutSavedState(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulation of browser extension DOM inject trigger
  const triggerExtensionSimulation = () => {
    if (!blueprintResult) return;
    setIsSimulatingInject(true);
    setSimFinished(false);
    
    // Step 1: Establish handshake
    setSimStep("Establishing secure connection with Narratiq Cloud Workspace...");
    
    setTimeout(() => {
      // Step 2: Extracting suggested items
      setSimStep("Fetching synchronized Profile Blueprint details...");
      
      setTimeout(() => {
        // Step 3: Injecting Headline
        setSimStep("Injected optimized LinkedIn headline...");
        setSimHeadline(blueprintResult.suggestedHeadline);
        
        setTimeout(() => {
          // Step 4: Injecting Summary
          setSimStep("Replacing with narrative LinkedIn About statement...");
          setSimAbout(blueprintResult.suggestedAbout);
          
          setTimeout(() => {
            // Step 5: Injecting Skills
            setSimStep("Appending high-impact industry Skills tags...");
            setSimSkills(blueprintResult.suggestedSkills);
            
            setTimeout(() => {
              setSimStep(null);
              setIsSimulatingInject(false);
              setSimFinished(true);
            }, 1000);
          }, 1200);
        }, 1200);
      }, 1000);
    }, 1000);
  };

  const extensionManifestJson = `{
  "manifest_version": 3,
  "name": "Narratiq Profile Auto-Fill",
  "version": "1.0.0",
  "description": "One-click injector that synchronizes your LinkedIn profile with AI suggestions",
  "permissions": ["activeTab"],
  "content_scripts": [
    {
      "matches": ["https://www.linkedin.com/in/*", "https://www.linkedin.com/profile/*"],
      "js": ["content.js"]
    }
  ],
  "action": {
    "default_title": "Open Narratiq Panel"
  }
}`;

  const extensionContentJs = `// content.js - DOM-based target automation
console.log("[Narratiq Extension] Ready to optimize profile.");

async function loadAndInjectBlueprint(userId) {
  const resp = await fetch(\`https://ais-dev-n3phu7yhwyscyuqzobmini-306794401631.asia-east1.run.app/api/profile-blueprint/\${userId}\`);
  const data = await resp.json();
  
  if (data) {
    // 1. Selector for standard LinkedIn headline edit fields
    const headlineField = document.querySelector('input[name="headline"]') || document.querySelector('textarea#headline');
    if (headlineField) {
      headlineField.value = data.suggested_headline;
      headlineField.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // 2. Selector for LinkedIn summary/about textareas
    const aboutField = document.querySelector('textarea[name="about"]') || document.querySelector('textarea#about');
    if (aboutField) {
      aboutField.value = data.suggested_about;
      aboutField.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    console.log("[Narratiq] Successfully injected suggestion draft!");
  }
}`;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in" id="profile-optimizer-section">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-black tracking-tight mb-2">LinkedIn Profile Optimizer & SEO</h2>
          <p className="text-muted text-sm">Optimize headlines, narratives, and digital presence using algorithmic scoring and database automation.</p>
        </div>
        
        {/* Tab Headers */}
        <div className="flex gap-1.5 p-1 bg-surface2 rounded-xl border border-border/80 self-start md:self-auto">
          <button 
            onClick={() => setActiveTab('blueprint')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'blueprint' ? 'bg-surface text-accent shadow-sm border border-border' : 'text-muted hover:text-text'}`}
          >
            <Sparkles className="w-4 h-4" />
            AI Blueprint Generator
          </button>
          <button 
            onClick={() => setActiveTab('lab')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'lab' ? 'bg-surface text-accent shadow-sm border border-border' : 'text-muted hover:text-text'}`}
          >
            <Layers className="w-4 h-4" />
            Section Optimizer Lab
          </button>
          <button 
            onClick={() => setActiveTab('extension')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'extension' ? 'bg-surface text-accent shadow-sm border border-border' : 'text-muted hover:text-text'}`}
          >
            <Code className="w-4 h-4" />
            Chrome Extension (Mock API)
          </button>
        </div>
      </header>

      {/* SUCCESS ALERTS & TOASTS */}
      {copiedField && (
        <div className="fixed bottom-6 right-6 bg-accent text-bg px-4 py-3 rounded-xl border border-accent/30 shadow-2xl flex items-center gap-2.5 z-50 text-xs font-bold uppercase tracking-wider animate-bounce">
          <CheckCircle2 className="w-4.5 h-4.5 text-bg" />
          <span>Success: Copied {copiedField} to clipboard</span>
        </div>
      )}

      {/* TAB 1: AI BLUEPRINT GENERATOR */}
      {activeTab === 'blueprint' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="tab-blueprint">
          {/* Configurations Left Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="card space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/80">
                <Target className="w-5 h-5 text-accent" />
                <h3 className="font-display font-bold text-base text-text">SEO Target Parameters</h3>
              </div>

              <div className="space-y-1">
                <label className="text-3xs font-black uppercase text-muted tracking-widest block">Core Professional Focus / Industry</label>
                <input 
                  type="text" 
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="input w-full"
                  placeholder="e.g. SaaS Product Marketing Management"
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs font-black uppercase text-muted tracking-widest block font-bold">Target Audience / Profile Goal</label>
                <textarea 
                  rows={3} 
                  value={focusGoal} 
                  onChange={(e) => setFocusGoal(e.target.value)}
                  className="input w-full resize-none"
                  placeholder="e.g. Attract series-A startup founders looking for advisors"
                />
              </div>

              <button
                onClick={handleGenerateFullBlueprint}
                disabled={isGeneratingBlueprint}
                className="btn-primary w-full py-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {isGeneratingBlueprint ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    Assembling Blueprint...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5 text-bg fill-current" />
                    Generate Complete Profile Blueprint
                  </>
                )}
              </button>

              {blueprintError && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{blueprintError}</span>
                </div>
              )}
            </div>

            {/* Current Metadata Card */}
            <div className="card space-y-4">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-muted">Synchronized Tables</h4>
              <div className="space-y-2 text-3xs font-mono">
                <div className="flex items-center justify-between p-2.5 bg-bg border border-border/60 rounded">
                  <span className="text-muted">TABLE: users</span>
                  <span className="text-emerald-400 font-bold">Connected ✓</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-bg border border-border/60 rounded">
                  <span className="text-muted">TABLE: profile_blueprints</span>
                  <span className="text-emerald-400 font-bold">Connected ✓</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-bg border border-border/60 rounded">
                  <span className="text-muted">TABLE: linkedin_brand_scores</span>
                  <span className="text-emerald-400 font-bold">Connected ✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Comparison View */}
          <div className="lg:col-span-8 space-y-6">
            {!blueprintResult ? (
              <div className="card h-[430px] flex flex-col items-center justify-center text-center text-muted">
                <div className="w-16 h-16 rounded-full bg-surface2 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 opacity-20 text-accent animate-pulse" />
                </div>
                <h3 className="text-lg font-display font-extrabold text-text mb-1">Generate Your Complete LinkedIn Blueprint</h3>
                <p className="max-w-md text-xs leading-relaxed text-muted px-4">
                  Using state-of-the-art NLP models, Narratiq compiles optimized Headline suggestions, rich narrative summaries, targeted skills tags, and graphic background banner taglines in one unified roadmap.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* 1. SUGGESTED HEADLINE CARD */}
                <div className="card space-y-4 border border-accent/20">
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-accent bg-accent/10 border border-accent/20 text-accent text-3xs px-2.5 py-0.5 uppercase font-bold tracking-widest">Section 1</span>
                      <h4 className="font-display font-black text-sm text-text">Suggested Headline Optimization</h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => triggerCopy(blueprintResult.suggestedHeadline, "Headline")}
                        className="p-1.5 hover:bg-surface2 rounded text-muted hover:text-text transition-colors flex items-center gap-1 text-2xs font-extrabold"
                        title="Copy Suggested Headline"
                      >
                        <Copy className="w-3.5 h-3.5" /> One-Click Copy
                      </button>
                      <button
                        onClick={() => handleApplyHeadline(blueprintResult.suggestedHeadline)}
                        className={`text-2xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${headlineSavedState ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-accent/15 hover:bg-accent/25 text-accent border border-accent/20'}`}
                      >
                        {headlineSavedState ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Applied to DB
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" /> Apply Optimized Headline
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-bg/40 p-4 border border-border/60 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted">Current Headline</span>
                      <p className="text-xs text-text italic">
                        {user.headline || "No custom headline established yet. Default: Professional Account."}
                      </p>
                    </div>
                    <div className="bg-accent/5 p-4 border border-accent/20 rounded-xl space-y-1 shadow-inner relative overflow-hidden">
                      <div className="absolute top-1 right-2 w-12 h-12 bg-accent/5 rounded-full blur flex items-center justify-center font-mono font-black text-[9px] text-accent">AI</div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-accent">Recommended Headline</span>
                      <p className="text-xs text-text font-medium leading-relaxed">
                        {blueprintResult.suggestedHeadline}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. SUGGESTED ABOUT SECTION */}
                <div className="card space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-accent bg-accent/10 border border-accent/20 text-accent text-3xs px-2.5 py-0.5 uppercase font-bold tracking-widest">Section 2</span>
                      <h4 className="font-display font-black text-sm text-text">Suggested About Section / Summary</h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => triggerCopy(blueprintResult.suggestedAbout, "About Narrative")}
                        className="p-1.5 hover:bg-surface2 rounded text-muted hover:text-text transition-colors flex items-center gap-1 text-2xs font-extrabold"
                        title="Copy Suggested About Section"
                      >
                        <Copy className="w-3.5 h-3.5" /> One-Click Copy
                      </button>
                      <button
                        onClick={() => handleApplyAbout(blueprintResult.suggestedAbout)}
                        className={`text-2xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${aboutSavedState ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-accent/15 hover:bg-accent/25 text-accent border border-accent/20'}`}
                      >
                        {aboutSavedState ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Applied to DB
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" /> Apply Optimized About
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-bg/40 p-4 border border-border/60 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted">Current Narrative</span>
                      <p className="text-xs text-text whitespace-pre-wrap italic leading-relaxed">
                        {user.about || "No customized profile description or about section recorded in users database table."}
                      </p>
                    </div>
                    <div className="bg-accent/5 p-4 border border-accent/20 rounded-xl space-y-1 relative shadow-inner">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-accent">Recommended Narrative Summary</span>
                      <p className="text-xs text-text font-medium leading-relaxed whitespace-pre-wrap">
                        {blueprintResult.suggestedAbout}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. SUGGESTED FEATURED SKILLS & BANNER */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* FEATURED KEYWORD SKILLS */}
                  <div className="card space-y-4">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="badge bg-gold/10 border border-gold/20 text-gold text-3xs px-2 py-0.5 uppercase font-bold tracking-widest">Section 3</span>
                        <h4 className="font-display font-bold text-xs text-text">Suggested Featured Skills</h4>
                      </div>
                      <button 
                        onClick={() => triggerCopy(blueprintResult.suggestedSkills.join(", "), "Skills")}
                        className="p-1 hover:bg-surface2 rounded text-muted transition-colors opacity-80 hover:opacity-100"
                        title="Copy Skills list"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <p className="text-3xs text-muted leading-relaxed uppercase font-bold tracking-wider">Embed these core semantic keywords inside your experience bullets and dedicated skills category:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {blueprintResult.suggestedSkills.map((sk, index) => (
                          <span key={index} className="px-2.5 py-1 rounded-md bg-surface2 border border-border/80 text-text font-mono text-[10px] flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-gold" />
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* BANNER TAGLINE */}
                  <div className="card space-y-4">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="badge bg-purple-500/10 border border-purple-500/20 text-purple-400 text-3xs px-2 py-0.5 uppercase font-bold tracking-widest">Section 4</span>
                        <h4 className="font-display font-bold text-xs text-text">Suggested Banner Text Tagline</h4>
                      </div>
                      <button 
                        onClick={() => triggerCopy(blueprintResult.suggestedBanner, "Banner Tagline")}
                        className="p-1 hover:bg-surface2 rounded text-muted transition-colors opacity-80 hover:opacity-100"
                        title="Copy Banner tagline"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <p className="text-3xs text-muted leading-relaxed uppercase font-bold tracking-wider">Place this copy overlay statement on top of your personalized graphic header asset:</p>
                      <div className="p-4 bg-purple-500/5 border border-purple-500/15 rounded-xl flex items-center justify-center text-center font-display font-extrabold text-sm tracking-tight text-white/95 relative overflow-hidden h-24">
                        <div className="absolute top-0 right-0 left-0 bottom-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-bg/40 to-bg pointer-events-none" />
                        "{blueprintResult.suggestedBanner}"
                      </div>
                    </div>
                  </div>
                </div>

                {/* HELP BANNER */}
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl flex items-start gap-4">
                  <div className="p-2.5 bg-accent/15 rounded-xl text-accent flex-shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-xs text-text">How to update?</h5>
                    <p className="text-2xs text-muted leading-relaxed">
                      Simply click <strong className="text-accent font-medium">Apply Optimized</strong> inputs above to auto-save to the Narratiq servers or click <strong className="text-accent font-medium">One-Click Copy</strong> to easily paste inside your live LinkedIn settings modal manually. To fully automate this, view the <strong className="text-accent font-medium">Chrome Extension (Mock API)</strong> tab above.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ORIGINAL SECTION LAB OPTIMIZER */}
      {activeTab === 'lab' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="tab-lab">
          {/* Form Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex gap-1.5 p-1 bg-surface2 rounded-xl w-full border border-border/80">
              {[
                { id: 'headline', label: 'Headline', icon: Target },
                { id: 'about', label: 'About / Summary', icon: Sparkles },
                { id: 'experience', label: 'Experience Desk', icon: Zap }
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id as any);
                    setLabResult(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg text-3xs font-bold uppercase tracking-wider transition-all ${activeSection === section.id ? 'bg-surface text-accent shadow-sm border border-border' : 'text-muted hover:text-text'}`}
                >
                  <section.icon className="w-3.5 h-3.5" />
                  {section.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleOptimizeSection} className="card space-y-6">
              <div className="space-y-2">
                <label className="text-3xs font-black uppercase text-muted tracking-widest block">Current {activeSection} Content</label>
                <textarea 
                  rows={8}
                  placeholder={`Paste your current ${activeSection} here...`}
                  value={labFormData.content} 
                  onChange={e => setLabFormData({...labFormData, content: e.target.value})}
                  className="input w-full resize-none text-xs" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-3xs font-black uppercase text-muted tracking-widest block">Additional Context / SEO Target Keyphrase</label>
                <textarea 
                  rows={3}
                  placeholder="What's your primary goal? (e.g. 'Establish high authority in Web3 venture deals')"
                  value={labFormData.context} 
                  onChange={e => setLabFormData({...labFormData, context: e.target.value})}
                  className="input w-full resize-none text-xs" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isOptimizing}
                className="btn-primary w-full py-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {isOptimizing ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4.5 h-4.5 text-bg fill-current" />
                    <span>Optimize Section</span>
                  </>
                )}
              </button>
            </form>

            {labError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{labError}</span>
              </div>
            )}
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!labResult ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card h-[480px] flex flex-col items-center justify-center text-center text-muted"
                >
                  <div className="w-16 h-16 rounded-full bg-surface2 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 opacity-25 text-accent" />
                  </div>
                  <h3 className="text-base font-display font-extrabold text-text mb-1">Algorithmic Laboratory Drafts</h3>
                  <p className="max-w-xs text-xs text-muted leading-relaxed">Specify target keywords and hit optimize to parse metrics, SEO updates, and key structural improvement steps here.</p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="card space-y-5">
                    <div className="flex justify-between items-center pb-3 border-b border-border">
                      <h3 className="font-display font-black text-sm uppercase tracking-widest text-text">Optimized {activeSection} Result</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-black text-muted uppercase tracking-wider">SEO Relevance Score</span>
                          <span className="text-lg font-mono font-black text-accent">{labResult.seoScore}/100</span>
                        </div>
                        <button 
                          onClick={() => triggerCopy(labResult.optimized, `Optimized ${activeSection}`)} 
                          className="p-2 hover:bg-surface2 rounded-lg text-muted hover:text-text transition-all" 
                          title="Copy optimized text"
                        >
                          <Copy className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-5 bg-accent/5 border border-accent/20 rounded-xl text-xs text-text leading-relaxed whitespace-pre-wrap font-medium">
                      {labResult.optimized}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider block">Critical Refinements Applied</span>
                        <ul className="space-y-2">
                          {labResult.keyImprovements.map((imp, i) => (
                            <li key={i} className="text-3xs text-muted flex gap-2 line-clamp-2">
                              <span className="text-accent font-bold">•</span> {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider block">Indexed Search Keywords</span>
                        <div className="flex flex-wrap gap-1">
                          {labResult.keywordsAdded.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-[9px] font-bold">{kw}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card bg-gold/5 border-gold/15 flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-gold flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-gold text-xs">SEO Visibility Index Uplift</h4>
                      <p className="text-3xs text-muted leading-relaxed mt-0.5">By embedding search intent directly in your profile section, search rankings are anticipated to expand by +42% over competitor indices.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* TAB 3: CHROME EXTENSION INSTRUCTIONS & SIMULATOR */}
      {activeTab === 'extension' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in" id="tab-extension">
          
          {/* Instructions and code column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="card space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/80">
                <Code className="w-5 h-5 text-accent" />
                <h3 className="font-display font-bold text-base text-text">Narratiq Companion Chrome Extension API</h3>
              </div>

              <p className="text-xs text-muted leading-relaxed">
                Connect and auto-synchronize layout changes directly within the browser tab. By creating a folder locally with the following two records and importing it into <strong className="text-text font-mono text-3xs">chrome://extensions</strong>, you can instantly populate LinkedIn fields with zero copy-pasting required!
              </p>

              {/* Manifest json instructions */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-black tracking-widest text-muted">1. manifest.json</span>
                  <button 
                    onClick={() => triggerCopy(extensionManifestJson, "manifest.json")}
                    className="p-1 px-2.5 rounded bg-zinc-800 text-gold text-3xs font-bold inline-flex items-center gap-1 hover:bg-zinc-700 transition"
                  >
                    <Copy className="w-3 h-3" /> Copy Code
                  </button>
                </div>
                <pre className="p-3 bg-zinc-950 font-mono text-[9px] rounded-lg text-cyan-400 overflow-x-auto border border-white/5 max-h-48 leading-relaxed">
                  {extensionManifestJson}
                </pre>
              </div>

              {/* Content.js instructions */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-black tracking-widest text-muted">2. content.js (DOM Injector)</span>
                  <button 
                    onClick={() => triggerCopy(extensionContentJs, "content.js")}
                    className="p-1 px-2.5 rounded bg-zinc-800 text-gold text-3xs font-bold inline-flex items-center gap-1 hover:bg-zinc-700 transition"
                  >
                    <Copy className="w-3 h-3" /> Copy Code
                  </button>
                </div>
                <pre className="p-3 bg-zinc-950 font-mono text-[9px] rounded-lg text-emerald-400 overflow-x-auto border border-white/5 max-h-56 leading-relaxed">
                  {extensionContentJs}
                </pre>
              </div>

              <div className="bg-bg border border-border/60 p-4 rounded-xl text-[10px] text-muted space-y-1">
                <span className="font-black text-text uppercase tracking-wider block">⚡ Quick Setup Guide:</span>
                <ol className="list-decimal pl-4 space-y-1.5">
                  <li>Create a new directory named <strong className="text-text">narratiq-extension</strong> on your laptop.</li>
                  <li>Copy the codes above into <strong className="text-text">manifest.json</strong> and <strong className="text-text font-mono">content.js</strong> files respectively inside that folder.</li>
                  <li>In Google Chrome / Edge, load the dashboard: <strong className="text-text">chrome://extensions/</strong></li>
                  <li>Enable <em className="text-gold font-medium">Developer Mode</em> on the top right click bar.</li>
                  <li>Click <strong className="text-text">Load Unpacked</strong> and select your extension directory folder.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Simulated Playground Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="card space-y-5 border border-purple-500/20 relative overflow-hidden bg-zinc-950/25">
              
              <div className="absolute top-0 right-0 p-3 bg-purple-500/10 text-purple-400 border-b border-l border-purple-500/20 font-mono text-[9px] uppercase font-bold tracking-widest rounded-bl-xl">
                Live Simulator
              </div>

              <div className="space-y-1.5">
                <h4 className="font-display font-black text-sm text-text">Verify Integration Playground</h4>
                <p className="text-3xs text-muted uppercase tracking-wider font-extrabold">Simulates target DOM injection behavior of your Google Chrome companion tool.</p>
              </div>

              {/* Browser bar preview */}
              <div className="border border-border/80 rounded-xl overflow-hidden bg-[#1E1E1E]">
                {/* Header bar mimicking linkedin */}
                <div className="bg-zinc-800 p-2.5 px-4 flex items-center gap-2 border-b border-border/80">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex-1 bg-zinc-900 border border-white/5 rounded px-3 py-1 text-[9px] text-[#A6A6A6] font-mono select-none flex items-center justify-between">
                    <span>https://www.linkedin.com/in/{user.name.toLowerCase().replace(/\s+/g,"-")}/edit</span>
                    <ExternalLink className="w-3 h-3 text-muted/60" />
                  </div>
                </div>

                {/* Simulated Webpage Content */}
                <div className="p-5 text-left text-xs text-text space-y-4 font-sans max-h-96 overflow-y-auto bg-zinc-900">
                  <div className="p-3 bg-zinc-950/80 border border-purple-500/20 rounded-xl flex items-center justify-between flex-wrap gap-2 animate-pulse">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-purple-400 block tracking-widest">Companion Active Plugin detected</span>
                      <p className="text-[10px] text-muted-foreground font-mono">Host: Narratiq Cloud Interface Endpoint</p>
                    </div>
                    {blueprintResult ? (
                      <button
                        onClick={triggerExtensionSimulation}
                        disabled={isSimulatingInject}
                        className="py-1 px-3 rounded-lg text-3xs font-extrabold uppercase bg-purple-600 hover:bg-purple-700 text-white cursor-pointer transition flex items-center gap-1.5"
                      >
                        {isSimulatingInject ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" /> Inserting...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3 h-3 text-white animate-spin" />
                            Apply with Narratiq
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-3xs text-rose-400">Generate a profile blueprint in Tab 1 to test simulation!</span>
                    )}
                  </div>

                  {/* Steps loader */}
                  {isSimulatingInject && simStep && (
                    <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg text-purple-300 font-mono text-[9px] flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{simStep}</span>
                    </div>
                  )}

                  {simFinished && (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-emerald-400 font-mono text-[9px] flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Auto-injection completely filled! Click LinkedIn Save button to submit.</span>
                    </div>
                  )}

                  {/* LinkedIn Profile Edit Modal Mockup */}
                  <div className="p-4 bg-[#1b1f23] rounded-xl border border-white/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="font-bold text-xs uppercase text-[#cccccc] tracking-wide">Edit introduction</span>
                      <span className="text-muted/50 text-[10px]">Saved draft</span>
                    </div>

                    {/* Mock Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#A6A6A6]">Full Name</label>
                      <input 
                        type="text" 
                        value={user.name} 
                        readOnly 
                        className="w-full bg-[#24292e] border border-white/10 p-2.5 rounded text-xs outline-none text-white/50" 
                      />
                    </div>

                    {/* Mock Headline */}
                    <div className="space-y-1 relative">
                      <label className="text-[10px] text-[#A6A6A6]">Headline (Suggested)</label>
                      <textarea 
                        rows={2}
                        value={simHeadline}
                        onChange={(e) => setSimHeadline(e.target.value)}
                        className={`w-full bg-[#24292e] border p-2.5 rounded text-xs outline-none text-white transition-all ${simFinished ? 'border-emerald-500/40 bg-emerald-500/5 shadow-inner' : 'border-white/10'}`} 
                      />
                    </div>

                    {/* Mock About */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#A6A6A6]">About Summary (Suggested)</label>
                      <textarea 
                        rows={4}
                        value={simAbout}
                        onChange={(e) => setSimAbout(e.target.value)}
                        className={`w-full bg-[#24292e] border p-2.5 rounded text-xs outline-none text-white transition-all ${simFinished ? 'border-emerald-500/40 bg-emerald-500/5 shadow-inner' : 'border-white/10'}`} 
                      />
                    </div>

                    {/* Mock Skills */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-[#A6A6A6] block">Injected Skills Keywords</label>
                      {simSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {simSkills.map((sk, idx) => (
                            <span key={idx} className="bg-[#2f363d] px-2 py-0.5 rounded text-[10px] font-mono text-[#cccccc] flex items-center gap-1 border border-white/5">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                              {sk}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] italic text-[#666666] block">No skills tags applied yet.</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
