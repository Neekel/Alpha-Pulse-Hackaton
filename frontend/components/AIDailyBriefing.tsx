"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Briefing {
  briefing: string;
  date: string;
  generated_at: string;
  stats: {
    whale_count: number;
    exit_count: number;
    cluster_count: number;
    total_volume: number;
    gas_gwei: number;
    block: number;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const STORAGE_KEY = "alphapulse_daily_briefing";

function parseBriefing(text: string) {
  const sections: { title: string; content: string }[] = [];
  const lines = text.split("\n").filter(l => l.trim());
  let current: { title: string; content: string } | null = null;

  for (const line of lines) {
    const boldMatch = line.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      if (current) sections.push(current);
      current = { title: boldMatch[1], content: line.replace(/^\*\*(.+?)\*\*\s*—?\s*/, "").trim() };
    } else if (current) {
      current.content += (current.content ? " " : "") + line.replace(/^[-•]\s*/, "").trim();
    }
  }
  if (current) sections.push(current);
  return sections.length > 0 ? sections : [{ title: "BRIEFING", content: text }];
}

const sectionColors: Record<string, string> = {
  "MARKET OVERVIEW": "#00d4ff",
  "KEY SIGNALS": "#00ff88",
  "RISK ASSESSMENT": "#ff4757",
  "TODAY'S OUTLOOK": "#ffa502",
};

export function AIDailyBriefing() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const today = new Date().toISOString().slice(0, 10);
        if (parsed.date === today) {
          setBriefing(parsed);
          return;
        }
      } catch {}
    }
    // Auto-load on first visit
    loadBriefing();
  }, []);

  const loadBriefing = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/ai/daily-briefing`);
      if (r.ok) {
        const data = await r.json();
        setBriefing(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch {} finally { setLoading(false); }
  };

  const sections = briefing ? parseBriefing(briefing.briefing) : [];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="pro-card p-5 relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, #00d4ff, #ffa502, #00ff88)" }} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#1e2a47]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📰</span>
            <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wider">AI Daily Briefing</h2>
          </div>
          <p className="text-sm text-[#8892a6] font-mono">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          {briefing && (
            <span className="text-xs font-mono text-[#8892a6]">
              Generated {new Date(briefing.generated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button onClick={loadBriefing} disabled={loading}
            className="pro-btn text-sm font-mono py-2 px-4 disabled:opacity-50">
            {loading ? "⟳ Generating..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div className="text-4xl mb-4" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>⟳</motion.div>
          <div className="text-[#00d4ff] font-mono">Generating today's briefing...</div>
          <div className="text-sm text-[#8892a6] font-mono mt-1">Analyzing on-chain data with AI</div>
        </div>
      )}

      {!loading && !briefing && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-3">📊</div>
          <div className="text-[#8892a6] font-mono mb-3">No briefing yet for today</div>
          <button onClick={loadBriefing} className="pro-btn-primary text-sm font-mono py-2 px-6">Generate Briefing</button>
        </div>
      )}

      {!loading && briefing && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Stats row */}
            {briefing.stats && (
              <div className="flex flex-wrap gap-4 mb-5 p-3 bg-[#1e2a47]/30 rounded-sm">
                {[
                  { label: "Whale Buys", value: briefing.stats.whale_count, color: "text-[#00d4ff]" },
                  { label: "Exits", value: briefing.stats.exit_count, color: "text-[#ff4757]" },
                  { label: "Clusters", value: briefing.stats.cluster_count, color: "text-[#a855f7]" },
                  { label: "Volume", value: `$${(briefing.stats.total_volume / 1000).toFixed(0)}K`, color: "text-[#00ff88]" },
                  { label: "Gas", value: `${briefing.stats.gas_gwei} Gwei`, color: "text-[#8892a6]" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-xs text-[#8892a6] font-mono">{item.label}:</span>
                    <span className={`text-sm font-mono font-bold tabular-nums ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sections.slice(0, expanded ? undefined : 4).map((section, i) => {
                const color = sectionColors[section.title] || "#8892a6";
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-sm border"
                    style={{ borderColor: `${color}30`, background: `${color}08` }}>
                    <div className="text-xs font-mono font-bold uppercase mb-2" style={{ color }}>{section.title}</div>
                    <p className="text-sm font-mono text-white leading-relaxed">{section.content}</p>
                  </motion.div>
                );
              })}
            </div>

            {sections.length > 4 && (
              <button onClick={() => setExpanded(!expanded)}
                className="mt-3 text-sm font-mono text-[#00d4ff] hover:text-[#00b8e6] transition-colors">
                {expanded ? "Show less ↑" : `Show more (${sections.length - 4} more) ↓`}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
