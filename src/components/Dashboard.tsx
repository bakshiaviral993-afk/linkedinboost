import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  FileText, 
  History, 
  Settings, 
  LogOut, 
  ChevronRight,
  User,
  Bell,
  Search,
  Plus,
  BarChart3,
  RefreshCw,
  CreditCard,
  Layers,
  Briefcase,
  Compass,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import DashboardHome from "./DashboardHome";
import ProfileAnalyzer from "./ProfileAnalyzer";
import PostGenerator from "./PostGenerator";
import ProfileOptimizer from "./ProfileOptimizer";
import ContentStrategy from "./ContentStrategy";
import PostHistory from "./PostHistory";
import AnalyticsDashboard from "./AnalyticsDashboard";
import PostRewriter from "./PostRewriter";
import PricingPage from "./PricingPage";
import FounderAnalytics from "./FounderAnalytics";
import UpgradeModal from "./UpgradeModal";
import BillingPage from "./BillingPage";
import ResumeBuilder from "./ResumeBuilder";
import LinkedInBrandScore from "./LinkedInBrandScore";
import GrowthCopilot from "./GrowthCopilot";
import AgencyDesk from "./AgencyDesk";

type User = { id: string; name: string; email: string; picture?: string; headline?: string; about?: string };
type View = 'dashboard' | 'analytics' | 'brandscore' | 'analyzer' | 'generator' | 'rewriter' | 'optimizer' | 'strategy' | 'copilot' | 'agency' | 'resumebuilder' | 'history' | 'pricing' | 'billing' | 'founder' | 'settings';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (updated: Partial<User>) => void;
}

