"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface Agent { name: string; role: string; status: string; last_analysis: string | null; }
interface AgentResult { agent: string; status: string; data?: any; error?: string; }
interface Analysis {
  timestamp: string;
  agents: AgentResult[];
  synthesis: { status: string; recommendation: string; agents_consulted: number };
  status: string;
}

const AGENT_ICONS: Record<string, string> = {
  "Whale Tracker": "🐋",
  "DEX Analyzer": "📊",
  "Risk Assessor": "🛡",
  "Sentiment Analyzer": "🧠",
};

const AGENT_COLORS: Record<string, string> = {
  "Whale Tracker": "#00d4ff",
  "DEX Analyzer": "#a855f7",
  "Risk Assessor": "#ff4757",
  "Sentiment Analyzer": "#00ff88",
};

function parseJSON(raw: string) {
  try {
    const m = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/({[\s\S]*})/);
    return JSON.parse(m ? m[1] : raw);
  } catch { return null; }
}

function AgentCard({ agent, result }: { agent: Agent; result?: AgentResult }) {
  const color = AGENT_COLORS[agent.name] || "#8892a6";
  const icon = AGENT_ICONS[agent.name] || "●";
  const isRunning = agent.status === "analyzing";
  const isDone = agent.status === "completed";

  let parsed: any = null;
  if (result?.data?.analysis) parsed = parseJSON(result.data.analysis);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pro-card p-5 relative overflow-hidden"
      style={{ borderColor: isDone ? `${color}40` : undefined }}
    >
      {/* Glow line on top */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: isDone ? color : "transparent" }} />

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{icon}</div>
          <div>
            <div className="text-base font-mono font-bold text-white">{agent.name}</div>
            <div className="text-xs text-[#8892a6] font-mono mt-0.5">{agent.role}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <motion.div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }} />
          )}
          {isDone && <span className="text-lg" style={{ color }}>✓</span>}
          {!isRunning && !isDone && <span className="text-[#8892a6] text-lg">○</span>}
        </div>
      </div>

      {/* Result badges */}
      {parsed && (
        <div className="flex flex-wrap gap-2 mt-2">
          {parsed.pattern && (
            <span className="text-xs font-mono px-2 py-1 rounded-sm" style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
              Pattern: {parsed.pattern}
            </span>
          )}
          {parsed.risk && (
            <span className={`text-xs font-mono px-2 py-1 rounded-sm ${parsed.risk === "HIGH" ? "bg-[#ff4757]/20 text-[#ff4757] border border-[#ff4757]/40" : parsed.risk === "MEDIUM" ? "bg-[#ffa502]/20 text-[#ffa502] border border-[#ffa502]/40" : "bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/40"}`}>
              Risk: {parsed.risk}
            </span>
          )}
          {parsed.health && (
            <span className={`text-xs font-mono px-2 py-1 rounded-sm ${parsed.health === "WARNING" || parsed.health === "CRITICAL" ? "bg-[#ffa502]/20 text-[#ffa502] border border-[#ffa502]/40" : "bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/40"}`}>
              {parsed.health}
            </span>
          )}
          {parsed.sentiment && (
            <span className={`text-xs font-mono px-2 py-1 rounded-sm ${parsed.sentiment === "BULLISH" ? "bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/40" : parsed.sentiment === "BEARISH" ? "bg-[#ff4757]/20 text-[#ff4757] border border-[#ff4757]/40" : "bg-[#ffa502]/20 text-[#ffa502] border border-[#ffa502]/40"}`}>
              {parsed.sentiment}
            </span>
          )}
          {parsed.risk_level && (
            <span className={`text-xs font-mono px-2 py-1 rounded-sm ${parsed.risk_level === "HIGH" || parsed.risk_level === "CRITICAL" ? "bg-[#ff4757]/20 text-[#ff4757] border border-[#ff4757]/40" : parsed.risk_level === "MEDIUM" ? "bg-[#ffa502]/20 text-[#ffa502] border border-[#ffa502]/40" : "bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/40"}`}>
              Risk: {parsed.risk_level}
            </span>
          )}
        </div>
      )}

      {/* Insight text */}
      {parsed && (parsed.insight || parsed.recommendation || parsed.outlook || parsed.driver) && (
        <div className="mt-3 text-sm font-mono text-[#8892a6] leading-relaxed">
          {parsed.insight || parsed.recommendation || parsed.outlook || parsed.driver}
        </div>
      )}

      {result?.error && (
        <div className="mt-2 text-sm font-mono text-[#ff4757]">Error: {result.error}</div>
      )}
    </motion.div>
  );
}

