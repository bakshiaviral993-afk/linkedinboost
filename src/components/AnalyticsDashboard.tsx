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
  ChevronRight
} from "lucide-react";
import { motion } from "motion/react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  Cell
} from "recharts";

type User = { id: string; name: string; email: string; picture?: string };

interface AnalyticsDashboardProps {
  user: User;
}

const mockData = [
  { date: '2026-03-01', impressions: 1200, engagement: 45 },
  { date: '2026-03-02', impressions: 1500, engagement: 52 },
  { date: '2026-03-03', impressions: 1100, engagement: 38 },
  { date: '2026-03-04', impressions: 2400, engagement: 89 },
  { date: '2026-03-05', impressions: 1800, engagement: 64 },
  { date: '2026-03-06', impressions: 3200, engagement: 124 },
  { date: '2026-03-07', impressions: 2800, engagement: 98 },
  { date: '2026-03-08', impressions: 4500, engagement: 156 },
  { date: '2026-03-09', impressions: 3900, engagement: 142 },
  { date: '2026-03-10', impressions: 5200, engagement: 189 },
];

const topPosts = [
  { id: 1, topic: 'AI in BFSI', impressions: 4500, engagement: '4.2%', date: '2 days ago' },
  { id: 2, topic: 'LinkedIn Growth', impressions: 3200, engagement: '3.8%', date: '4 days ago' },
  { id: 3, topic: 'Digital Transformation', impressions: 2800, engagement: '3.5%', date: '1 week ago' },
];

export default function AnalyticsDashboard({ user }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('7d');

  const stats = [
    { label: 'Total Impressions', value: '24.5k', change: '+12.5%', icon: Eye, color: 'text-accent' },
    { label: 'Avg. Engagement', value: '4.1%', change: '+0.8%', icon: TrendingUp, color: 'text-accent2' },
    { label: 'Follower Growth', value: '+452', change: '+5.2%', icon: Users, color: 'text-success' },
    { label: 'Total Reactions', value: '1,240', change: '+18.2%', icon: Heart, color: 'text-danger' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-extrabold tracking-tight mb-2">Analytics Dashboard</h2>
          <p className="text-muted">Track your growth and content performance on LinkedIn.</p>
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
          <button className="btn-secondary py-2 px-4 text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card group hover:border-accent/30 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-surface2 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.change.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-display font-bold mb-1">{stat.value}</div>
            <div className="text-xs font-bold text-muted uppercase tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 card">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display text-xl font-bold">Impression Growth</h3>
            <div className="flex items-center gap-4 text-xs font-bold text-muted">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                Current Period
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--color-muted)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(str) => str.split('-')[2]}
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

        <div className="lg:col-span-4 card">
          <h3 className="font-display text-xl font-bold mb-8">Top Performing Posts</h3>
          <div className="space-y-6">
            {topPosts.map((post) => (
              <div key={post.id} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-surface2 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 transition-colors">
                  <FileText className="w-6 h-6 text-muted group-hover:text-accent transition-colors" />
                </div>
                <div className="flex-grow overflow-hidden">
                  <div className="font-bold text-sm truncate group-hover:text-accent transition-colors">{post.topic}</div>
                  <div className="flex items-center gap-3 text-xs text-muted mt-1">
                    <span>{post.impressions.toLocaleString()} views</span>
                    <span className="text-success font-bold">{post.engagement} eng.</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            ))}
          </div>
          <button className="btn-secondary w-full mt-8 py-3 text-sm">
            View All Content
          </button>
        </div>
      </div>

      {/* Branding Footer */}
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
