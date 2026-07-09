import React from "react";
import { 
  X, 
  Scale, 
  BookOpen, 
  AlertTriangle, 
  Sparkles, 
  Key, 
  HelpCircle
} from "lucide-react";
import { motion } from "motion/react";

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsOfServiceModal({ isOpen, onClose }: TermsOfServiceModalProps) {
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
            <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-gold border border-gold/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">Terms of Use</h2>
              <p className="text-xs text-muted">Last updated: June 5, 2026 · Platform Standard Operating Rules</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface2 text-muted hover:text-text transition-colors border border-transparent hover:border-border"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="p-4 bg-gold/5 border border-gold/10 rounded-xl text-xs text-muted leading-relaxed flex gap-3">
            <AlertTriangle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-text block mb-1">Fair Utilization Guideline</span>
              By creating a Narratiq account, you accept these terms. Automated scraping, abuse of generated token endpoints, or attempts to crash local SQLite instances are strictly prohibited.
            </div>
          </div>

          <div className="space-y-4 text-xs text-muted leading-relaxed">
            
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                <span className="p-1 rounded bg-[#a78bfa]/15 text-[#a78bfa] font-mono text-[10px]">1</span>
                Description of Service
              </h3>
              <p>
                Narratiq is designed for professional branding execution. The features provided are: profile audits, LinkedIn brand scores, quantitative campaign roadmaps, keyword optimization indexes, and AI-assisted text rewrite editors. Any additional unrequested functionality is excluded.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                <span className="p-1 rounded bg-accent2/15 text-accent2 font-mono text-[10px]">2</span>
                Credits & Account Allotment
              </h3>
              <p>
                Platform credits, subscription usage levels, and audit counts are bound strictly to your registered user ID. Free plans carry periodic quotas which can be expanded through active plan purchase. We hold final authority on regulating, capping, or resetting temporary account rates.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                <span className="p-1 rounded bg-success/15 text-success font-mono text-[10px]">3</span>
                Intellectual Property & Output Ownership
              </h3>
              <p>
                You retain complete, unrestrained intellectual ownership over any text content, posts, headlines, and outlines generated under your profile. Narratiq makes no claim of ownership or royalty rights over materials published by you onto outer social channels.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                <span className="p-1 rounded bg-gold/15 text-gold font-mono text-[10px]">4</span>
                Disclaimer of Warranties
              </h3>
              <p>
                Narratiq provides all analytics, suggestions, and scores "as-is" without warranty of any kind. AI models process contextual indications and may produce errors; the user is ultimately responsible for validating final text or suggestions prior to social broadcasting.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                <span className="p-1 rounded bg-danger/15 text-danger font-mono text-[10px]">5</span>
                Limitations of Liability
              </h3>
              <p>
                In no situation will Narratiq or its providers be liable for indirect, incidental, or consequential damages (including, but not limited to, loss of data, profile shadowbanning, algorithm reach suppression, or business interruptions) arising out of standard site usage.
              </p>
            </section>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface2/30 flex justify-between items-center text-[10px] text-muted shrink-0">
          <span className="font-mono">Jurisdiction compliance: Global Digital Act</span>
          <button 
            onClick={onClose}
            className="btn-secondary py-1 px-3 text-[10px]"
          >
            Agree to Terms
          </button>
        </div>
      </motion.div>
    </div>
  );
}
