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
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import DashboardHome from "./DashboardHome";
import ProfileAnalyzer from "./ProfileAnalyzer";
import PostGenerator from "./PostGenerator";
import ProfileOptimizer from "./ProfileOptimizer";
import ContentStrategy from "./ContentStrategy";
import PostHistory from "./PostHistory";
import DebugAI from "./DebugAI";

type User = { id: string; name: string; email: string; picture?: string; headline?: string; about?: string };
type View = 'dashboard' | 'analyzer' | 'generator' | 'optimizer' | 'strategy' | 'history' | 'settings' | 'debug';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleNavigate = (e: any) => {
      if (e.detail) setActiveView(e.detail as View);
    };
    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    { id: 'analyzer', icon: Sparkles, label: 'Profile Analyzer' },
    { id: 'generator', icon: TrendingUp, label: 'Post Generator' },
    { id: 'optimizer', icon: Zap, label: 'Profile Optimizer' },
    { id: 'strategy', icon: FileText, label: 'Content Strategy' },
    { id: 'history', icon: History, label: 'Post History' },
    { id: 'debug', icon: ShieldAlert, label: 'AI Diagnostics' },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardHome user={user} onNavigate={setActiveView} />;
      case 'analyzer': return <ProfileAnalyzer user={user} />;
      case 'generator': return <PostGenerator user={user} />;
      case 'optimizer': return <ProfileOptimizer user={user} />;
      case 'strategy': return <ContentStrategy user={user} />;
      case 'history': return <PostHistory user={user} />;
      case 'debug': return <DebugAI />;
      case 'settings': return <div className="p-8"><h2 className="text-3xl font-display font-bold mb-8">Settings</h2><div className="card">Account settings coming soon.</div></div>;
      default: return <DashboardHome user={user} onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-surface border-r border-border transition-all duration-300 flex flex-col z-50 ${isSidebarOpen ? 'w-[280px]' : 'w-[80px]'}`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent2 rounded-lg flex items-center justify-center">
                <Zap className="text-bg w-5 h-5 fill-current" />
              </div>
              <span className="font-display text-xl font-extrabold tracking-tight">LinkBoost</span>
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
                <div className="text-xs text-muted truncate">{user.email}</div>
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
        <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-md border-b border-border px-8 py-4 flex justify-between items-center">
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
            <button className="btn-primary py-2 px-4 text-sm h-10">
              <Plus className="w-4 h-4" />
              New Post
            </button>
          </div>
        </header>

        {/* View Container */}
        <div className="p-8 flex-grow">
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
      </main>
    </div>
  );
}