export default function Dashboard({ user, onLogout, onUpdateUser }: DashboardProps) {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [subscription, setSubscription] = useState<{ plan: string; profile_analyses_used: number; posts_generated_used: number; roadmaps_generated_used: number } | null>(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");

  const fetchSubscription = async () => {
    try {
      const res = await fetch(`/api/subscription/${user.id}`);
      if (res.ok) {
        const sub = await res.json();
        setSubscription(sub);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user.id]);

  useEffect(() => {
    const handleLimitReached = (e: any) => {
      setUpgradeReason(e.detail?.reason || "You've reached your free action limit.");
      setIsUpgradeOpen(true);
    };
    window.addEventListener("limit-reached", handleLimitReached);
    return () => window.removeEventListener("limit-reached", handleLimitReached);
  }, []);

  useEffect(() => {
    const handleNavigate = (e: any) => {
      if (e.detail) setActiveView(e.detail as View);
    };
    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'brandscore', icon: TrendingUp, label: 'Brand Score Engine' },
    { id: 'analyzer', icon: Sparkles, label: 'Profile Analyzer' },
    { id: 'generator', icon: TrendingUp, label: 'Post Generator' },
    { id: 'rewriter', icon: RefreshCw, label: 'Post Rewriter' },
    { id: 'optimizer', icon: Zap, label: 'Profile Optimizer' },
    { id: 'strategy', icon: FileText, label: 'Content Strategy' },
    { id: 'copilot', icon: Compass, label: 'Growth Copilot' },
    { id: 'agency', icon: Users, label: 'Agency Desk' },
    { id: 'resumebuilder', icon: Briefcase, label: 'Resume & Cover Letter' },
    { id: 'history', icon: History, label: 'Post History' },
    { id: 'pricing', icon: CreditCard, label: 'Pricing Plans' },
    { id: 'billing', icon: CreditCard, label: 'Billing & Usage' },
    { id: 'founder', icon: Layers, label: 'Founder Desk' },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardHome user={user} onNavigate={setActiveView} />;
      case 'analytics': return <AnalyticsDashboard user={user} onNavigate={setActiveView} />;
      case 'brandscore': return <LinkedInBrandScore user={user} />;
      case 'analyzer': return <ProfileAnalyzer user={user} onUpdateUser={onUpdateUser} />;
      case 'generator': return <PostGenerator user={user} />;
      case 'rewriter': return <PostRewriter user={user} />;
      case 'optimizer': return <ProfileOptimizer user={user} onUpdateUser={onUpdateUser} />;
      case 'strategy': return <ContentStrategy user={user} />;
      case 'copilot': return <GrowthCopilot user={user} />;
      case 'agency': return <AgencyDesk user={user} currentPlan={subscription?.plan || "free"} />;
      case 'resumebuilder': return <ResumeBuilder user={user} />;
      case 'history': return <PostHistory user={user} />;
      case 'pricing': return <PricingPage user={user} currentPlan={subscription?.plan || "free"} onUpgradeSuccess={fetchSubscription} />;
      case 'billing': return <BillingPage user={user} subscription={subscription} onNavigate={setActiveView} onRefreshSubscription={fetchSubscription} />;
      case 'founder': return <FounderAnalytics user={user} currentPlan={subscription?.plan || "free"} onPlanChanged={fetchSubscription} />;
      case 'settings': return <div className="p-8"><h2 className="text-3xl font-display font-bold mb-8">Settings</h2><div className="card">Account settings coming soon.</div></div>;
      default: return <DashboardHome user={user} onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-surface border-r border-border transition-all duration-300 flex flex-col z-50 print:hidden ${isSidebarOpen ? 'w-[280px]' : 'w-[80px]'}`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent2 rounded-lg flex items-center justify-center">
                <Zap className="text-bg w-5 h-5 fill-current" />
              </div>
              <span className="font-display text-xl font-extrabold tracking-tight">Narratiq</span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-surface2 rounded-lg transition-colors"
          >
            <ChevronRight className={`w-5 h-5 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="flex-grow px-4 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all group relative ${activeView === item.id ? 'bg-accent/10 text-accent border border-accent/20' : 'text-muted hover:bg-surface2 hover:text-text'}`}
            >
              <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-accent' : 'group-hover:text-text'}`} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              {!isSidebarOpen && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-surface border border-border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className={`p-3 bg-surface2 rounded-2xl flex items-center gap-4 ${isSidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 overflow-hidden flex-shrink-0">
              {user.picture ? (
                <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-accent font-bold">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            {isSidebarOpen && (
              <div className="flex-grow overflow-hidden">
                <div className="font-bold text-sm truncate">{user.name}</div>
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className="text-xs text-muted truncate max-w-[120px]">{user.email}</span>
                  {subscription?.plan && (
                    <span className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded uppercase tracking-wider flex-shrink-0 ${
                      subscription.plan === 'free' 
                        ? 'bg-muted/10 text-muted border border-muted/20' 
                        : subscription.plan === 'pro' 
                          ? 'bg-accent/15 text-accent border border-accent/25' 
                          : subscription.plan === 'creator'
                            ? 'bg-accent2/15 text-accent2 border border-accent2/25'
                            : 'bg-gold/15 text-gold border border-gold/25'
                    }`}>
                      {subscription.plan}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 space-y-2">
            <button 
              onClick={() => setActiveView('settings')}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-muted hover:bg-surface2 hover:text-text ${activeView === 'settings' ? 'bg-surface2 text-text' : ''}`}
            >
              <Settings className="w-5 h-5" />
              {isSidebarOpen && <span className="font-medium">Settings</span>}
            </button>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-4 p-3 rounded-xl transition-all text-danger/70 hover:bg-danger/10 hover:text-danger"
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span className="font-medium">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto relative flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-md border-b border-border px-8 py-4 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-4 bg-surface2 border border-border px-4 py-2 rounded-xl w-full max-w-md">
            <Search className="w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search features, posts, or insights..." 
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-surface2 rounded-xl text-muted hover:text-text transition-all relative">
              <Bell className="w-5 h-5" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-bg" />
            </button>
            <div className="h-8 w-[1px] bg-border mx-2" />
            <button 
              onClick={() => setActiveView('generator')}
              className="btn-primary py-2 px-4 text-sm h-10"
            >
              <Plus className="w-4 h-4" />
              New Post
            </button>
          </div>
        </header>

        {/* View Container */}
        <div className="p-8 flex-grow print:p-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Branding */}
        <footer className="px-8 py-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 bg-surface/50">
          <div className="text-xs text-muted">
            © 2026 Narratiq · Built by <span className="text-text font-bold">Aviral Bakshi</span> · <a href="https://aviral.in" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">aviral.in</a>
          </div>
          <div className="flex gap-6 text-[10px] font-bold text-muted uppercase tracking-widest">
            <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-accent transition-colors">Support</a>
          </div>
        </footer>
      </main>

      <UpgradeModal 
        isOpen={isUpgradeOpen} 
        onClose={() => setIsUpgradeOpen(false)} 
        reason={upgradeReason} 
        userId={user.id} 
        onUpgradeSuccess={fetchSubscription} 
      />
    </div>
  );
}
