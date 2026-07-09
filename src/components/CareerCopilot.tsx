import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  FileText, 
  Sparkles, 
  Check, 
  Copy, 
  RotateCcw, 
  DollarSign, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  ArrowRight,
  Sparkle,
  Bookmark,
  ChevronRight,
  Clipboard,
  ShieldAlert,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CareerCopilotProps {
  user: { id: string; name: string; email: string; headline?: string; about?: string };
}

interface CopilotReport {
  atsMatch: number;
  missingKeywords: string[];
  resumeRewrite: string;
  linkedinRewrite: string;
  coverLetter: string;
  interviewQuestions: { question: string; answerHook: string }[];
  salaryBenchmark: string;
  jobSearchPlan: { week: string; actions: string[] }[];
}

export default function CareerCopilot({ user }: CareerCopilotProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Input states
  const [resume, setResume] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [jobDesc, setJobDesc] = useState("");

  const [report, setReport] = useState<CopilotReport | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"ats" | "rewrites" | "assets" | "hacks">("ats");

  // Copy helpers
  const [copies, setCopies] = useState<{ [key: string]: boolean }>({});

  // Auto populate active profile details if available
  useEffect(() => {
    let combinedBio = "";
    if (user.headline) {
      combinedBio += `Headline: ${user.headline}\n`;
    }
    if (user.about) {
      combinedBio += `About Bio: ${user.about}`;
    }
    if (combinedBio.trim()) {
      setLinkedin(combinedBio.trim());
    }
  }, [user]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopies(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopies(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume.trim() || !jobDesc.trim()) {
      setError("Please paste both your Resume and the target Job Description to start scanning.");
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch("/api/copilot-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          resume: resume,
          linkedin: linkedin,
          jobDesc: jobDesc
        })
      });

      if (!res.ok) {
        throw new Error("Failed to process inputs. Please verify Gemini configuration.");
      }

      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during Copilot audit.");
    } finally {
      setLoading(false);
    }
  };

  const loadSampleJob = () => {
    setResume(`Milo Vance\nsenior.milo@example.com | 1-555-0199\n\nPROFESSIONAL SUMMARY\nVersatile Software developer with over 5 years writing applications. Specialized in Javascript and standard databases. Managed software deployment safely.\n\nEXPERIENCE\nSoftware Engineer, CloudLabs Inc\n2022 - Present\n- Worked on API endpoints using Node.js and Express.\n- Fixed database queries to speed up searches.\n- Responsible for server deployment checklists.\n\nSKILLS\nJavascript, React, Express, MongoDB, Node, basic git.`);
    
    setJobDesc(`Job Title: Senior Scaling Software Engineer\n\nCompany Description:\nNext-generation Fintech scaling multi-million dollar microservice systems that require deep optimization and high reliability.\n\nCore Deliverables:\n- Refactor large data environments (PostgreSQL/Redis) to clear performance overhead.\n- Collaborate on building highly robust and optimized server-side APIs.\n- Establish secure and highly-available CI/CD pipelines to guarantee 99.99% operational uptime.\n\nRequired Skills:\n- Advanced TypeScript/Node.js microservices experience.\n- Deep understanding of Relational Databases, PostgreSQL migrations and performance benchmarking.\n- Proven delivery of automated CI/CD infrastructures.`);
    
    setActiveSubTab("ats");
  };

  return (
    <div className="space-y-8 p-1 sm:p-2 max-w-6xl mx-auto" id="career-copilot-root">
      
      {/* Top Premium Heading Board */}
      <div className="border-b border-gray-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4" id="copilot-header">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-indigo-400 uppercase tracking-widest" id="copilot-pill">
            <Sparkle className="w-4.5 h-4.5 text-indigo-400 animate-spin" />
            AI Career Copilot Standalone
          </div>
          <h1 className="text-3xl font-sans font-semibold tracking-tight text-white mt-1" id="copilot-heading">
            AI-Driven Career Placement Copilot
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl" id="copilot-subtitle">
            Bridge the gap between your real-world achievements and high-paying roles through ATS calibration, automated resumes, tailored cover letters, and live salary hooks.
          </p>
        </div>
        
        <button
          type="button"
          onClick={loadSampleJob}
          className="self-start md:self-auto px-4 py-2 bg-gray-900 border border-gray-800 hover:border-indigo-500/30 text-xs font-mono text-gray-300 hover:text-white rounded-lg transition-all"
          id="btn-sample-sandbox"
        >
          Load Sandbox Match Sample 🧪
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-900/30 text-red-400 text-sm rounded-lg flex items-center gap-2" id="copilot-error-box">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Inputs Form Section */}
      {!report && (
        <form onSubmit={handleScan} className="grid grid-cols-1 md:grid-cols-12 gap-6" id="input-form">
          <div className="md:col-span-12" id="form-overview">
            <p className="text-xs text-gray-400">
              Provide your current assets and your target position description. The AI Career Copilot will optimize keyword densities, draft tailored resumes, and map interview secrets.
            </p>
          </div>

          {/* Left Inputs Block */}
          <div className="md:col-span-6 space-y-5 flex flex-col" id="resume-linkedin-fields">
            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5 flex items-center justify-between">
                <span>1. Paste your Resume ResumeText (Required)</span>
                <span className="text-[10px] text-gray-500 font-normal">Standard txt formatting</span>
              </label>
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Paste your resume here (e.g., Summary, Experience bullets, Skills, Education)..."
                required
                className="w-full flex-1 min-h-[180px] bg-black/40 border border-gray-800 focus:border-indigo-500/50 rounded-xl p-4 text-xs font-mono text-gray-300 outline-none transition-all scrollbar-thin resize-y"
                id="input-resume"
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5 flex items-center justify-between">
                <span>2. LinkedIn Profile / Brand Info (Optional)</span>
                <span className="text-[10px] text-emerald-400 font-normal">Auto-linked from bio</span>
              </label>
              <textarea
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="Include your current Headline, About bio summary or customized portfolio targets..."
                className="w-full h-24 bg-black/40 border border-gray-800 focus:border-indigo-500/50 rounded-xl p-4 text-xs font-mono text-gray-300 outline-none transition-all resize-y"
                id="input-linkedin"
              />
            </div>
          </div>

          {/* Right Inputs Block */}
          <div className="md:col-span-6 space-y-5 flex flex-col" id="job-desc-fields">
            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5 flex items-center justify-between">
                <span>3. Target Job Description (Required)</span>
                <span className="text-[10px] text-gray-500 font-normal">Copy from LinkedIn/Indeed</span>
              </label>
              <textarea
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Paste the target Job Title and complete requirements details here directly..."
                required
                className="w-full flex-1 min-h-[320px] bg-black/40 border border-gray-800 focus:border-indigo-500/50 rounded-xl p-4 text-xs font-mono text-gray-300 outline-none transition-all scrollbar-thin resize-y"
                id="input-jobdesc"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="md:col-span-12 pt-2" id="btn-container-scan">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/20 text-white font-sans font-medium text-sm tracking-tight rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-[0.99]"
              id="btn-trigger-scan"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  <span>Executing Career Calibrations & Recruiter Audits...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-white/10" />
                  <span>Launch AI Career Copilot Scan</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Output Report Section */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="copilot-report-panel">
          
          {/* Left Column: Index Tab Selector & Small Stats */}
          <div className="lg:col-span-4 space-y-6" id="report-indices">
            
            {/* Circular Gauge Card */}
            <div className="bg-gradient-to-b from-indigo-950/20 via-gray-900 to-black border border-gray-800 rounded-xl p-6 text-center space-y-4" id="report-gauge">
              <div className="text-xs font-mono uppercase tracking-widest text-indigo-400">Match Accuracy Evaluation</div>
              
              <div className="flex flex-col items-center justify-center py-2" id="gauge-display-box">
                <div className="text-5xl font-mono font-extrabold text-indigo-300 tracking-tight">
                  {report.atsMatch}%
                </div>
                <div className={`mt-2 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  report.atsMatch >= 80 ? "bg-emerald-950/20 text-emerald-400" : "bg-indigo-950/20 text-indigo-400"
                }`}>
                  {report.atsMatch >= 80 ? "Elite Position Fit" : "Optimize to clear 80% Threshold"}
                </div>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                The ATS optimization scanner analyzed relevant keyword intersection scores, responsibilities metrics alignment, and skill levels.
              </p>
            </div>

            {/* Sub Tabs Selector Menu */}
            <div className="border border-gray-800 rounded-xl p-3 flex flex-col gap-2 bg-gray-950/50" id="subtab-selector">
              <button
                onClick={() => setActiveSubTab("ats")}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-mono text-left flex items-center justify-between transition-all ${
                  activeSubTab === "ats" ? "bg-indigo-600 text-white" : "hover:bg-gray-900 text-gray-400 hover:text-white"
                }`}
                id="btn-subtab-ats"
              >
                <span>🚀 ATS keywords GAP</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveSubTab("rewrites")}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-mono text-left flex items-center justify-between transition-all ${
                  activeSubTab === "rewrites" ? "bg-indigo-600 text-white" : "hover:bg-gray-900 text-gray-400 hover:text-white"
                }`}
                id="btn-subtab-rewrites"
              >
                <span>✍️ Resume & LinkedIn Rewrite</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveSubTab("assets")}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-mono text-left flex items-center justify-between transition-all ${
                  activeSubTab === "assets" ? "bg-indigo-600 text-white" : "hover:bg-gray-900 text-gray-400 hover:text-white"
                }`}
                id="btn-subtab-assets"
              >
                <span>📬 Custom Cover Letter</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveSubTab("hacks")}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-mono text-left flex items-center justify-between transition-all ${
                  activeSubTab === "hacks" ? "bg-indigo-600 text-white" : "hover:bg-gray-900 text-gray-400 hover:text-white"
                }`}
                id="btn-subtab-hacks"
              >
                <span>💡 Negotiators & Interview Prep</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Back action */}
            <button
              onClick={() => setReport(null)}
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-mono text-gray-300 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center"
              id="btn-reset-copilot"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Scan Another Target Role
            </button>
          </div>

          {/* Right Column: Active Tab Content Area */}
          <div className="lg:col-span-8 space-y-6" id="report-viewing-board">
            
            {/* TAB 1: ATS Keywords Gap */}
            {activeSubTab === "ats" && (
              <div className="space-y-6 border border-gray-800 rounded-xl p-6" id="view-ats-gap">
                <div>
                  <h3 className="text-base font-sans font-medium text-white">Critical Missing Keywords</h3>
                  <p className="text-xs text-gray-400 mt-1">The employer search engines specifically query for these structures. Sprinkle these in your descriptions immediately.</p>
                </div>

                <div className="flex flex-wrap gap-2 py-2" id="keywords-cloud">
                  {report.missingKeywords && report.missingKeywords.map((item, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1.5 bg-red-950/10 border border-red-900/30 text-red-300 font-mono text-xs rounded-lg"
                      id={`tag-keyword-${idx}`}
                    >
                      {item}
                    </span>
                  ))}
                  {(!report.missingKeywords || report.missingKeywords.length === 0) && (
                    <div className="text-xs text-emerald-400">Perfect keyword alignment found! Zero gaps detected.</div>
                  )}
                </div>

                {/* 30-Day Job Search Roadmap */}
                <div className="border-t border-gray-800 pt-6 space-y-4" id="view-roadmap">
                  <div>
                    <h3 className="text-base font-sans font-medium text-white flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      30-Day Strategic Search Velocity Plan
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Structured weekly goals optimized for immediate recruiter contact.</p>
                  </div>

                  <div className="space-y-4" id="roadmap-weeks">
                    {report.jobSearchPlan && report.jobSearchPlan.map((weekItem, wIdx) => (
                      <div 
                        key={wIdx}
                        className="bg-gray-900/10 border border-gray-800/80 rounded-xl p-4 text-left"
                        id={`roadmap-week-box-${wIdx}`}
                      >
                        <div className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-widest">{weekItem.week}</div>
                        <ul className="mt-2 space-y-1.5 list-disc pl-4 text-xs text-gray-300" id={`roadmap-actions-list-${wIdx}`}>
                          {weekItem.actions.map((act, aIdx) => (
                            <li key={aIdx}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Resume & LinkedIn Rewrite */}
            {activeSubTab === "rewrites" && (
              <div className="space-y-6" id="view-rewrites">
                
                {/* Resume XYZ revisions */}
                <div className="border border-gray-800 rounded-xl p-6 space-y-3 relative bg-gray-900/5" id="resume-rewrites-box">
                  <div className="flex items-center justify-between" id="resume-rewrites-header">
                    <h4 className="text-sm font-sans font-medium text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      Resume XYZ Bullet-Points Reconstitution
                    </h4>
                    <button 
                      onClick={() => handleCopy(report.resumeRewrite, "resume")} 
                      className="text-xs font-mono text-indigo-400 hover:text-white flex items-center gap-1"
                      id="btn-copy-resume-rewrite"
                    >
                      {copies["resume"] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copies["resume"] ? "Copied" : "Copy Section"}</span>
                    </button>
                  </div>

                  <div className="bg-black/20 border border-gray-850 rounded-lg p-4 font-sans text-xs text-stone-300 leading-relaxed whitespace-pre-line" id="resume-rewrite-body">
                    {report.resumeRewrite}
                  </div>
                </div>

                {/* LinkedIn Headline & Bio */}
                <div className="border border-gray-800 rounded-xl p-6 space-y-3 relative bg-gray-900/5" id="linkedin-rewrites-box">
                  <div className="flex items-center justify-between" id="linkedin-rewrites-header">
                    <h4 className="text-sm font-sans font-medium text-white flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-indigo-400" />
                      LinkedIn Brand Deliverables (Title & About narrative)
                    </h4>
                    <button 
                      onClick={() => handleCopy(report.linkedinRewrite, "linkedin")} 
                      className="text-xs font-mono text-indigo-400 hover:text-white flex items-center gap-1"
                      id="btn-copy-linkedin-rewrite"
                    >
                      {copies["linkedin"] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copies["linkedin"] ? "Copied" : "Copy Section"}</span>
                    </button>
                  </div>

                  <div className="bg-black/20 border border-gray-850 rounded-lg p-4 font-sans text-xs text-stone-300 leading-relaxed whitespace-pre-line" id="linkedin-rewrite-body">
                    {report.linkedinRewrite}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Tailored Cover letter */}
            {activeSubTab === "assets" && (
              <div className="border border-gray-800 rounded-xl p-6 space-y-4" id="view-coverletter">
                <div className="flex items-center justify-between" id="coverletter-header">
                  <div>
                    <h3 className="text-base font-sans font-medium text-white">Custom Tailored Case Cover Letter</h3>
                    <p className="text-xs text-gray-400 mt-1">Ready-to-use cover letter custom crafted to highlight matching keyword achievements.</p>
                  </div>
                  <button 
                    onClick={() => handleCopy(report.coverLetter, "cover")} 
                    className="text-xs font-mono bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shrink-0"
                    id="btn-copy-cover"
                  >
                    {copies["cover"] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copies["cover"] ? "Copied Cover" : "Copy Cover"}</span>
                  </button>
                </div>

                <div className="bg-black/20 border border-gray-800 rounded-xl p-5 text-stone-300 text-xs font-serif leading-relaxed whitespace-pre-line" id="coverletter-body">
                  {report.coverLetter}
                </div>
              </div>
            )}

            {/* TAB 4: Salary negotiation secrets & Q&A mock */}
            {activeSubTab === "hacks" && (
              <div className="space-y-6" id="view-hacks">
                
                {/* Predicted Salary Index */}
                <div className="border border-gray-800 rounded-xl p-6 bg-gradient-to-r from-emerald-950/10 to-transparent space-y-4" id="salary-hacks-box">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase" id="salary-header-tag">
                    <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                    Strategic Compensation Benchmark Audit
                  </div>

                  <div className="font-sans text-xs text-stone-300 leading-relaxed whitespace-pre-line" id="salary-body">
                    {report.salaryBenchmark}
                  </div>
                </div>

                {/* Behavioral Questions Mappings */}
                <div className="border border-gray-800 rounded-xl p-6 space-y-4" id="qa-mock-box">
                  <div>
                    <h3 className="text-base font-sans font-medium text-white flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      Mock Behavioral Interview Answers Playbook
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Expected strategic line questions customized to the employer's expectations.</p>
                  </div>

                  <div className="space-y-3" id="mock-qa-list">
                    {report.interviewQuestions && report.interviewQuestions.map((qa, qi) => (
                      <div 
                        key={qi}
                        className="bg-black/20 border border-gray-850 rounded-xl p-4 text-left space-y-2"
                        id={`qa-item-${qi}`}
                      >
                        <div className="text-xs font-semibold text-indigo-300">Q: {qa.question}</div>
                        <div className="text-xs text-gray-300 bg-black/40 border border-gray-900 rounded p-2.5 leading-normal">
                          <strong className="text-emerald-400 text-[10px] font-mono block mb-1">STRATEGIC RESPONSE ANCHOR:</strong>
                          {qa.answerHook}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
