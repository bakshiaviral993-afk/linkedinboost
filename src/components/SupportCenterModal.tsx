import React, { useState } from "react";
import { 
  X, 
  Search, 
  HelpCircle, 
  Mail, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  LifeBuoy,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SupportCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userId?: string;
}

const FAQS = [
  {
    category: "General",
    question: "What is Narratiq?",
    answer: "Narratiq is an advanced LinkedIn personal branding copilot that audits your profile, analyzes SEO optimization, lists growth recommendations, and generates high-verisimilitude, algorithm-friendly posts designed to scale your executive voice."
  },
  {
    category: "Profile Audit",
    question: "How does the LinkedIn Brand Score get calculated?",
    answer: "Your Brand Score is calculated across 4 key vectors: structural profile completeness, descriptive headline CTA hooks, qualitative search terminology density, and engagement-readiness. The analysis identifies immediate bottlenecks and growth gaps."
  },
  {
    category: "Post Generator",
    question: "Are the generated posts original and plagiarism-free?",
    answer: "Yes, every post draft is generated on-demand by utilizing advanced neural engines trained on elite executive copy frameworks. There are no static templates; each copy reflects your chosen story parameters."
  },
  {
    category: "Technical",
    question: "How often should I run a Profile Audit?",
    answer: "We recommend running a new Profile Audit once every 14 or 30 days to measure your updated bio performance, check keyword indexing improvements, and generate a fresh monthly roadmap."
  },
  {
    category: "Billing",
    question: "Can I cancel my Narratiq subscription anytime?",
    answer: "Absolutely. You can manage or cancel your active subscription and track credit usage inside the Billing & Usage view anytime without any penalty fees or support delays."
  }
];

export default function SupportCenterModal({ isOpen, onClose, userEmail = "", userId = "guest" }: SupportCenterModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [email, setEmail] = useState(userEmail);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ["all", "General", "Profile Audit", "Post Generator", "Technical", "Billing"];

  const filteredFaqs = FAQS.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !subject || !message) {
      setSubmitError("Please fill out all fields.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email, subject, message })
      });

      if (response.ok) {
        setSubmitSuccess("Ticket successfully submitted! Our support team will get back to you shortly.");
        setSubject("");
        setMessage("");
      } else {
        const data = await response.json();
        setSubmitError(data.error || "Failed to submit ticket. Please try again.");
      }
    } catch (err) {
      setSubmitError("Network error. Please verify your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        className="relative bg-surface border border-border w-full max-w-4xl h-[90vh] md:h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header banner */}
        <div className="p-6 border-b border-border bg-surface2/30 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent border border-accent/20">
              <LifeBuoy className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">Support Center</h2>
              <p className="text-xs text-muted">Get assistance and browse answers to popular platform questions.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface2 text-muted hover:text-text transition-colors border border-transparent hover:border-border"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Panels */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12">
          
          {/* FAQ Column (7 cols) */}
          <div className="md:col-span-7 p-6 border-b md:border-b-0 md:border-r border-border space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Frequently Asked Questions
              </h3>
              
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Query key terms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>

              {/* Categorization tabs */}
              <div className="flex flex-wrap gap-1 pt-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider rounded uppercase border transition-all ${
                      selectedCategory === cat
                        ? "bg-accent/15 text-accent border-accent/30 font-extrabold"
                        : "bg-surface2 text-muted border-border hover:text-text"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion representation / List */}
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 bg-surface2/40 border border-border/80 rounded-xl space-y-1.5 hover:border-muted/30 transition-all"
                  >
                    <div className="flex items-start gap-2.5">
                      <HelpCircle className="w-4.5 h-4.5 text-[#a78bfa] shrink-0 mt-0.5" />
                      <h4 className="text-xs font-semibold text-text leading-tight">
                        {faq.question}
                      </h4>
                    </div>
                    <p className="text-[11px] text-muted leading-relaxed pl-7">
                      {faq.answer}
                    </p>
                    <span className="text-[9px] font-mono uppercase bg-surface border border-border text-muted px-1.5 py-0.5 rounded inline-block mt-2">
                      {faq.category}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted text-xs font-mono">
                  No matching platform FAQs found.
                </div>
              )}
            </div>
          </div>

          {/* Ticket Form Column (5 cols) */}
          <div className="md:col-span-5 p-6 space-y-4 bg-surface2/15 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-[#22d3ee] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Submit Support Ticket
                </h3>
                <p className="text-xs text-muted mt-1 leading-normal">
                  Can't find your answer? Let our support engineering desk assist you. Tickets are monitored 24/7.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="label text-[10px] uppercase font-bold tracking-wider text-muted">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="input text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="label text-[10px] uppercase font-bold tracking-wider text-muted">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Account upgrades, credit issue"
                    className="input text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="label text-[10px] uppercase font-bold tracking-wider text-muted">Your Message</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="List specific descriptive issues..."
                    className="input text-xs resize-none"
                    required
                  />
                </div>

                {submitError && (
                  <div className="p-3 bg-danger/5 border border-danger/10 text-[11px] text-danger rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                {submitSuccess && (
                  <div className="p-3 bg-success/5 border border-success/10 text-[11px] text-success rounded-lg flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{submitSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full text-xs font-bold py-2.5 flex items-center justify-center gap-1.5 uppercase font-mono tracking-wider"
                >
                  {isSubmitting ? "Submitting Request..." : "Send Ticket"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-border mt-auto flex items-center justify-between text-[10px] text-muted">
              <span className="font-mono">Priority Desk</span>
              <span className="text-success font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-success rounded-full" />
                Active Support Call
              </span>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
