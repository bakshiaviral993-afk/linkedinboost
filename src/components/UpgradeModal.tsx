import React, { useState } from "react";
import { Zap, Check, Sparkles, X, ShieldCheck } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  userId: string;
  onUpgradeSuccess: () => void;
}

export default function UpgradeModal({ isOpen, onClose, reason, userId, onUpgradeSuccess }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/subscription/${userId}/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }) // upgrades to Pro
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onUpgradeSuccess();
          setSuccess(false);
          onClose();
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="card max-w-lg w-full p-8 border border-accent/30 relative shadow-2xl bg-surface animate-scale-up" id="upgrade-modal">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-text p-1 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {!success ? (
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <Zap className="w-6 h-6 fill-current animate-pulse" />
            </div>

            <div>
              <h3 className="font-display text-2xl font-extrabold tracking-tight mb-2 text-text">
                Upgrade to Premium
              </h3>
              <p className="text-sm text-muted">
                {reason || "You've reached your free action limit. Get unlimited access today."}
              </p>
            </div>

            <div className="space-y-3 bg-surface2/50 p-4 rounded-2xl border border-border">
              <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-1">
                Unlock with Pro:
              </h4>
              <ul className="space-y-2 text-sm text-text/90">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent flex-shrink-0" />
                  <span><strong>Unlimited</strong> Profile Analyses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent flex-shrink-0" />
                  <span><strong>Unlimited</strong> AI Post Generations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent flex-shrink-0" />
                  <span><strong>Unlimited</strong> 30-Day Content Strategies</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent flex-shrink-0" />
                  <span>Advanced LinkedIn growth Insights</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between bg-accent/10 border border-accent/20 p-4 rounded-xl">
              <div>
                <span className="text-xs uppercase font-extrabold text-accent block">PRO PLAN</span>
                <span className="text-xl font-extrabold text-accent">₹499<span className="text-xs font-normal text-muted">/month</span></span>
              </div>
              <span className="text-xs text-muted font-medium bg-surface px-3 py-1 rounded-full border border-border">
                Beta Launch Offer
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="btn w-full py-3 flex items-center justify-center gap-2 text-base font-bold bg-accent hover:bg-accent/80 text-white"
              >
                {loading ? "Processing..." : "Upgrade Now"}
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="btn-secondary w-full py-3 text-base text-muted hover:text-text border border-border"
              >
                Keep Free Plan
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h3 className="font-display text-3xl font-extrabold tracking-tight">
              Upgrade Successful!
            </h3>
            <p className="text-muted max-w-xs mx-auto text-sm">
              Welcome to <strong>Pro Membership</strong>. Enjoy unlimited growth tools with Narratiq!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
