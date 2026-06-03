import React, { useState, useEffect } from "react";
import { Check, Flame, Star, ShieldAlert, Sparkles, AlertCircle, Zap } from "lucide-react";

interface PricingPageProps {
  user: { id: string; name: string; email: string };
  currentPlan: string;
  onUpgradeSuccess: () => void;
}

export default function PricingPage({ user, currentPlan, onUpgradeSuccess }: PricingPageProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Perfect for exploring LinkedIn growth capabilities.",
      features: [
        "5 Profile Analyses",
        "10 AI Generated Posts",
        "2 Roadmap Constructions",
        "LinkedIn Basic Optimization Feedback",
        "Real-time Content Stats"
      ],
      cta: "Current Plan",
      popular: false,
      color: "border-border"
    },
    {
      id: "creator",
      name: "Creator",
      price: "₹299",
      period: "month",
      description: "Ideal for active freelancers & creators building personal brand.",
      features: [
        "20 Profile Analyses / mo",
        "100 AI Generated Posts / mo",
        "10 Roadmap Constructions / mo",
        "Full SEO Keyword Optimizer",
        "Standard Analytics Indicators"
      ],
      cta: "Upgrade to Creator",
      popular: false,
      color: "border-border hover:border-accent2/40"
    },
    {
      id: "pro",
      name: "Pro Growth",
      price: "₹499",
      originalPrice: "₹999",
      period: "month",
      description: "Unlimited tools tailored for top-tier professionals.",
      features: [
        "Unlimited Profile Analyses",
        "Unlimited AI Post Gen",
        "Unlimited 30-Day Roadmaps",
        "Advanced Virality Scores",
        "Full Analytics Dashboard Access",
        "24/7 Priority Support Desk"
      ],
      cta: "Go Pro (Unlimited)",
      popular: true,
      color: "border-accent ring-2 ring-accent/30 bg-accent/5"
    },
    {
      id: "agency",
      name: "Growth Agency",
      price: "₹2999",
      period: "month",
      description: "For marketing agencies managing multiple executive profiles.",
      features: [
        "Everything in Pro",
        "Team seat allocation",
        "API Integration Credentials",
        "Dedicated Content Consultant",
        "Custom PDF Report Branding"
      ],
      cta: "Scale with Agency",
      popular: false,
      color: "border-border hover:border-gold/40"
    }
  ];

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (planId: string) => {
    setLoadingPlan(planId);
    setMessage(null);
    try {
      if (planId === "free") {
        const orderRes = await fetch("/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId, userId: user.id })
        });
        if (orderRes.ok) {
          onUpgradeSuccess();
          setMessage("Successfully switched back to Free plan.");
          setTimeout(() => setMessage(null), 3500);
        } else {
          throw new Error("Failed to switch plan on server");
        }
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay Checkout SDK failed to load. Please check your network.");
      }

      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, userId: user.id })
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.error || "Failed to initiate payment transaction.");
      }

      const orderData = await orderRes.json();

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Narratiq Premium",
        description: `Upgrade to ${planId.toUpperCase()} membership plan`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          setLoadingPlan(planId);
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.id,
                planId
              })
            });

            if (verifyRes.ok) {
              onUpgradeSuccess();
              setMessage(`Welcome to Premium! Successfully upgraded to ${planId.toUpperCase()}!`);
              setTimeout(() => setMessage(null), 4000);
            } else {
              const errData = await verifyRes.json();
              throw new Error(errData.error || "Subscription activation failed.");
            }
          } catch (vErr: any) {
            setMessage(`Payment verification error: ${vErr.message}`);
          } finally {
            setLoadingPlan(null);
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: "#4f46e5"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setMessage(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (e: any) {
      setMessage(`Unable to checkout: ${e.message}`);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto pb-20 animate-fade-in" id="pricing-page">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="badge badge-accent px-3 py-1 text-xs font-bold uppercase tracking-widest bg-accent/15 border border-accent/20">Pricing Plans</span>
        <h2 className="text-4xl font-display font-extrabold tracking-tight text-text">
          Maximize Revenue with Better Enforcement
        </h2>
        <p className="text-muted text-sm leading-relaxed">
          Upgrade your plan to unlock unlimited growth strategies, unlimited posts generation, and instant feedback.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold max-w-lg mx-auto ${message.includes("Error") ? "bg-danger/10 text-danger border border-danger/20" : "bg-success/10 text-success border border-success/20"}`}>
          <Zap className="w-5 h-5 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch pt-6">
        {plans.map((p) => {
          const isCurrent = currentPlan.toLowerCase() === p.id.toLowerCase();
          return (
            <div 
              key={p.id} 
              className={`card p-8 flex flex-col justify-between border relative transition-all duration-300 ${p.color} ${p.popular ? "shadow-xl shadow-accent/5 scale-[1.02]" : "shadow-md bg-surface"}`}
            >
              {p.popular && (
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-accent text-white px-4 py-1 text-xs font-extrabold rounded-full flex items-center gap-1 shadow-lg shadow-accent/20">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>MOST POPULAR</span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-xl font-bold mb-1 text-text">{p.name}</h3>
                  <p className="text-xs text-muted leading-tight h-10">{p.description}</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-text">{p.price}</span>
                  {p.originalPrice && (
                    <span className="text-base text-muted line-through">{p.originalPrice}</span>
                  )}
                  <span className="text-xs text-muted">/{p.period}</span>
                </div>

                <ul className="space-y-3.5 border-t border-border pt-6">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-text/90">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${p.popular ? "text-accent" : "text-success"}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => handleUpgrade(p.id)}
                  disabled={loadingPlan !== null || isCurrent}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all ${
                    isCurrent 
                      ? "bg-surface2 text-muted border border-border cursor-default" 
                      : p.popular 
                        ? "bg-accent text-white hover:bg-accent/80 shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95" 
                        : "bg-surface2 text-text border border-border hover:bg-surface3 hover:scale-[1.02] active:scale-95"
                  }`}
                >
                  {loadingPlan === p.id ? "Processing..." : isCurrent ? "Active Plan" : p.cta}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card max-w-3xl mx-auto p-6 flex flex-col sm:flex-row items-center gap-4 border border-accent/20 bg-accent/5 mt-8">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="flex-grow space-y-1 text-center sm:text-left">
          <h4 className="font-bold text-sm">Need a Custom Enterprise Tier?</h4>
          <p className="text-xs text-muted">We offer tailored feature limits, dedicated team workspace integration, and full CRM synching for larger marketing budgets.</p>
        </div>
        <button className="btn-secondary whitespace-nowrap text-xs border border-border py-2 px-4 shadow-sm">Contact Workspace Support</button>
      </div>
    </div>
  );
}
