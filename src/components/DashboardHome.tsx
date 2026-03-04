import React from "react";
import { Sparkles, TrendingUp, Zap, FileText, ArrowRight, Lightbulb, Target, Users, BarChart3 } from "lucide-react";
import { motion } from "motion/react";

type User = { id: string; name: string; email: string; picture?: string; headline?: string; about?: string };
type View = 'dashboard' | 'analyzer' | 'generator' | 'optimizer' | 'strategy' | 'history' | 'settings';

interface DashboardHomeProps {
  user: User;
  onNavigate: (view: View) => void;
}

export default function DashboardHome({ user, onNavigate }: DashboardHomeProps) {
  const firstName = user.name.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const quickActions = [
    { id: 'analyzer', icon: Sparkles, title: "Analyze Profile", desc: "Get your LinkedIn score", color: "text-accent", bg: "bg-accent/10" },
    { id: 'generator', icon: TrendingUp, title: "Generate Post", desc: "Create viral content", color: "text-accent2", bg: "bg-accent2/10" },
    { id: 'optimizer', icon: Zap, title: "Optimize Section", desc: "Rewrite for SEO", color: "text-gold", bg: "bg-gold/10" },
    { id: 'strategy', icon: FileText, title: "Build Strategy", desc: "Plan 30 days of growth", color: "text-success", bg: "bg-success/10" },
  ];

  const stats = [
    { label: "Projected Uplift", value: "+142%", desc: "Profile views", trend: "up" },
    { label: "Avg. Reach", value: "2.4k", desc: "Per viral post", trend: "up" },
    { label: "Connections", value: "+48", desc: "This week", trend: "up" },
    { label: "Engagement", value: "4.8%", desc: "Avg. rate", trend: "up" },
  ];

  const tips = [
    "Post between 8 AM and 10 AM on Tuesdays for maximum reach.",
    "Use a contrarian hook to stop the scroll in the first 3 lines.",
    "Tag 2-3 relevant industry leaders to boost initial engagement.",
    "Reply to every comment within the first 60 minutes of posting.",
    "Update your headline with keywords found in your Profile Analysis."
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Hero Greeting */}
      <header className="flex flex-col md:row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight mb-2">
            {greeting}, <span className="text-accent">{firstName}</span>.
          </h1>
          <p className="text-muted text-lg">Here's your LinkedIn growth intelligence for today.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface2 border border-border rounded-xl">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted">AI Engine Active</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card flex flex-col justify-between"
          >
            <div className="text-muted text-xs font-bold uppercase tracking-widest mb-4">{stat.label}</div>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-mono font-bold text-text">{stat.value}</div>
              <div className="text-success text-xs font-bold mb-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stat.trend === 'up' ? '↑' : '↓'}
              </div>
            </div>
            <div className="text-muted text-xs mt-2">{stat.desc}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-accent" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, i) => (
            <motion.button
              key={i}
              onClick={() => onNavigate(action.id as View)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="card text-left group hover:bg-surface2 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl ${action.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <action.icon className={`w-6 h-6 ${action.color}`} />
              </div>
              <h3 className="font-display text-xl font-bold mb-2 flex items-center justify-between">
                {action.title}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-muted text-sm">{action.desc}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tips Section */}
        <div className="lg:col-span-2 card">
          <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-gold" />
            LinkedIn Growth Playbook
          </h2>
          <div className="space-y-4">
            {tips.map((tip, i) => (
              <div key={i} className="flex gap-4 p-4 bg-surface2/50 rounded-xl border border-border/50 group hover:border-accent/30 transition-all">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface2 flex items-center justify-center font-mono font-bold text-accent text-xs">
                  0{i + 1}
                </div>
                <p className="text-sm text-text/80 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights Card */}
        <div className="card bg-gradient-to-br from-surface to-surface2 border-accent/20">
          <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent2" />
            AI Insights
          </h2>
          <div className="space-y-6">
            <div className="p-4 bg-accent2/5 rounded-xl border border-accent2/10">
              <div className="text-xs font-bold text-accent2 uppercase tracking-widest mb-2">Profile Gap</div>
              <p className="text-sm text-muted">Your "About" section lacks specific outcome-based metrics compared to top performers in your industry.</p>
            </div>
            <div className="p-4 bg-accent/5 rounded-xl border border-accent/10">
              <div className="text-xs font-bold text-accent uppercase tracking-widest mb-2">Content Opportunity</div>
              <p className="text-sm text-muted">Posts about "AI Productivity" are currently trending in your network. Generate a post on this topic now.</p>
            </div>
            <button 
              onClick={() => onNavigate('analyzer')}
              className="w-full btn-secondary py-3 text-sm"
            >
              Run Full Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
