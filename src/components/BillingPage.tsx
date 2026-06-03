import React, { useState } from "react";
import { CreditCard, Calendar, BarChart3, ChevronRight, CornerDownRight, ShieldCheck, Zap, AlertCircle, ShoppingBag, Trash } from "lucide-react";

interface BillingPageProps {
  user: { id: string; name: string; email: string };
  subscription: {
    plan: string;
    status: string;
    payment_status: string;
    plan_expiry: number | null;
    profile_analyses_used: number;
    posts_generated_used: number;
    roadmaps_generated_used: number;
  } | null;
  onNavigate: (view: any) => void;
  onRefreshSubscription: () => void;
}

export default function BillingPage({ user, subscription, onNavigate, onRefreshSubscription }: BillingPageProps) {
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const plan = subscription?.plan || "free";
  const planNameFormatted = plan.toUpperCase();
  const isPremium = plan !== "free";

  // Calculate usage limit based on plan
  const limits = {
    free: { analyses: 5, posts: 10, roadmaps: 2 },
    creator: { analyses: 20, posts: 100, roadmaps: 10 },
    pro: { analyses: Infinity, posts: Infinity, roadmaps: Infinity },
    agency: { analyses: Infinity, posts: Infinity, roadmaps: Infinity }
  }[plan] || { analyses: 5, posts: 10, roadmaps: 2 };

  const formatLimit = (used: number, limit: number) => {
    if (limit === Infinity) return `${used} / Unlimited`;
    return `${used} / ${limit}`;
  };

  const getPercentage = (used: number, limit: number) => {
    if (limit === Infinity) return 100;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const formatExpiry = (timestamp: number | null) => {
    if (!timestamp) return "Lifetime Free Access";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your premium subscription? This will immediately downgrade your account to the Free tier and re-apply credit limit gates.")) {
      return;
    }

    setCancelling(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/subscription/${user.id}/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "free" })
      });

      if (res.ok) {
        setMessage({ text: "Subscription successfully cancelled. Your account has been reverted to the Free plan.", type: "success" });
        onRefreshSubscription();
      } else {
        throw new Error("Cancellation request was rejected by subscription engine.");
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to cancel subscription.", type: "error" });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto pb-20 animate-fade-in" id="billing-desk">
      <div>
        <span className="badge badge-accent px-3 py-1 text-xs font-bold uppercase tracking-widest bg-accent/15 border border-accent/20">billing panel</span>
        <h2 className="text-3xl font-display font-extrabold tracking-tight mt-1 text-text">Account Billing & Usage Controls</h2>
        <p className="text-muted text-sm text-balance">Monitor real-time credits consumption, renewals schedule, and manage billing orders securely.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold max-w-2xl ${
          message.type === "success" 
            ? "bg-success/15 text-success border border-success/20" 
            : "bg-danger/15 text-danger border border-danger/20"
        }`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Plan card summary */}
        <div className="card p-6 bg-surface border border-border flex flex-col justify-between h-fit lg:col-span-1 space-y-6 shadow-md">
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-bold text-muted">Active Subscription</h3>
            
            <div className="space-y-1.5">
              <span className={`inline-flex px-2.5 py-0.5 text-xs font-extrabold rounded-full uppercase tracking-wider ${
                plan === 'free' 
                  ? 'bg-muted/10 text-muted border border-muted/20' 
                  : plan === 'pro' 
                    ? 'bg-accent/15 text-accent border border-accent/25' 
                    : plan === 'creator'
                      ? 'bg-accent2/15 text-accent2 border border-accent2/25'
                      : 'bg-gold/15 text-gold border border-gold/25'
              }`}>
                {planNameFormatted} Member
              </span>
              <div className="text-4xl font-extrabold text-text">
                {plan === "free" ? "₹0" : plan === "creator" ? "₹299" : plan === "pro" ? "₹499" : "₹2999"}
                <span className="text-xs text-muted font-normal"> / month</span>
              </div>
            </div>

            <div className="border-t border-border/80 pt-4 space-y-3">
              <div className="flex items-center gap-3 text-xs text-muted">
                <Calendar className="w-4 h-4 text-accent" />
                <div className="space-y-0.5">
                  <div className="font-bold text-text">Plan Renewal Date</div>
                  <div className="font-mono">{formatExpiry(subscription?.plan_expiry || null)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted">
                <ShieldCheck className="w-4 h-4 text-success" />
                <div className="space-y-0.5">
                  <div className="font-bold text-text">Billing Status</div>
                  <div className="capitalize">{subscription?.status || "active"} ({subscription?.payment_status || "unpaid"})</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <button
              onClick={() => onNavigate("pricing")}
              className="btn w-full bg-accent hover:bg-accent/80 text-white font-bold py-2.5 text-xs flex items-center justify-center gap-1.5 shadow-md shadow-accent/10"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              Upgrade or Change Plan
            </button>

            {isPremium && (
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="btn-secondary w-full border border-danger/20 text-danger hover:bg-danger/5 font-bold py-2.5 text-xs flex items-center justify-center gap-1.5"
              >
                <Trash className="w-3.5 h-3.5" />
                {cancelling ? "Processing..." : "Cancel Subscription"}
              </button>
            )}
          </div>
        </div>

        {/* Console credit meters */}
        <div className="card p-6 bg-surface border border-border lg:col-span-2 space-y-6 shadow-md">
          <h3 className="text-xs uppercase tracking-widest font-bold text-muted flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            Workspace Credits Consumption
          </h3>

          <div className="space-y-6">
            {/* Profile Analyses usage */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-text block">Profile Analyses Converted</span>
                  <span className="text-muted">Brutally honest feedback optimizations generated.</span>
                </div>
                <span className="font-mono font-bold text-text text-sm">
                  {formatLimit(subscription?.profile_analyses_used || 0, limits.analyses)}
                </span>
              </div>
              <div className="w-full h-3 bg-surface2 rounded-full overflow-hidden border border-border/50">
                <div
                  className="bg-accent h-full rounded-full transition-all duration-500 shadow-inner"
                  style={{ width: `${getPercentage(subscription?.profile_analyses_used || 0, limits.analyses)}%` }}
                />
              </div>
            </div>

            {/* AI Generated posts */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-text block">AI LinkedIn Posts Generated</span>
                  <span className="text-muted">Dynamic templates generated via modern @google/genai SDK.</span>
                </div>
                <span className="font-mono font-bold text-text text-sm">
                  {formatLimit(subscription?.posts_generated_used || 0, limits.posts)}
                </span>
              </div>
              <div className="w-full h-3 bg-surface2 rounded-full overflow-hidden border border-border/50">
                <div
                  className="bg-accent2 h-full rounded-full transition-all duration-500 shadow-inner"
                  style={{ width: `${getPercentage(subscription?.posts_generated_used || 0, limits.posts)}%` }}
                />
              </div>
            </div>

            {/* Roadmaps generated */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-text block">30-Day Roadmaps Built</span>
                  <span className="text-muted">Comprehensive LinkedIn target roadmap campaigns structured.</span>
                </div>
                <span className="font-mono font-bold text-text text-sm">
                  {formatLimit(subscription?.roadmaps_generated_used || 0, limits.roadmaps)}
                </span>
              </div>
              <div className="w-full h-3 bg-surface2 rounded-full overflow-hidden border border-border/50">
                <div
                  className="bg-gold h-full rounded-full transition-all duration-500 shadow-inner"
                  style={{ width: `${getPercentage(subscription?.roadmaps_generated_used || 0, limits.roadmaps)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-accent/5 p-4 rounded-xl border border-accent/20 flex gap-3 text-xs items-center text-muted">
            <ShoppingBag className="w-5 h-5 text-accent flex-shrink-0" />
            <div>
              <span className="font-bold text-text block">Premium Fair Usage Clause</span>
              Professional tier plans enjoy unlimited creation counters. Unlimited volume is designed for single-account execution to guard computational endpoints.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
