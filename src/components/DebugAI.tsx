import React, { useState } from "react";
import { ShieldAlert, CheckCircle2, XCircle, RefreshCw, AlertTriangle, Terminal } from "lucide-react";
import { motion } from "motion/react";

export default function DebugAI() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/test-ai");
      if (!res.ok) throw new Error("Failed to run AI tests");
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "error": return <XCircle className="w-5 h-5 text-rose-500" />;
      case "missing": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <RefreshCw className="w-5 h-5 text-muted animate-spin" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-text flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-accent" />
            AI System Diagnostics
          </h2>
          <p className="text-muted mt-2">Test and verify your AI provider configurations and API keys.</p>
        </div>
        <button 
          onClick={runTests}
          disabled={loading}
          className="btn-primary"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Testing...' : 'Run Diagnostics'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['kimi', 'gemini', 'perplexity', 'claude'].map((provider) => {
          const data = results ? results[provider] : null;
          return (
            <motion.div 
              key={provider}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 border border-border hover:border-accent/30 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold capitalize flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-accent" />
                  {provider}
                </h3>
                {data ? getStatusIcon(data.status) : <div className="w-5 h-5 rounded-full bg-surface2" />}
              </div>

              {!data ? (
                <div className="text-sm text-muted italic">No diagnostic data. Run tests to see results.</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Status:</span>
                    <span className={`font-medium ${
                      data.status === 'success' ? 'text-emerald-500' : 
                      data.status === 'error' ? 'text-rose-500' : 'text-amber-500'
                    }`}>
                      {data.status.toUpperCase()}
                    </span>
                  </div>
                  
                  {data.status === 'error' && (
                    <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg text-xs text-rose-500 font-mono break-words">
                      {data.message}
                    </div>
                  )}

                  {data.status === 'success' && (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-xs text-emerald-500 font-mono italic">
                      " {data.response} "
                    </div>
                  )}

                  {data.status === 'missing' && (
                    <div className="text-sm text-amber-500/80 italic">
                      API key not found in environment variables.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-12 p-6 bg-surface2 rounded-2xl border border-border">
        <h4 className="font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Troubleshooting Guide
        </h4>
        <ul className="space-y-3 text-sm text-muted">
          <li className="flex gap-2">
            <span className="text-accent font-bold">•</span>
            <span><strong>Invalid Authentication:</strong> Double check your API key for extra spaces or missing characters. Ensure you clicked "Restart Server" after adding it.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent font-bold">•</span>
            <span><strong>Insufficient Credits:</strong> Most APIs (Claude, Perplexity) require a paid balance. Check your billing dashboard.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent font-bold">•</span>
            <span><strong>API Key Not Valid (Gemini):</strong> Ensure the "Generative Language API" is enabled in your Google Cloud project. Try generating a fresh key.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
