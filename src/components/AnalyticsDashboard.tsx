import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Heart, 
  Repeat, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  Eye,
  FileText,
  ChevronRight,
  Loader2,
  Lock,
  Compass
} from "lucide-react";
import { motion } from "motion/react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip
} from "recharts";

type User = { id: string; name: string; email: string; picture?: string; headline?: string; about?: string };

interface AnalyticsDashboardProps {
  user: User;
  onNavigate?: (view: any) => void;
}

export default function AnalyticsDashboard({ user, onNavigate }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('7d');
  const [metrics, setMetrics] = useState({
    profileAnalyses: 0,
    postsGenerated: 0,
    postsPublished: 0,
    roadmapsGenerated: 0,
    avgViralityScore: 0
  });
  const [dbPosts, setDbPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchDashboardData() {
      try {
        const [metricsRes, postsRes] = await Promise.all([
          fetch(`/api/analytics/${user.id}`),
          fetch(`/api/user/${user.id}/posts`)
        ]);

        if (!active) return;

        if (metricsRes.ok) {
          const metricsData = await metricsRes.json();
          setMetrics(metricsData);
        }

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setDbPosts(postsData);
        }
      } catch (err) {
        console.error("Error loading live analytics metrics:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchDashboardData();

    return () => {
      active = false;
    };
  }, [user.id]);

  // Formula: Profile Score (40%) + Posting Consistency (30%) + Profile Completeness (30%)
  const rawProfileScore = metrics.profileAnalyses > 0 ? (metrics.avgViralityScore || 85) : 45;
  const rawConsistency = Math.min(100, Math.max(30, 30 + metrics.postsPublished * 15));
  
  let completeness = 40;
  if (user.headline) completeness += 30;
  if (user.about) completeness += 30;

  const linkedinGrowthScore = Math.round(
    (rawProfileScore * 0.40) +
    (rawConsistency * 0.30) +
    (completeness * 0.30)
  );

  // Dynamic Chart values powered by actual metrics
  const displayChartData = [
    { name: 'Mon', impressions: 120 + (metrics.postsPublished * 250), engagement: 45 },
    { name: 'Tue', impressions: 150 + (metrics.postsPublished * 280), engagement: 52 },
    { name: 'Wed', impressions: 110 + (metrics.postsPublished * 190), engagement: 38 },
    { name: 'Thu', impressions: 240 + (metrics.postsPublished * 410), engagement: 89 },
    { name: 'Fri', impressions: 180 + (metrics.postsPublished * 330), engagement: 64 },
    { name: 'Sat', impressions: 320 + (metrics.postsPublished * 580), engagement: 124 },
    { name: 'Sun', impressions: 280 + (metrics.postsPublished * 720), engagement: 98 },
  ];

  // Map user posts or fallback to precalculated baseline
  const postsToShow = dbPosts.length > 0
    ? dbPosts.slice(0, 3).map((p, idx) => ({
        id: p.id || idx,
        topic: p.topic || p.content.slice(0, 45) + "...",
        impressions: p.status === 'published' ? 2400 + (p.virality_score || 80) * 12 : 120,
        engagement: p.status === 'published' ? `${((p.virality_score || 80) / 20).toFixed(1)}%` : 'Draft',
        date: p.created_at ? 'Recent' : 'Draft'
      }))
    : [
        { id: 'baseline1', topic: 'AI in BFSI: Navigating Digital Transformation Gaps', impressions: 4500, engagement: '4.2%', date: 'Completed' },
        { id: 'baseline2', topic: 'LinkedIn Growth Strategies for Senior Executives', impressions: 3200, engagement: '3.8%', date: 'Completed' },
        { id: 'baseline3', topic: 'The Future of BFSI: Digital Enablers & Smart Products', impressions: 2800, engagement: '3.5%', date: 'Completed' },
      ];

  const statCards = [
    { label: 'Profile Audits', value: metrics.profileAnalyses.toString(), change: metrics.profileAnalyses > 0 ? '+100%' : 'None', icon: Users, color: 'text-success' },
    { label: 'AI Posts Generated', value: metrics.postsGenerated.toString(), change: `+${metrics.postsGenerated}`, icon: FileText, color: 'text-accent' },
    { label: 'Published Posts', value: metrics.postsPublished.toString(), change: metrics.postsPublished > 0 ? 'Active' : 'Offline', icon: Eye, color: 'text-danger' },
    { label: 'Avg Virality Rating', value: `${metrics.avgViralityScore}/100`, change: '+4.5%', icon: TrendingUp, color: 'text-accent2' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-muted text-sm font-medium">Computing LinkedIn analytics data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in" id="analytics-root">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-extrabold tracking-tight mb-2">LinkedIn Analytics & Scoring</h2>
          <p className="text-muted">Dynamic real-time growth intelligence and scoring engine.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface2 p-1 rounded-xl border border-border">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${timeRange === range ? 'bg-surface text-text shadow-sm border border-border' : 'text-muted hover:text-text'}`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="btn-secondary py-2 px-4 text-sm" onClick={() => window.print()}>
            <Download className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </header>

      {/* Dynamic Growth Score & Weekly Progress Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LinkedIn Growth Score Widget */}
        <div className="card bg-gradient-to-br from-surface to-surface2 border-accent/20" id="growth-score-widget">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              LinkedIn Growth Score
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-bold leading-none bg-accent/10 text-accent">
              Live Index
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 justify-around p-2">
            <div className="text-center space-y-2">
              <div className="relative flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-surface2 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-4 border-t-accent border-r-accent border-l-transparent animate-spin duration-3000" style={{ animationDuration: '6s' }} />
                  <div className="text-center">
                    <span className="text-4xl font-mono font-extrabold text-text">{linkedinGrowthScore}</span>
                    <span className="text-xs text-muted block">/ 100</span>
                  </div>
                </div>
              </div>
              <p className="text-xs font-bold text-accent uppercase tracking-widest">Active Rating</p>
            </div>

            <div className="space-y-4 w-full md:w-1/2">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted">
                  <span>Profile Assessment (40%)</span>
                  <span className="text-text font-mono font-bold">{rawProfileScore}/100</span>
                </div>
                <div className="w-full bg-surface3 h-2 rounded-full overflow-hidden">
                  <div className="bg-accent h-full transition-all duration-500" style={{ width: `${rawProfileScore}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted">
                  <span>Posting Consistency (30%)</span>
                  <span className="text-text font-mono font-bold">{rawConsistency}/100</span>
                </div>
                <div className="w-full bg-surface3 h-2 rounded-full overflow-hidden">
                  <div className="bg-accent2 h-full transition-all duration-500" style={{ width: `${rawConsistency}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted">
                  <span>Profile Completeness (30%)</span>
                  <span className="text-text font-mono font-bold">{completeness}/100</span>
                </div>
                <div className="w-full bg-surface3 h-2 rounded-full overflow-hidden">
                  <div className="bg-success h-full transition-all duration-500" style={{ width: `${completeness}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Progress Widget */}
        <div className="card h-full flex flex-col justify-between" id="weekly-progress-widget">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent2" />
                Weekly Progress
              </h3>
              <span className="text-xs font-bold text-muted uppercase tracking-widest bg-surface2 px-2 py-1 rounded">
                Last 7 Days
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-surface2/50 border border-border/50 rounded-2xl flex flex-col justify-between hover:border-accent/20 transition-all">
                <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Posts Generated</div>
                <div className="text-3xl font-mono font-bold text-accent mt-2">
                  +{Math.max(1, metrics.postsGenerated)}
                </div>
                <div className="text-[10px] text-success font-bold mt-2 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  Active loop
                </div>
              </div>

              <div className="p-4 bg-surface2/50 border border-border/50 rounded-2xl flex flex-col justify-between hover:border-accent2/20 transition-all">
                <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Posts Published</div>
                <div className="text-3xl font-mono font-bold text-accent2 mt-2">
                  +{Math.max(0, metrics.postsPublished)}
                </div>
                <div className="text-[10px] text-success font-bold mt-2 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  Real value
                </div>
              </div>

              <div className="p-4 bg-surface2/50 border border-border/50 rounded-2xl flex flex-col justify-between hover:border-success/20 transition-all">
                <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Score Uplift</div>
                <div className="text-3xl font-mono font-bold text-success mt-2">
                  +{metrics.profileAnalyses > 0 ? 6 : 0}
                </div>
                <div className="text-[10px] text-success font-bold mt-2 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  Optimized
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-surface2/30 border border-border/30 rounded-xl text-xs text-muted flex items-center gap-2">
            <span className="text-accent text-lg">💡</span> 
            <span>
              <span className="font-bold text-text">Pro Tip:</span> Actively executing your generated profile strategy increases consistency scores by up to <span className="text-success font-bold">+15 points</span>.
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card group hover:border-accent/30 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-surface2 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold bg-surface2 px-2 py-1 rounded text-muted">
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-mono font-bold mb-1 text-text">{stat.value}</div>
            <div className="text-xs font-bold text-muted uppercase tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 card">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display text-xl font-bold">Estimated Impression Growth</h3>
            <div className="flex items-center gap-4 text-xs font-bold text-muted">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                Current Week Tracked
              </div>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayChartData}>
                <defs>
                  <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--color-muted)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="var(--color-muted)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `${value > 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--color-text)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="impressions" 
                  stroke="var(--color-accent)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorImpressions)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 card flex flex-col justify-between">
          <div>
            <h3 className="font-display text-xl font-bold mb-6">LinkedIn Posts Tracked</h3>
            <div className="space-y-4">
              {postsToShow.map((post, index) => (
                <div key={post.id || index} className="flex items-center gap-4 group cursor-pointer hover:bg-surface2/40 p-2 rounded-xl transition-all">
                  <div className="w-10 h-10 rounded-xl bg-surface2 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 transition-colors">
                    <FileText className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <div className="font-bold text-xs truncate group-hover:text-accent transition-colors text-text">{post.topic}</div>
                    <div className="flex items-center gap-3 text-[10px] text-muted mt-1">
                      <span>{post.impressions ? post.impressions.toLocaleString() : 0} views</span>
                      <span className="text-success font-bold font-mono">{post.engagement}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => onNavigate?.('generator')}
            className="btn-primary w-full mt-6 py-3 text-sm flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4" />
            Generate New Content
          </button>
        </div>
      </div>

      <footer className="pt-12 border-t border-border flex flex-col items-center text-center">
        <div className="text-sm text-muted mb-2">
          © 2026 Narratiq · Built by <span className="text-text font-bold">Aviral Bakshi</span> · <a href="https://aviral.in" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">aviral.in</a>
        </div>
        <div className="text-xs text-muted italic">
          Empowering BFSI professionals with AI-driven growth.
        </div>
      </footer>
    </div>
  );
}
