import React, { useState, useEffect } from "react";
import Landing from "./components/Landing";
import Dashboard from "./components/Dashboard";

type User = { id: string; name: string; email: string; picture?: string; headline?: string; about?: string };

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUserId = localStorage.getItem("lb_user_id");
    if (savedUserId) {
      fetchUser(savedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/user/${userId}`);
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        localStorage.removeItem("lb_user_id");
      }
    } catch (err) {
      console.error("Failed to fetch user", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (userId: string) => {
    localStorage.setItem("lb_user_id", userId);
    fetchUser(userId);
  };

  const handleLogout = () => {
    localStorage.removeItem("lb_user_id");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <span className="font-display text-xl font-bold text-muted animate-pulse">LinkBoost AI</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <Landing onAuthSuccess={handleAuthSuccess} />
      )}
    </>
  );
}
