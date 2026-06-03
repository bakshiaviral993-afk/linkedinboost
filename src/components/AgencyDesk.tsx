import React, { useState, useEffect } from "react";
import { 
  Users, 
  Plus, 
  Trash2, 
  Loader2, 
  Briefcase, 
  Layers, 
  ShieldAlert, 
  Sparkles, 
  RefreshCw, 
  Download, 
  TrendingUp, 
  CheckCircle2, 
  FileText, 
  ExternalLink,
  Lock,
  Search,
  Check
} from "lucide-react";

type User = { id: string; name: string; email: string; picture?: string; headline?: string; about?: string };

interface AgencyDeskProps {
  user: User;
  currentPlan: string;
}

export default function AgencyDesk({ user, currentPlan }: AgencyDeskProps) {
  const isAgency = currentPlan === "agency";

  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);

  // New client form states
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientHeadline, setClientHeadline] = useState("");
  const [clientAbout, setClientAbout] = useState("");
  const [addingClient, setAddingClient] = useState(false);

  // Active viewed workspace client
  const [activeWorkspaceClient, setActiveWorkspaceClient] = useState<any | null>(null);
  const [workspacePosts, setWorkspacePosts] = useState<any[]>([]);

  // White label reports state
  const [showReportUrl, setShowReportUrl] = useState<string | null>(null);

  const fetchAgencySummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agency/workspaces/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (e: any) {
      setErrorMSG("Fail syncing agency status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAgency) {
      fetchAgencySummary();
    }
  }, [user.id, currentPlan]);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail) return;
    setAddingClient(true);
    setErrorMSG(null);
    try {
      const res = await fetch(`/api/agency/workspaces/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientEmail,
          headline: clientHeadline,
          about: clientAbout
        })
      });
      if (res.ok) {
        setClientName("");
        setClientEmail("");
        setClientHeadline("");
        setClientAbout("");
        await fetchAgencySummary();
      } else {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed adding workspace");
      }
    } catch (e: any) {
      setErrorMSG(e.message);
    } finally {
      setAddingClient(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("Are you sure you want to remove this client from your agency hub?")) return;
    try {
      const res = await fetch(`/api/agency/workspaces/${user.id}/${clientId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        if (activeWorkspaceClient?.id === clientId) {
          setActiveWorkspaceClient(null);
        }
        await fetchAgencySummary();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectWorkspace = async (client: any) => {
    setActiveWorkspaceClient(client);
    // Simulate loading client post workspace historical list
    setWorkspacePosts([
      { topic: "Scale SaaS", format: "Storytelling", status: "Published", viralityScore: 94 },
      { topic: "Venture Financing", format: "Listicle", status: "Scheduled", viralityScore: 88 }
    ]);
  };

  const downloadWhiteLabelReport = (client: any) => {
    const reportHtml = `
      NARRATIQ ENTERPRISE WHITE-LABEL INSIGHT REPORT
      Client Account: ${client.clientName} (${client.clientEmail})
      Brand Score: ${client.brandScore}/100
      Total Curriculum Calendars: ${client.calendarCount}
      Workflow Status: ${client.status}
      Generated Time: ${new Date().toLocaleDateString()}
    `;
    const blob = new Blob([reportHtml], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Report_${client.clientName.replace(/\s+/g, "_")}.txt`;
    link.click();
  };

  // If user is not on agency plan, show lock screen
  if (!isAgency) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 animate-fade-in text-center" id="agency-mode-locked">
        <div className="w-20 h-20 bg-gold/15 border-2 border-gold/30 rounded-3xl mx-auto flex items-center justify-center text-gold mb-6 animate-pulse">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-display font-black tracking-tight mb-2">Narratiq Enterprise Hub Mode</h2>
        <p className="text-muted text-sm max-w-lg mx-auto leading-relaxed mb-8">
          Unlock Agency Level Workspace systems to serve infinite client brands. This module incorporates White-Label report downloads, customized workspace rosters, and centralized authority dashboards.
        </p>

        <div className="bg-surface border border-gold/20 p-6 rounded-2xl max-w-sm mx-auto shadow-xl space-y-4">
          <span className="badge badge-accent bg-gold/15 border border-gold/20 text-gold text-2xs px-2.5 py-0.5 uppercase font-bold tracking-widest">Enterprise Access Required</span>
          <div className="space-y-1">
            <div className="text-2xl font-black text-text">₹2,999<span className="text-xs text-muted font-normal">/Month</span></div>
            <p className="text-3xs text-muted font-bold uppercase tracking-wider">Billed on modular usage cycles</p>
          </div>
          <p className="text-2xs text-muted leading-relaxed">
            Please navigate to the "Founder Desk" or "Pricing Plans" in the left navigation panel to mock-upgrade your credentials instantly to "Agency Level".
          </p>
        </div>
      </div>
    );
  }

  if (loading && !clients.length) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <RefreshCw className="w-8 h-8 text-accent animate-spin" />
          <p className="text-muted text-sm">Aggregating Agency rosters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in" id="agency-hub-desk">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="badge badge-accent px-3 py-1 text-xs font-bold uppercase tracking-widest bg-gold/15 border border-gold/20 text-gold">Agency Level Mode</span>
          <h2 className="text-3xl font-display font-black tracking-tight mt-1">Enterprise Clients Hub</h2>
          <p className="text-sm text-muted">Register corporate clients, audit distinct workspace scorecards, export white-label reports, and direct post-distribution pipelines.</p>
        </div>
      </header>

      {errorMSG && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{errorMSG}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ACTIVE CLIENTS INDEX */}
        <div className="lg:col-span-8 space-y-6">
          <div className="card space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border/80">
              <h3 className="font-display font-black text-lg text-text">Enterprise Workspace Roster</h3>
              <span className="text-3xs text-muted font-extrabold font-mono uppercase bg-surface2 px-2.5 py-1 rounded">
                Active Count: {clients.length} Clients
              </span>
            </div>

            {clients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse divide-y divide-border">
                  <thead>
                    <tr className="text-muted uppercase text-[10px] font-extrabold tracking-widest">
                      <th className="py-3 px-2">Client Brand</th>
                      <th className="py-3 px-2">Workflow Score</th>
                      <th className="py-3 px-2">Curriculum Limit</th>
                      <th className="py-3 px-2 text-right">Enterprise Scope</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/65">
                    {clients.map((client) => {
                      const isActiveWS = activeWorkspaceClient?.id === client.id;
                      return (
                        <tr 
                          key={client.id} 
                          className={`hover:bg-surface2/50 cursor-pointer transition-colors ${
                            isActiveWS ? "bg-accent/5 font-medium border-l-2 border-l-accent" : ""
                          }`}
                          onClick={() => handleSelectWorkspace(client)}
                        >
                          <td className="py-4 px-2">
                            <div className="font-semibold text-text leading-snug">{client.clientName}</div>
                            <div className="text-muted text-3xs">{client.clientEmail}</div>
                          </td>
                          <td className="py-4 px-2">
                            <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                              client.brandScore >= 80 ? "color-emerald bg-emerald-500/10 text-emerald-400" : "text-amber-400 bg-amber-500/10"
                            }`}>
                              Score: {client.brandScore}
                            </span>
                          </td>
                          <td className="py-4 px-2 font-mono text-muted text-2xs">
                            {client.calendarCount} Blueprints
                          </td>
                          <td className="py-4 px-2 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              title="Export White-Label Scorecard Report"
                              onClick={() => downloadWhiteLabelReport(client)}
                              className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-gold font-bold text-3xs border border-white/5 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3 h-3" /> Report
                            </button>
                            <button
                              title="View Access Point"
                              onClick={() => handleSelectWorkspace(client)}
                              className="px-2 py-1 rounded bg-accent/15 hover:bg-accent/25 text-accent font-bold text-3xs border border-accent/20 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3" /> Workspace
                            </button>
                            <button
                              title="Delete Account Workspace"
                              onClick={() => handleDeleteClient(client.id)}
                              className="p-1 text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-muted text-xs">
                Welcome to your Enterprise desk! Populate the form on the right side to establish client branding pipelines.
              </div>
            )}
          </div>

          {/* DYNAMIC WORKSPACE HUB SECTION */}
          {activeWorkspaceClient && (
            <div className="card space-y-6 animate-fade-in bg-zinc-950/20 text-left border border-accent/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
                <div>
                  <span className="badge badge-accent bg-accent/10 border border-accent/20 text-accent text-3xs px-2 py-0.5 uppercase tracking-widest font-black">ACTIVE WORKSPACE PIPELINE</span>
                  <h4 className="font-display font-black text-lg text-text mt-1">{activeWorkspaceClient.clientName}</h4>
                  <p className="text-3xs text-muted uppercase font-bold tracking-wider mt-0.5">{activeWorkspaceClient.clientEmail}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadWhiteLabelReport(activeWorkspaceClient)}
                    className="btn-secondary py-2 px-4 text-3xs font-extrabold uppercase tracking-widest hover:bg-surface2 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-gold" />
                    White-Label PDF/TXT Download
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="font-display font-bold text-xs text-muted uppercase tracking-widest border-l-2 border-l-gold pl-2">Client Brand Focus Pillars</h5>
                  <div className="bg-bg/40 p-4 border border-border/60 rounded-xl space-y-2">
                    <div>
                      <span className="text-[10px] text-muted font-bold block uppercase mb-1">Target Profile Headline:</span>
                      <p className="text-xs text-text">{activeWorkspaceClient.headline || "Enterprise Technology Strategy Catalyst"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted font-bold block uppercase mb-1">Company Value Narrative:</span>
                      <p className="text-xs text-muted leading-relaxed">{activeWorkspaceClient.about || "Empowering tech transitions with structural, secure data layers."}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="font-display font-bold text-xs text-muted uppercase tracking-widest border-l-2 border-l-accent pl-2">Target Workspace Drafts</h5>
                  <div className="space-y-2">
                    {workspacePosts.map((post, index) => (
                      <div key={index} className="p-3 bg-bg/40 border border-border/40 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-text font-bold text-xs">{post.topic}</span>
                          <span className="text-[10px] text-muted block">{post.format}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
                          Virality: {post.viralityScore}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: RECRUIT CLIENT FORM */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <form onSubmit={handleAddClient} className="card space-y-5 text-left">
            <h3 className="font-display font-black text-base text-text uppercase tracking-widest pb-2 border-b border-border flex items-center gap-2">
              <Plus className="w-4.5 h-4.5 text-accent" /> Register Client Account
            </h3>

            <div className="space-y-1">
              <label className="text-3xs font-black uppercase text-muted tracking-widest block">Client Name</label>
              <input 
                type="text" 
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enterprise client name..."
                required
                className="w-full bg-bg border border-border rounded-xl p-3 text-xs text-text outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-3xs font-black uppercase text-muted tracking-widest block">Client Email</label>
              <input 
                type="email" 
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@corporate.com"
                required
                className="w-full bg-bg border border-border rounded-xl p-3 text-xs text-text outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-3xs font-black uppercase text-muted tracking-widest block">Client Role Headline</label>
              <input 
                type="text" 
                value={clientHeadline}
                onChange={(e) => setClientHeadline(e.target.value)}
                placeholder="e.g. Founder & Chief Investment Officer"
                className="w-full bg-bg border border-border rounded-xl p-3 text-xs text-text outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-3xs font-black uppercase text-muted tracking-widest block">Value Statement / Brand Intent</label>
              <textarea 
                rows={3}
                value={clientAbout}
                onChange={(e) => setClientAbout(e.target.value)}
                placeholder="Core keywords and target market specifics..."
                className="w-full bg-bg border border-border rounded-xl p-3 text-xs text-text outline-none focus:border-accent resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={addingClient || !clientName || !clientEmail}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              {addingClient ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-bg fill-current" />
                  <span>Onboard Client Brand</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