export function AIAgentDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchStatus();
    const iv = setInterval(fetchStatus, 30000);
    return () => clearInterval(iv);
  }, []);

  const fetchStatus = async () => {
    try {
      const r = await fetch(`${API_URL}/api/ai-agents/status`);
      if (r.ok) { const d = await r.json(); setAgents(d.agents || []); }
    } catch {}
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const r = await fetch(`${API_URL}/api/ai-agents/analyze`, { method: "POST" });
      if (r.ok) setAnalysis(await r.json());
    } catch {} finally { setAnalyzing(false); }
  };

  // Map agent results by name
  const resultMap: Record<string, AgentResult> = {};
  if (analysis) analysis.agents.forEach(r => { resultMap[r.agent] = r; });

  // Parse synthesis
  let rec: any = null;
  if (analysis?.synthesis?.status === "success") rec = parseJSON(analysis.synthesis.recommendation);

  return (
    <div className="pro-card p-5 relative overflow-hidden">
      {/* Animated background glow when analyzing */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 70%)" }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e2a47]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-[#00d4ff] rounded-sm flex items-center justify-center">
              <span className="text-[#0a0e27] font-bold text-base">AI</span>
            </div>
            <h2 className="text-2xl font-mono font-bold text-white uppercase tracking-wider">
              AI Multi-Agent System
            </h2>
          </div>
          <p className="text-sm text-[#8892a6] font-mono">
            4 specialized agents analyze whales, DEX, risk &amp; sentiment in parallel → Orchestrator synthesizes final signal
          </p>
        </div>
        <motion.button
          onClick={runAnalysis}
          disabled={analyzing}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="pro-btn-primary text-sm font-mono py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
        >
          {analyzing ? (
            <span className="flex items-center gap-2">
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>⟳</motion.span>
              Analyzing...
            </span>
          ) : "▶ Run Analysis"}
        </motion.button>
      </div>

      {/* Agent Cards — 2x2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {agents.map((agent) => (
          <AgentCard key={agent.name} agent={agent} result={resultMap[agent.name]} />
        ))}
      </div>

      {/* Final Recommendation — WOW section */}
      <AnimatePresence>
        {rec && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative overflow-hidden rounded-sm"
            style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(0,255,136,0.06) 100%)", border: "1px solid rgba(0,212,255,0.3)" }}
          >
            {/* Top accent line */}
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #00d4ff, #00ff88)" }} />

            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-[#00d4ff] rounded-sm flex items-center justify-center font-mono text-sm font-bold text-[#0a0e27]">Σ</div>
                <div>
                  <div className="text-xs text-[#8892a6] font-mono uppercase tracking-wider">Orchestrator Synthesis</div>
                  <div className="text-lg font-mono font-bold text-[#00d4ff] uppercase">Final Recommendation</div>
                </div>
                <div className="ml-auto text-xs text-[#8892a6] font-mono">
                  Based on {analysis?.synthesis.agents_consulted} agents
                </div>
              </div>

              {/* BIG action */}
              <div className="flex items-center gap-6 mb-5">
                <div className={`text-6xl font-mono font-bold tabular-nums ${rec.action === "BUY" ? "text-[#00ff88]" : rec.action === "SELL" ? "text-[#ff4757]" : "text-[#ffa502]"}`}>
                  {rec.action}
                </div>
                <div className="flex flex-col gap-2">
                  {rec.confidence && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#8892a6] font-mono uppercase w-24">Confidence</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-[#1e2a47] rounded-full overflow-hidden">
                          <motion.div className="h-full bg-[#00d4ff]" initial={{ width: 0 }}
                            animate={{ width: `${rec.confidence}%` }} transition={{ duration: 1 }} />
                        </div>
                        <span className="text-xl font-mono font-bold text-[#00d4ff] tabular-nums">{rec.confidence}%</span>
                      </div>
                    </div>
                  )}
                  {rec.risk_reward && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#8892a6] font-mono uppercase w-24">Risk/Reward</span>
                      <span className="text-xl font-mono font-bold text-[#ffa502]">{rec.risk_reward}</span>
                    </div>
                  )}
                  {rec.time_horizon && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#8892a6] font-mono uppercase w-24">Horizon</span>
                      <span className="text-sm font-mono px-3 py-1 bg-[#1e2a47] text-[#8892a6] rounded-sm">{rec.time_horizon}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reasoning */}
              {rec.reasoning && (
                <div className="p-4 bg-[#0a0e27]/60 rounded-sm border border-[#1e2a47]">
                  <div className="text-xs text-[#8892a6] font-mono uppercase mb-2">AI Reasoning</div>
                  <p className="text-sm font-mono text-white leading-relaxed">{rec.reasoning}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!rec && !analyzing && (
        <div className="text-center py-6 border border-dashed border-[#1e2a47] rounded-sm">
          <div className="text-[#8892a6] font-mono mb-2">No analysis yet</div>
          <div className="text-sm text-[#8892a6]/60 font-mono">Click "Run Analysis" to start all 4 agents</div>
        </div>
      )}
    </div>
  );
}
