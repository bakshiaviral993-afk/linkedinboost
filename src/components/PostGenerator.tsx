import React, { useState } from "react";
import { TrendingUp, Sparkles, Send, Copy, CheckCircle2, AlertCircle, Loader2, BarChart3, Clock, Hash, MessageSquare, Repeat, Heart, Zap, ChevronRight, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type User = { id: string; name: string; email: string; picture?: string; headline?: string; about?: string };

interface PostGeneration {
  post: string;
  hook: string;
  viralityScore: number;
  viralityReason: string;
  bestPostingTime: string;
  hashtags: string[];
  engagementPrediction: { likes: string; comments: string; reposts: string };
  variations: string[];
}

interface PostScore {
  viralityScore: number;
  hookStrength: number;
  readabilityScore: number;
  valueScore: number;
  emotionalResonance: number;
  ctaStrength: number;
  verdict: string;
  topFix: string;
  improvedHook: string;
  predictedImpressions: string;
}

interface PostGeneratorProps {
  user: User;
}

export default function PostGenerator({ user }: PostGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [result, setResult] = useState<PostGeneration | null>(null);
  const [scoreResult, setScoreResult] = useState<PostScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const [formData, setFormData] = useState({
    topic: "",
    postType: "story",
    tone: "conversational",
    context: "",
    targetAudience: ""
  });

  const [isDemoMode, setIsDemoMode] = useState(false);
  const [editablePost, setEditablePost] = useState("");

  const postTypes = [
    { id: 'story', label: 'Storytelling' },
    { id: 'insight', label: 'Industry Insight' },
    { id: 'listicle', label: 'Value List' },
    { id: 'case-study', label: 'Case Study' },
    { id: 'hot-take', label: 'Hot Take' },
    { id: 'howto', label: 'How-To Guide' }
  ];

  const tones = ['Authoritative', 'Conversational', 'Vulnerable', 'Bold', 'Humorous', 'Inspiring'];

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.topic) return;
    setIsGenerating(true);
    setError(null);
    setScoreResult(null);
    setPublishSuccess(false);

    if (isDemoMode) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      const demoData: PostGeneration = {
        post: `🚀 Just had an incredible breakthrough in ${formData.topic}!\n\nAfter weeks of experimenting with different approaches, I finally found the "missing link" that makes everything click. \n\nHere's the 3-step framework I used:\n1️⃣ Audit your current workflow\n2️⃣ Identify the biggest bottleneck\n3️⃣ Implement automated feedback loops\n\nThe results? A 40% increase in efficiency and a much happier team.\n\nWhat's your biggest challenge with ${formData.topic} right now? Let's discuss in the comments! 👇\n\n#${formData.topic.replace(/\s+/g, '')} #GrowthMindset #Innovation`,
        hook: `🚀 Just had an incredible breakthrough in ${formData.topic}!`,
        viralityScore: 92,
        viralityReason: "Strong opening hook with social proof and a clear actionable framework.",
        bestPostingTime: "Tuesday 9:15 AM EST",
        hashtags: [`#${formData.topic.replace(/\s+/g, '')}`, "#GrowthMindset", "#Innovation"],
        engagementPrediction: { likes: "150-300", comments: "45-90", reposts: "12-25" },
        variations: [
          `Why most people fail at ${formData.topic} (and how to fix it)`,
          `The secret to mastering ${formData.topic} in 2024`
        ]
      };
      setResult(demoData);
      setEditablePost(demoData.post);
      setIsGenerating(false);
      return;
    }

    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...formData })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setEditablePost(data.post);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScorePost = async () => {
    setIsScoring(true);
    try {
      const res = await fetch("/api/score-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editablePost })
      });
      const data = await res.json();
      setScoreResult(data);
    } catch (err: any) {
      setError("Scoring failed");
    } finally {
      setIsScoring(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, content: editablePost })
      });
      const data = await res.json();
      if (data.success) {
        setPublishSuccess(true);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError("Publishing failed: " + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editablePost);
  };

  const useImprovedHook = () => {
    if (!scoreResult) return;
    const lines = editablePost.split('\n');
    lines[0] = scoreResult.improvedHook;
    setEditablePost(lines.join('\n'));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in">
      <header>
        <h2 className="text-3xl font-display font-extrabold tracking-tight mb-2">Viral Post Generator</h2>
        <p className="text-muted">Create high-impact content backed by LinkedIn algorithm intelligence.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <form onSubmit={handleGenerate} className="card space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-widest">Topic or Main Idea</label>
              <input 
                type="text" 
                placeholder="What is this post about?"
                value={formData.topic} 
                onChange={e => setFormData({...formData, topic: e.target.value})}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                className="input w-full" 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-widest">Post Type</label>
              <div className="grid grid-cols-2 gap-2">
                {postTypes.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({...formData, postType: type.id})}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${formData.postType === type.id ? 'bg-accent2/10 border-accent2 text-accent2 shadow-sm shadow-accent2/10' : 'bg-surface2 border-border text-muted hover:border-muted'}`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-widest">Tone of Voice</label>
              <div className="flex flex-wrap gap-2">
                {tones.map(tone => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setFormData({...formData, tone: tone.toLowerCase()})}
                    className={`px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all ${formData.tone === tone.toLowerCase() ? 'bg-accent/10 border-accent text-accent' : 'bg-surface2 border-border text-muted hover:border-muted'}`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-widest">Context / Details</label>
              <textarea 
                rows={3}
                placeholder="Any specific stories or data points to include?"
                value={formData.context} 
                onChange={e => setFormData({...formData, context: e.target.value})}
                className="input w-full resize-none" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-widest">Target Audience</label>
              <input 
                type="text" 
                placeholder="Who are you speaking to?"
                value={formData.targetAudience} 
                onChange={e => setFormData({...formData, targetAudience: e.target.value})}
                className="input w-full" 
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-surface2 rounded-xl border border-border">
              <div className="flex flex-col">
                <span className="text-xs font-bold">Demo Mode</span>
                <span className="text-[10px] text-muted">Generate posts without API keys</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDemoMode(!isDemoMode)}
                className={`w-10 h-5 rounded-full transition-all relative ${isDemoMode ? 'bg-accent' : 'bg-muted/30'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDemoMode ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <button 
              type="submit" 
              disabled={isGenerating}
              className="btn-primary w-full py-4"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Viral Post
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-bold">Generation Failed</span>
              </div>
              <p className="text-xs opacity-80 whitespace-pre-wrap">{error}</p>
              {error.includes("AI models failed") && (
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'debug' }))}
                  className="text-xs font-bold underline hover:text-danger/80 text-left"
                >
                  Go to AI Diagnostics to fix API keys →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card h-[600px] flex flex-col items-center justify-center text-center text-muted"
              >
                <div className="w-20 h-20 rounded-full bg-surface2 flex items-center justify-center mb-6">
                  <TrendingUp className="w-10 h-10 opacity-20" />
                </div>
                <h3 className="text-xl font-display font-bold text-text mb-2">Ready to go viral?</h3>
                <p className="max-w-xs">Fill in the topic and context to generate your first high-impact LinkedIn post.</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                {/* Virality Banner */}
                <div className="card bg-gradient-to-r from-accent/10 to-accent2/10 border-accent/20">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="text-center md:border-r border-border/50 pr-4">
                      <div className="text-4xl font-mono font-bold text-accent mb-1">{result.viralityScore}</div>
                      <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Virality Score</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-xs font-bold text-accent2 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        AI Prediction
                      </div>
                      <p className="text-sm text-text/80 leading-relaxed">{result.viralityReason}</p>
                    </div>
                    <div className="text-center md:border-l border-border/50 pl-4">
                      <div className="text-sm font-bold text-text mb-1">{result.bestPostingTime}</div>
                      <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Best Time to Post</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border/50">
                    <div className="flex items-center justify-center gap-2 text-muted">
                      <Heart className="w-4 h-4 text-danger" />
                      <span className="text-xs font-mono">{result.engagementPrediction.likes}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-muted">
                      <MessageSquare className="w-4 h-4 text-accent" />
                      <span className="text-xs font-mono">{result.engagementPrediction.comments}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-muted">
                      <Repeat className="w-4 h-4 text-success" />
                      <span className="text-xs font-mono">{result.engagementPrediction.reposts}</span>
                    </div>
                  </div>
                </div>

                {/* Post Editor */}
                <div className="card space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display text-xl font-bold">Post Draft</h3>
                    <div className="flex gap-2">
                      <button onClick={handleCopy} className="p-2 hover:bg-surface2 rounded-lg text-muted transition-all" title="Copy to clipboard">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={handleGenerate} className="p-2 hover:bg-surface2 rounded-lg text-muted transition-all" title="Regenerate">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <textarea 
                    value={editablePost}
                    onChange={e => setEditablePost(e.target.value)}
                    className="w-full h-80 bg-surface2 border border-border rounded-xl p-6 text-text leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all resize-none"
                  />

                  <div className="flex flex-wrap gap-2">
                    {result.hashtags.map((tag, i) => (
                      <span key={i} className="tag tag-cyan">{tag}</span>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={handleScorePost}
                      disabled={isScoring}
                      className="btn-secondary flex-1"
                    >
                      {isScoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                      Score Post
                    </button>
                    <button 
                      onClick={handlePublish}
                      disabled={isPublishing || publishSuccess}
                      className={`btn-primary flex-1 ${publishSuccess ? 'bg-success/20 text-success border-success/30' : ''}`}
                    >
                      {isPublishing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : publishSuccess ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Posted to LinkedIn!
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Publish to LinkedIn
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Scoring Results */}
                <AnimatePresence>
                  {scoreResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      <div className="card">
                        <h3 className="font-display text-xl font-bold mb-8">Deep Virality Audit</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-6">
                            {[
                              { label: "Hook Strength", score: scoreResult.hookStrength },
                              { label: "Readability", score: scoreResult.readabilityScore },
                              { label: "Value Score", score: scoreResult.valueScore },
                              { label: "Emotional Resonance", score: scoreResult.emotionalResonance },
                              { label: "CTA Strength", score: scoreResult.ctaStrength }
                            ].map((m, i) => (
                              <div key={i} className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted">
                                  <span>{m.label}</span>
                                  <span>{m.score}%</span>
                                </div>
                                <div className="progress-bar">
                                  <div className="progress-fill" style={{ width: `${m.score}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="space-y-6">
                            <div className="p-4 bg-surface2 rounded-xl border border-border">
                              <div className="text-xs font-bold text-accent uppercase tracking-widest mb-2">Verdict</div>
                              <p className="text-sm text-muted italic">"{scoreResult.verdict}"</p>
                            </div>
                            <div className="p-4 bg-danger/5 rounded-xl border border-danger/20">
                              <div className="text-xs font-bold text-danger uppercase tracking-widest mb-2">Top Fix</div>
                              <p className="text-sm text-text/80">{scoreResult.topFix}</p>
                            </div>
                            <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
                              <div className="text-xs font-bold text-accent uppercase tracking-widest mb-2">Improved Hook</div>
                              <p className="text-sm text-text/80 mb-4 font-bold">"{scoreResult.improvedHook}"</p>
                              <button 
                                onClick={useImprovedHook}
                                className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                              >
                                Use this hook <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Alternative Hooks */}
                <div className="card">
                  <h3 className="font-display text-lg font-bold mb-6">Alternative Hooks</h3>
                  <div className="space-y-4">
                    {result.variations.map((hook, i) => (
                      <div key={i} className="p-4 bg-surface2 rounded-xl border border-border flex justify-between items-center gap-4 group">
                        <p className="text-sm text-muted italic">"{hook}"</p>
                        <button 
                          onClick={() => {
                            const lines = editablePost.split('\n');
                            lines[0] = hook;
                            setEditablePost(lines.join('\n'));
                          }}
                          className="btn-secondary py-1.5 px-3 text-[10px] opacity-0 group-hover:opacity-100"
                        >
                          Swap Hook
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
