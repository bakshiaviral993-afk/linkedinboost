import React, { useState, useEffect } from "react";
import { Users, CreditCard, Layers, TrendingUp, BarChart3, Settings, ShieldAlert, Sparkles, UserCheck, RefreshCw } from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  freeUsers: number;
  creatorUsers: number;
  proUsers: number;
  agencyUsers: number;
  postsGenerated: number;
  analysesGenerated: number;
  mrr: number;
}

interface FounderAnalyticsProps {
  user: { id: string; name: string };
  currentPlan: string;
  onPlanChanged: () => void;
}

export default function FounderAnalytics({ user, currentPlan, onPlanChanged }: FounderAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/founder-analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error("Founder Analytics load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [currentPlan]);

  const handleDevUpgrade = async (plan: string) => {
    setUpdatingUser(true);
    try {
      const res = await fetch(`/api/subscription/${user.id}/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      if (res.ok) {
        onPlanChanged();
        await fetchAnalytics();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingUser(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <RefreshCw className="w-8 h-8 text-accent animate-spin" />
          <p className="text-muted text-sm">Quantifying growth index metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto pb-20 animate-fade-in" id="founder-analytics-dashboard">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="badge badge-accent px-3 py-1 text-xs font-bold uppercase tracking-widest bg-accent/15 border border-accent/20">Executive Analytics</span>
          <h2 className="text-3xl font-display font-extrabold tracking-tight mt-1 text-text">Founder MRR & Metrics Desk</h2>
          <p className="text-muted text-sm">Monitor workspace growth indicators, conversion funnels, and real-time MRR.</p>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="btn-secondary py-2 px-4 text-xs font-bold border border-border flex items-center gap-2 hover:bg-surface2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Recompute Metrics
        </button>
      </div>

      {analytics && (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6 border-l-4 border-l-accent flex items-center justify-between shadow-md">
              <div className="space-y-1">
                <span className="text-xs uppercase font-extrabold text-muted">Total Workspace Users</span>
                <div className="text-3xl font-extrabold text-text">{analytics.totalUsers}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="card p-6 border-l-4 border-l-success flex items-center justify-between shadow-md">
              <div className="space-y-1">
                <span className="text-xs uppercase font-extrabold text-muted">Monthly Recurring Revenue</span>
                <div className="text-3xl font-extrabold text-success">₹{analytics.mrr.toLocaleString()}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>

            <div className="card p-6 border-l-4 border-l-accent2 flex items-center justify-between shadow-md">
              <div className="space-y-1">
                <span className="text-xs uppercase font-extrabold text-muted">Posts Generated</span>
                <div className="text-3xl font-extrabold text-text">{analytics.postsGenerated}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent2/10 flex items-center justify-center text-accent2">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="card p-6 border-l-4 border-l-gold flex items-center justify-between shadow-md">
              <div className="space-y-1">
                <span className="text-xs uppercase font-extrabold text-muted">Analyses Conducted</span>
                <div className="text-3xl font-extrabold text-text">{analytics.analysesGenerated}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Conversion Breakdown */}
            <div className="card p-6 space-y-6 lg:col-span-2">
              <h3 className="font-display text-lg font-bold">Subscription Plan Demographics</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span>FREE USERBASE ({analytics.freeUsers} Users)</span>
                    <span className="text-muted">
                      {analytics.totalUsers > 0 ? Math.round((analytics.freeUsers / analytics.totalUsers) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-surface2 rounded-full overflow-hidden">
                    <div 
                      className="bg-muted h-full transition-all duration-500" 
                      style={{ width: `${analytics.totalUsers > 0 ? (analytics.freeUsers / analytics.totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span>CREATOR PLAN ({analytics.creatorUsers} Users — ₹299/mo)</span>
                    <span className="text-accent2">
                      {analytics.totalUsers > 0 ? Math.round((analytics.creatorUsers / analytics.totalUsers) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-surface2 rounded-full overflow-hidden">
                    <div 
                      className="bg-accent2 h-full transition-all duration-500" 
                      style={{ width: `${analytics.totalUsers > 0 ? (analytics.creatorUsers / analytics.totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span>PRO PLAN ({analytics.proUsers} Users — ₹499/mo)</span>
                    <span className="text-accent">
                      {analytics.totalUsers > 0 ? Math.round((analytics.proUsers / analytics.totalUsers) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-surface2 rounded-full overflow-hidden">
                    <div 
                      className="bg-accent h-full transition-all duration-500" 
                      style={{ width: `${analytics.totalUsers > 0 ? (analytics.proUsers / analytics.totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span>AGENCY PLAN ({analytics.agencyUsers} Users — ₹2999/mo)</span>
                    <span className="text-gold">
                      {analytics.totalUsers > 0 ? Math.round((analytics.agencyUsers / analytics.totalUsers) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-surface2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gold h-full transition-all duration-500" 
                      style={{ width: `${analytics.totalUsers > 0 ? (analytics.agencyUsers / analytics.totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border text-center">
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-extrabold text-muted">Free</div>
                  <div className="text-lg font-bold">{analytics.freeUsers}</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-extrabold text-muted">Creator</div>
                  <div className="text-lg font-bold text-accent2">{analytics.creatorUsers}</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-extrabold text-muted">Pro Growth</div>
                  <div className="text-lg font-bold text-accent">{analytics.proUsers}</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-extrabold text-muted">Agency</div>
                  <div className="text-lg font-bold text-gold">{analytics.agencyUsers}</div>
                </div>
              </div>
            </div>

            {/* Admin Play Desk */}
            <div className="card p-6 bg-surface/40 hover:bg-surface/60 transition-colors flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-accent">
                  <Settings className="w-5 h-5" />
                  <h3 className="font-display text-lg font-bold text-text">Workspace Sandbox Desk</h3>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  As an app developer/admin, change your current plan model with one click to observe dynamic MRR recalculation, billing counters, and limits enforcement live below.
                </p>
              </div>

              <div className="space-y-3 bg-surface2 border border-border p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-muted uppercase">My Identity:</span>
                  <span className="text-xs text-text font-semibold">{user.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-muted uppercase">Current Active Plan:</span>
                  <span className="badge badge-accent bg-accent/15 border border-accent/20 px-2 py-0.5 text-[10px] uppercase font-bold">{currentPlan}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] uppercase font-extrabold text-muted mb-1">Set Play Account Level to:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDevUpgrade("free")}
                    disabled={updatingUser}
                    className="btn-secondary py-2 text-xs font-bold border hover:border-border scale-95 hover:scale-100 transition-transform active:scale-95"
                  >
                    Set to Free
                  </button>
                  <button
                    onClick={() => handleDevUpgrade("creator")}
                    disabled={updatingUser}
                    className="btn-secondary py-2 text-xs font-semibold text-accent2 border hover:border-accent2/30 scale-95 hover:scale-100 transition-transform active:scale-95"
                  >
                    Set to Creator
                  </button>
                  <button
                    onClick={() => handleDevUpgrade("pro")}
                    disabled={updatingUser}
                    className="btn-secondary py-2 text-xs font-semibold text-accent border hover:border-accent/40 scale-95 hover:scale-100 transition-transform active:scale-95"
                  >
                    Set to Pro
                  </button>
                  <button
                    onClick={() => handleDevUpgrade("agency")}
                    disabled={updatingUser}
                    className="btn-secondary py-2 text-xs font-semibold text-gold border hover:border-gold/30 scale-95 hover:scale-100 transition-transform active:scale-95"
                  >
                    Set to Agency
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Strategy note */}
      <div className="card p-6 border border-border flex flex-col sm:flex-row items-center gap-4 bg-surface h-full">
        <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success flex-shrink-0">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-display font-semibold text-sm">Monthly Growth Insight Desk</h4>
          <p className="text-xs text-muted leading-relaxed">Your free-to-premium conversion rate sits at <strong>{analytics && analytics.totalUsers > 0 ? Math.round(((analytics.creatorUsers + analytics.proUsers + analytics.agencyUsers) / analytics.totalUsers) * 100) : 0}%</strong>. The dynamic gating module prevents unlimited Gemini usage, protecting margins and aligning client subscription fees with COGS metrics dynamically.</p>
        </div>
      </div>
    </div>
  );
}
