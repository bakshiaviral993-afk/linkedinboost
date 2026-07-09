import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Check, 
  Award, 
  Flame, 
  Trophy, 
  TrendingUp, 
  RefreshCw, 
  Sparkles, 
  User, 
  ChevronRight, 
  BarChart2, 
  Star, 
  Target,
  ArrowUpRight,
  Sparkle
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { motion, AnimatePresence } from "motion/react";

interface DailyGrowthProps {
  user: { id: string; name: string; email: string };
}

interface Task {
  id: string;
  task_type: "profile" | "engagement" | "content" | "networking";
  task_title: string;
  task_description: string;
  status: "pending" | "completed";
  points: number;
}

interface Badge {
  name: string;
  acquired: boolean;
  desc: string;
  icon: string;
}

interface WeeklyTrendItem {
  name: string;
  completionRate: number;
  date: string;
}

export default function DailyGrowth({ user }: DailyGrowthProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [growthScore, setGrowthScore] = useState(0);
  const [weeklyTrend, setWeeklyTrend] = useState<WeeklyTrendItem[]>([]);
  const [rank, setRank] = useState(1);
  const [rankTotal, setRankTotal] = useState(1);
  const [celebration, setCelebration] = useState<string | null>(null);

  const fetchGrowthData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/daily-growth/${user.id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch daily growth analytics.");
      }
      const data = await res.json();
      setTasks(data.tasks || []);
      setStreak(data.streak || 0);
      setPoints(data.points || 0);
      setBadges(data.badges || []);
      setGrowthScore(data.growthScore || 0);
      setWeeklyTrend(data.weeklyTrend || []);
      setRank(data.rank || 1);
      setRankTotal(data.rankTotal || 1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrowthData();
  }, [user.id]);

  const toggleTask = async (taskId: string, pointsGained: number, currentStatus: string) => {
    try {
      const res = await fetch(`/api/daily-growth/toggle/${taskId}`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        
        // Trigger celebratory visual spark if completed
        if (data.status === "completed") {
          setCelebration(`+${pointsGained} Points! Task Complete 🚀`);
          setTimeout(() => setCelebration(null), 3000);
        }

        // Optimistically update local client states to feel super fast
        setTasks(prev => prev.map(t => {
          if (t.id === taskId) {
            return { ...t, status: data.status };
          }
          return t;
        }));

        // Refresh database aggregates
        const statRes = await fetch(`/api/daily-growth/${user.id}`);
        if (statRes.ok) {
          const statData = await statRes.json();
          setStreak(statData.streak || 0);
          setPoints(statData.points || 0);
          setBadges(statData.badges || []);
          setGrowthScore(statData.growthScore || 0);
          setWeeklyTrend(statData.weeklyTrend || []);
          setRank(statData.rank || 1);
          setRankTotal(statData.rankTotal || 1);
        }
      }
    } catch (err) {
      console.error("Failed to toggle task status", err);
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "profile":
        return <User className="w-5 h-5 text-indigo-400" id="icon-profile-task" />;
      case "engagement":
        return <Sparkles className="w-5 h-5 text-teal-400" id="icon-engagement-task" />;
      case "content":
        return <Zap className="w-5 h-5 text-amber-400" id="icon-content-task" />;
      case "networking":
        return <ArrowUpRight className="w-5 h-5 text-rose-400" id="icon-net-task" />;
      default:
        return <Check className="w-5 h-5 text-sky-400" id="icon-default-task" />;
    }
  };

  const getTaskBorder = (type: string, isCompleted: boolean) => {
    if (isCompleted) return "border-emerald-500/30 bg-emerald-950/10";
    switch (type) {
      case "profile":
        return "hover:border-indigo-500/30 border-gray-800/60";
      case "engagement":
        return "hover:border-teal-500/30 border-gray-800/60";
      case "content":
        return "hover:border-amber-500/30 border-gray-800/60";
      case "networking":
        return "hover:border-rose-500/30 border-gray-800/60";
      default:
        return "border-gray-800/60";
    }
  };

  const getBadgeIcon = (iconCode: string) => {
    switch (iconCode) {
      case "ROOKIE":
        return <Star className="w-6 h-6 text-amber-500" id="star-rookie" />;
      case "CREATOR":
        return <Zap className="w-6 h-6 text-teal-400" id="zap-creator" />;
      case "VOICE":
        return <Award className="w-6 h-6 text-sky-400" id="award-voice" />;
      case "INFLUENCER":
        return <Trophy className="w-6 h-6 text-indigo-400" id="trophy-influencer" />;
      default:
        return <Award className="w-6 h-6 text-slate-400" id="award-default" />;
    }
  };

  // Mocked leaderboard context of other professional accounts
  const LEADERS = [
    { name: "Elena Rostova", role: "AI Ethics Advocate", score: 94, isCurrentUser: false },
    { name: "Marcus Thorne", role: "SaaS Dev Relations", score: 86, isCurrentUser: false },
    { name: user.name, role: "Active Builder", score: growthScore, isCurrentUser: true },
    { name: "Siddharth Mehta", role: "Product Director", score: 72, isCurrentUser: false },
    { name: "Cassandra Vance", role: "Venture Principal", score: 65, isCurrentUser: false },
  ].sort((a,b) => b.score - a.score);

  return (
    <div className="space-y-8 p-1 sm:p-2 max-w-6xl mx-auto" id="daily-growth-root">
      
      {/* Dynamic Celebration Overlay */}
      <AnimatePresence>
        {celebration && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-emerald-500 text-black font-semibold px-4 py-3 rounded-lg shadow-xl"
            id="spark-celebration-toast"
          >
            <Sparkle className="w-5 h-5 animate-spin" />
            <span>{celebration}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Welcome Title & Headline Profile summary */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-800 pb-6" id="welcome-header">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest" id="status-line">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Daily LinkedIn Growth Agent Active
          </div>
          <h1 className="text-3xl font-sans font-semibold tracking-tight text-white mt-1" id="main-growth-heading">
            Make Consistency Your Superpower
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-xl" id="growth-subtitle">
            Complete daily professional recommendations and track your compounding network strength score in real-time.
          </p>
        </div>
        <button 
          onClick={fetchGrowthData} 
          disabled={loading}
          className="self-start md:self-auto flex items-center gap-2 bg-gray-900 border border-gray-800 text-xs font-mono text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-all"
          id="btn-sync-growth"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Sync Analytics Engine
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-900/30 text-red-400 text-sm rounded-lg flex items-center gap-2" id="growth-error-banner">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Main Grid: Left Side Stats & Checklist / Right Side Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="growth-main-dashboard">
        
        {/* Left 7 Columns: Daily Checklist */}
        <div className="lg:col-span-7 space-y-6" id="growth-checklist-container">
          <div className="flex items-center justify-between" id="today-tasks-subheader">
            <h2 className="text-lg font-sans font-medium text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Today's Recommended Tasks
            </h2>
            <span className="text-xs font-mono text-gray-400">4 generated daily</span>
          </div>

          <div className="space-y-4" id="tasks-list">
            {tasks.map((task) => {
              const isCompleted = task.status === "completed";
              return (
                <div 
                  key={task.id}
                  className={`border rounded-xl p-5 transition-all text-left duration-200 ${getTaskBorder(task.task_type, isCompleted)}`}
                  id={`task-card-${task.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-lg border border-gray-800 bg-gray-900/50 mt-0.5`}>
                        {getTaskIcon(task.task_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-stone-300 text-sm font-sans font-medium break-words leading-snug">
                            {task.task_title}
                          </span>
                          <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                            isCompleted ? "bg-emerald-950/30 text-emerald-400" : "bg-gray-800 text-gray-400"
                          }`}>
                            {task.task_type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                          {task.task_description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleTask(task.id, task.points, task.status)}
                      className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-xs font-mono tracking-tight transition-all shrink-0 ${
                        isCompleted 
                          ? "bg-emerald-500 text-black border-emerald-400 font-semibold" 
                          : "bg-gray-900 hover:bg-gray-800 border-gray-800 text-gray-300"
                      }`}
                      id={`btn-complete-task-${task.id}`}
                    >
                      {isCompleted ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3px]" />
                          <span>Done (+{task.points})</span>
                        </>
                      ) : (
                        <>
                          <span>+{task.points} pts</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {tasks.length === 0 && !loading && (
              <div className="border border-dashed border-gray-800 rounded-xl p-8 text-center text-gray-500" id="no-tasks-state">
                No tasks available. Wait a few seconds or click "Sync Analytics Engine".
              </div>
            )}
          </div>

          {/* Gamified Level & Badging Progression */}
          <div className="border border-gray-800 bg-gray-900/20 rounded-xl p-6 space-y-6" id="growth-badges-panel">
            <div>
              <h3 className="text-sm font-mono uppercase tracking-wider text-indigo-400">Unlockable Credibility Badges</h3>
              <p className="text-xs text-gray-400 mt-1">Acquire points or complete tasks to climb the organic LinkedIn authority ladder.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="badges-grid">
              {badges.map((badge, idx) => (
                <div 
                  key={idx}
                  className={`border rounded-lg p-3.5 flex items-start gap-3 transition-opacity ${
                    badge.acquired 
                      ? "border-indigo-500/30 bg-indigo-950/5 text-white" 
                      : "border-gray-800 opacity-40 text-gray-500"
                  }`}
                  id={`badge-card-${idx}`}
                >
                  <div className="p-2 bg-gray-900 border border-gray-800 rounded-lg shrink-0">
                    {getBadgeIcon(badge.icon)}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold flex items-center gap-1">
                      {badge.name}
                      {badge.acquired && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                    </h4>
                    <p className="text-[11px] leading-tight text-gray-400 mt-1">
                      {badge.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Leaderboards, Streaks, Trends */}
        <div className="lg:col-span-5 space-y-8" id="growth-metrics-sidebar">
          
          {/* Growth Score & Summary Gauge */}
          <div className="bg-gradient-to-br from-indigo-950/20 via-gray-900 to-black border border-gray-800 rounded-xl p-6 space-y-6" id="growth-score-card">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-indigo-400">compounding Score</div>
              <h3 className="text-lg font-sans font-medium text-white mt-1">LinkedIn Growth Score</h3>
            </div>

            <div className="flex items-center justify-between gap-4 py-2" id="score-meter-box">
              <div className="space-y-1">
                <div className="text-4xl font-mono text-indigo-300 font-bold tracking-tight">
                  {growthScore} <span className="text-sm font-normal text-gray-400">/ 100</span>
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Weighted by activity consistency
                </div>
              </div>

              {/* Score radial placeholder or high contrast status badge */}
              <div className="px-3 py-2 bg-indigo-950/30 border border-indigo-500/20 rounded-lg text-center" id="score-rank-indicator">
                <div className="text-[10px] font-mono text-indigo-400 uppercase">Current Tier</div>
                <div className="text-xs font-bold text-white mt-0.5">
                  {growthScore >= 80 ? "Top 5% Expert" : growthScore >= 60 ? "Rising Executive" : "Hustling Builder"}
                </div>
              </div>
            </div>

            {/* Formula display helper */}
            <div className="bg-black/40 border border-gray-800/80 rounded-lg p-3 text-[10px] font-mono text-gray-400 space-y-1" id="score-formula-hint">
              <div className="text-gray-300 font-semibold mb-1">Score Weights:</div>
              <div>• Profile analysis score: 30%</div>
              <div>• Brand visibility index: 30%</div>
              <div>• Task execution rate: 20%</div>
              <div>• Media posting consistency: 20%</div>
            </div>

            {/* Total accumulated points widget */}
            <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-4" id="score-small-aggregates">
              <div>
                <div className="text-[10px] font-mono text-gray-400 uppercase">all time points</div>
                <div className="text-xl font-mono text-white font-semibold mt-0.5">{points}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-gray-400 uppercase">Daily Streak</div>
                <div className="text-xl font-mono text-orange-400 font-semibold mt-0.5 flex items-center gap-1">
                  <Flame className="w-5 h-5 animate-pulse text-orange-500 fill-orange-500/20" />
                  {streak} {streak === 1 ? "day" : "days"}
                </div>
              </div>
            </div>
          </div>

          {/* Streak Milestone Trackers */}
          <div className="border border-gray-800 rounded-xl p-5 space-y-4" id="streak-milestones-card">
            <h3 className="text-sm font-sans font-medium text-white flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400/20" />
              Streak Milestones
            </h3>

            <div className="grid grid-cols-4 gap-2 text-center" id="milestones-row">
              {[
                { label: "1 Day", days: 1 },
                { label: "7 Day", days: 7 },
                { label: "30 Day", days: 30 },
                { label: "90 Day", days: 90 },
              ].map((ms, idx) => {
                const achieved = streak >= ms.days;
                return (
                  <div 
                    key={idx}
                    className={`border rounded-lg py-2.5 px-1 truncate ${
                      achieved 
                        ? "border-emerald-500/30 bg-emerald-950/10 text-white font-medium" 
                        : "border-gray-800 text-gray-500 text-xs"
                    }`}
                    id={`streak-milestone-${ms.days}`}
                  >
                    <div className="text-[10px] font-mono uppercase">{ms.label}</div>
                    <div className="mt-1 flex items-center justify-center">
                      <Flame className={`w-4 h-4 ${achieved ? "text-orange-500 fill-orange-500" : "text-gray-700"}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Performance Trend Graph (Recharts) */}
          <div className="border border-gray-800 bg-gray-900/10 rounded-xl p-5 space-y-4" id="weekly-trend-chart-card">
            <h3 className="text-sm font-sans font-medium text-white flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              Weekly Completion History
            </h3>

            <div className="h-32 w-full mt-2" id="recharts-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} />
                  <YAxis stroke="#6b7280" fontSize={10} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ background: "#0f172a", border: "1px solid #1f2937", borderRadius: "8px" }}
                    labelClassName="text-white text-xs font-mono"
                    itemStyle={{ color: "#818cf8", fontSize: "11px" }}
                  />
                  <Area type="monotone" dataKey="completionRate" stroke="#6366f1" fillOpacity={0.1} fill="url(#colorRate)" strokeWidth={2} />
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Real-Time Interactive Leaderboard */}
          <div className="border border-gray-800 rounded-xl p-5 space-y-4" id="leaderboard-card">
            <h3 className="text-sm font-sans font-medium text-white flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              Creator Leaderboard Rank
            </h3>

            <div className="space-y-2" id="leaderboard-competitors">
              {LEADERS.map((leader, i) => {
                const rankNum = i + 1;
                return (
                  <div 
                    key={i}
                    className={`flex items-center justify-between p-2.5 rounded-lg border ${
                      leader.isCurrentUser 
                        ? "border-indigo-500/30 bg-indigo-950/15" 
                        : "border-transparent bg-transparent"
                    }`}
                    id={`leaderboard-row-${rankNum}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                        rankNum === 1 ? "bg-amber-500 text-black font-bold" :
                        rankNum === 2 ? "bg-slate-300 text-black font-bold" :
                        "bg-gray-800 text-gray-400"
                      }`}>
                        {rankNum}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-200">{leader.name}</div>
                        <div className="text-[10px] text-gray-500">{leader.role}</div>
                      </div>
                    </div>
                    <div className="text-xs font-mono font-medium text-indigo-300">
                      {leader.score} pts
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-2 text-[10px] font-mono text-gray-500" id="rank-attribution">
              You are ranked #{rank} of {rankTotal} active developers
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
