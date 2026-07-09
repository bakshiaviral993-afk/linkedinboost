import React from "react";
import { 
  X, 
  ShieldCheck, 
  Eye, 
  Database, 
  Locate, 
  Lock, 
  CheckCircle2, 
  Scale
} from "lucide-react";
import { motion } from "motion/react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-bg/85 backdrop-blur-md" 
        onClick={onClose}
      />

      {/* Content Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-surface border border-border w-full max-w-3xl h-[85vh] md:h-[75vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-border bg-surface2/30 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center text-success border border-success/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">Privacy Policy</h2>
              <p className="text-xs text-muted">Last updated: June 5, 2026 · Standard compliance draft</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface2 text-muted hover:text-text transition-colors border border-transparent hover:border-border"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="p-4 bg-success/5 border border-success/10 rounded-xl text-xs text-muted leading-relaxed flex gap-3">
            <Lock className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-text block mb-1">Our Core Commitment to Security</span>
              Narratiq prioritizes the preservation of your credentials and LinkedIn properties. All processing occurs secure-end-point server-side. We strictly never sell your content draft metadata or private analysis metrics to third-party data aggregators.
            </div>
          </div>

          <div className="space-y-4 text-xs text-muted leading-relaxed">
            
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                <span className="p-1 rounded bg-[#a78bfa]/15 text-[#a78bfa] font-mono text-[10px]">1</span>
                Information We Collect
              </h3>
              <p>
                To provide your customized LinkedIn audits, content recommendations, and brand roadmap models, we store:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Profile Metadata:</strong> Profile name, current headline, about summary, industry group, connections, and historical work metrics you supply during audits.</li>
                <li><strong>Account Credentials:</strong> Basic OAuth registration details, email address, password hashes (for local authentication), and subscription metadata fields.</li>
                <li><strong>Generative Assets:</strong> Custom generated post drafts, post edit archives, calendar scheduled posts, and historical virality predictions that you design inside the workrooms.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                <span className="p-1 rounded bg-accent2/15 text-accent2 font-mono text-[10px]">2</span>
                How We Process Your Data
              </h3>
              <p>
                Your data is parsed through modern neural engines (such as standard enterprise-grade Google Gemini models) server-side to generate intelligence logs safely. Because the keys are preserved on our isolated backends, your confidential attributes remain shielded.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                <span className="p-1 rounded bg-gold/15 text-gold font-mono text-[10px]">3</span>
                Dual-Storage Aggregation & Safety
              </h3>
              <p>
                Our platform utilizes synchronized, real-time dual-storage models where logs are backed up concurrently into a local high-performance SQLite engine and highly secured cloud tables (Supabase) in an encrypted structure.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                <span className="p-1 rounded bg-success/15 text-success font-mono text-[10px]">4</span>
                Your Rights & Data Access Control
              </h3>
              <p>
                You retain ultimate authority over your digital content footprints:
              </p>
              <ul className="list-none pl-0 space-y-1.5 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                  <span>Request absolute deletion of all your stored audits and post histories.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                  <span>Download a complete JSON export of your profile assessments.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                  <span>Update your registered information and credentials instantly.</span>
                </li>
              </ul>
            </section>

            <section className="space-y-2 pt-2 border-t border-border">
              <h3 className="text-xs font-semibold text-text">Contact Data Privacy Officer</h3>
              <p>
                If you have comments or inquiries regarding how we manage personal branding information or wish to execute a security audit, contact our compliance desk at <strong>security@narratiq.com</strong>.
              </p>
            </section>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface2/30 flex justify-between items-center text-[10px] text-muted shrink-0">
          <span className="font-mono">Security Code compliance: ISO-27001</span>
          <button 
            onClick={onClose}
            className="btn-secondary py-1 px-3 text-[10px]"
          >
            Acknowledge Privacy Terms
          </button>
        </div>
      </motion.div>
    </div>
  );
}
