import React, { useState } from "react";
import { 
  Sparkles, 
  Zap, 
  RefreshCw, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  TrendingUp, 
  MessageSquare, 
  Heart, 
  Repeat, 
  ChevronRight,
  BarChart3,
  Target,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { generatePost, scorePost, type PostGeneration, type PostScore } from "../services/gemini";

type User = { id: string; name: string; email: string; picture?: string; headline?: string; about?: string };

interface PostRewriterProps {
  user: User;
}

interface RewrittenVariant {
  content: string;
  score: PostScore;
  tone: string;
}

export default function PostRewriter({ user }: PostRewriterProps) {
  const [originalContent, setOriginalContent] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [variants, setVariants] = useState<RewrittenVariant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeVariant, setActiveVariant] = useState(0);

  const handleRewrite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalContent) return;
    setIsRewriting(true);
    setError(null);
    setVariants([]);

    try {
      // We'll generate 3 variants with different tones
      const tones = ["Thought Leader", "Storyteller", "Data-Driven"];
      const newVariants: RewrittenVariant[] = [];

      for (const tone of tones) {
        const prompt = `Rewrite this LinkedIn post to be more viral and impactful. 
        Tone: ${tone}
        Original Content: ${originalContent}
        
        Return this exact JSON shape:
        {
          "post": "the full rewritten post content",
          "hook": "the hook",
          "viralityScore": 85,
          "viralityReason": "...",
          "bestPostingTime": "...",
          "hashtags": ["tag1", "tag2"],
          "engagementPrediction": { "likes": "...", "comments": "...", "reposts": "..." },
          "variations": []
        }`;

        const genData = await generatePost({ topic: tone, postType: "Rewrite", tone, context: originalContent, targetAudience: "LinkedIn Professionals" }, user.id);
        const scoreData = await scorePost(genData.post);

        newVariants.push({
          content: genData.post,
          score: scoreData,
          tone
        });
      }

      setVariants(newVariants);
      setActiveVariant(0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRewriting(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in">
      <header>
        <h2 className="text-3xl font-display font-extrabold tracking-tight mb-2">Post Rewriter</h2>
        <p className="text-muted">Paste any existing post and get 3 AI-optimized variants with virality scores.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleRewrite} className="card space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-widest">Original Post Content</label>
              <textarea 
                rows={12}
                placeholder="Paste your post here..."
                value={originalContent} 
                onChange={e => setOriginalContent(e.target.value)}
                className="input w-full resize-none" 
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={isRewriting || !originalContent}
              className="btn-primary w-full py-4"
            >
              {isRewriting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Generate 3 Variants
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="card bg-accent/5 border-accent/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="font-bold text-accent mb-1">AI Optimization Tip</h4>
                <p className="text-sm text-muted leading-relaxed">The rewriter focuses on strengthening your hook, improving readability, and adding emotional resonance while maintaining your core message.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {variants.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card h-[600px] flex flex-col items-center justify-center text-center text-muted"
              >
                <div className="w-20 h-20 rounded-full bg-surface2 flex items-center justify-center mb-6">
                  <RefreshCw className="w-10 h-10 opacity-20" />
                </div>
                <h3 className="text-xl font-display font-bold text-text mb-2">Ready to optimize?</h3>
                <p className="max-w-xs">Paste your original content to see the AI-optimized variants.</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Variant Tabs */}
                <div className="flex bg-surface2 p-1 rounded-xl border border-border">
                  {variants.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveVariant(i)}
                      className={`flex-1 flex flex-col items-center justify-center py-3 rounded-lg transition-all ${activeVariant === i ? 'bg-surface text-text shadow-sm border border-border' : 'text-muted hover:text-text'}`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Variant {i+1}</span>
                      <span className="text-sm font-bold">{v.tone}</span>
                    </button>
                  ))}
                </div>

                {/* Active Variant Content */}
                <div className="card space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="tag tag-purple">{variants[activeVariant].tone}</div>
                      <div className="text-xs font-bold text-muted uppercase tracking-widest">Optimization Complete</div>
                    </div>
                    <button 
                      onClick={() => handleCopy(variants[activeVariant].content)}
                      className="p-2 hover:bg-surface2 rounded-lg text-muted transition-all"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 bg-surface2 border border-border rounded-xl text-text leading-relaxed whitespace-pre-wrap font-sans">
                    {variants[activeVariant].content}
                  </div>

                  {/* Scores Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl text-center">
                      <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Virality</div>
                      <div className="text-2xl font-display font-bold text-accent">{variants[activeVariant].score.viralityScore}</div>
                    </div>
                    <div className="p-4 bg-accent2/5 border border-accent2/20 rounded-xl text-center">
                      <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Hook</div>
                      <div className="text-2xl font-display font-bold text-accent2">{variants[activeVariant].score.hookStrength}</div>
                    </div>
                    <div className="p-4 bg-success/5 border border-success/20 rounded-xl text-center">
                      <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Readability</div>
                      <div className="text-2xl font-display font-bold text-success">{variants[activeVariant].score.readabilityScore}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-surface2 border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-4 h-4 text-accent" />
                      <span className="text-xs font-bold uppercase tracking-widest">AI Verdict</span>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">{variants[activeVariant].score.verdict}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Branding Footer */}
      <footer className="pt-12 border-t border-border flex flex-col items-center text-center">
        <div className="text-sm text-muted mb-2">
          © 2026 Narratiq · Built by <span className="text-text font-bold">Aviral Bakshi</span>
        </div>
        <div className="text-xs text-muted italic">
          Empowering {user.headline ? `${user.headline.split(' at ')[0].split(' in ')[0].split('|')[0].trim()} specialists` : "ambitious professionals"} with AI-driven growth.
        </div>
      </footer>
    </div>
  );
}
