import React, { useState, useEffect } from "react";
import { History, TrendingUp, Copy, ExternalLink, ChevronDown, ChevronUp, Calendar, Tag, Zap, Clock, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type User = { id: string; name: string; email: string; picture?: string; headline?: string; about?: string };

interface Post {
  id: number;
  content: string;
  status: string;
  virality_score: number;
  topic: string;
  post_type: string;
  created_at: number;
  linkedin_post_id?: string;
}

interface PostHistoryProps {
  user: User;
}

export default function PostHistory({ user }: PostHistoryProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/user/${user.id}/posts`)
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user.id]);

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    drafts: posts.filter(p => p.status === 'draft').length,
    avgScore: posts.length > 0 ? Math.round(posts.reduce((acc, p) => acc + p.virality_score, 0) / posts.length) : 0
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in">
      <header>
        <h2 className="text-3xl font-display font-extrabold tracking-tight mb-2">Post History</h2>
        <p className="text-muted">Manage and track your generated and published LinkedIn content.</p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Posts", value: stats.total, icon: History, color: "text-accent" },
          { label: "Published", value: stats.published, icon: ExternalLink, color: "text-success" },
          { label: "Drafts", value: stats.drafts, icon: Calendar, color: "text-gold" },
          { label: "Avg. Virality", value: stats.avgScore, icon: Zap, color: "text-accent2" }
        ].map((stat, i) => (
          <div key={i} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-surface2 flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted uppercase tracking-widest">{stat.label}</div>
              <div className="text-2xl font-mono font-bold text-text">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="card text-center py-20 text-muted">
            <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No posts found. Start generating content to see your history here.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="card p-0 overflow-hidden">
              <div 
                onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-surface2/50 transition-colors"
              >
                <div className="flex items-center gap-6 flex-grow overflow-hidden">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-surface2 flex items-center justify-center text-accent font-mono font-bold">
                    {post.virality_score}
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <div className="text-sm font-bold text-text truncate mb-1">
                      {post.content.split('\n')[0]}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-muted uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {post.topic}
                      </span>
                      <span className={`tag ${post.status === 'published' ? 'tag-green' : 'tag-gold'}`}>
                        {post.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-6">
                  {expandedId === post.id ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
                </div>
              </div>

              <AnimatePresence>
                {expandedId === post.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border bg-surface2/30"
                  >
                    <div className="p-8 space-y-6">
                      <div className="p-6 bg-surface2 border border-border rounded-xl text-sm text-text leading-relaxed whitespace-pre-wrap font-sans">
                        {post.content}
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(post.content);
                          }}
                          className="btn-secondary py-2 px-4 text-sm"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Content
                        </button>
                        {post.linkedin_post_id && (
                          <a 
                            href={`https://www.linkedin.com/feed/update/${post.linkedin_post_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary py-2 px-4 text-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View on LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
