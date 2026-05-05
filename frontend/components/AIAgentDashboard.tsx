"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface Agent {
  name: string;
  role: string;
  status: string;
  last_analysis: string | null;
}

interface AgentResult {
  agent: string;
  status: string;
  data?: any;
  error?: string;
}

interface Analysis {
  timestamp: string;
  agents: AgentResult[];
  synthesis: {
    status: string;
    recommendation: string;
    agents_consulted: number;
  };
  status: string;
}

export function AIAgentDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchAgentStatus();
    const interval = setInterval(fetchAgentStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAgentStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ai-agents/status`);
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
      }
    } catch (error) {
      console.error("Failed to fetch agent status:", error);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch(`${API_URL}/api/ai-agents/analyze`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (error) {
      console.error("Failed to run analysis:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "success":
        return "text-[#00ff88]";
      case "analyzing":
        return "text-[#00d4ff]";
      case "error":
        return "text-[#ff4757]";
      default:
        return "text-[#8892a6]";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "success":
        return "✓";
      case "analyzing":
        return "⟳";
      case "error":
        return "✗";
      default:
        return "○";
    }
  };

  return (
    <div className="pro-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e2a47]">
        <div>
          <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
            AI Multi-Agent System
          </h2>
          <p className="text-xs text-[#8892a6] font-mono mt-1">
            4 AI agents analyze whales, DEX, risk & sentiment → Generate trading signals
          </p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="pro-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {analyzing ? "Analyzing..." : "Run Analysis"}
        </button>
      </div>

      {/* Agent Status - compact 4 columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {agents.map((agent) => (
          <div key={agent.name} className="pro-card-hover px-3 py-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#00d4ff] rounded-sm flex items-center justify-center font-mono text-sm font-bold text-[#0a0e27] flex-shrink-0">
              {agent.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-mono font-bold text-white truncate">{agent.name}</div>
              <div className="text-xs font-mono text-[#8892a6] truncate">{agent.role.split(" ").slice(0, 3).join(" ")}</div>
            </div>
            <div className={`text-base font-mono flex-shrink-0 ${getStatusColor(agent.status)}`}>
              {getStatusIcon(agent.status)}
            </div>
          </div>
        ))}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pro-card p-6 bg-[#1e2a47]/30"
        >
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4">
            Latest Analysis
          </h3>

          {/* Agent Results */}
          <div className="space-y-3 mb-6">
            {analysis.agents.map((result, idx) => {
              let parsed: any = null;
              try {
                const raw = result.data?.analysis || "";
                const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/({[\s\S]*})/);
                parsed = JSON.parse(jsonMatch ? jsonMatch[1] : raw);
              } catch {}

              return (
                <div key={idx} className="flex items-start gap-3 p-3 bg-[#141b2d] rounded-sm">
                  <div className={`text-sm font-mono ${getStatusColor(result.status)}`}>
                    {getStatusIcon(result.status)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-mono font-bold text-white mb-1">{result.agent}</div>
                    {parsed ? (
                      <div className="flex flex-wrap gap-2 text-xs font-mono">
                        {parsed.pattern && <span className="px-2 py-0.5 bg-[#1e2a47] text-[#00d4ff]">Pattern: {parsed.pattern}</span>}
                        {parsed.risk && <span className={`px-2 py-0.5 bg-[#1e2a47] ${parsed.risk === "HIGH" ? "text-[#ff4757]" : parsed.risk === "MEDIUM" ? "text-[#ffa502]" : "text-[#00ff88]"}`}>Risk: {parsed.risk}</span>}
                        {parsed.health && <span className={`px-2 py-0.5 bg-[#1e2a47] ${parsed.health === "WARNING" ? "text-[#ffa502]" : "text-[#00ff88]"}`}>{parsed.health}</span>}
                        {parsed.sentiment && <span className={`px-2 py-0.5 bg-[#1e2a47] ${parsed.sentiment === "BULLISH" ? "text-[#00ff88]" : parsed.sentiment === "BEARISH" ? "text-[#ff4757]" : "text-[#ffa502]"}`}>{parsed.sentiment}</span>}
                        {parsed.risk_level && <span className={`px-2 py-0.5 bg-[#1e2a47] ${parsed.risk_level === "HIGH" ? "text-[#ff4757]" : parsed.risk_level === "MEDIUM" ? "text-[#ffa502]" : "text-[#00ff88]"}`}>Risk: {parsed.risk_level}</span>}
                        {parsed.insight && <span className="text-[#8892a6] mt-1 w-full">{parsed.insight}</span>}
                        {parsed.recommendation && <span className="text-[#8892a6] mt-1 w-full">{parsed.recommendation}</span>}
                      </div>
                    ) : result.data?.analysis ? (
                      <div className="text-xs text-[#8892a6] font-mono">{String(result.data.analysis).replace(/```json|```/g, "").substring(0, 120)}...</div>
                    ) : null}
                    {result.error && <div className="text-xs text-[#ff4757] font-mono">Error: {result.error}</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Synthesis */}
          {analysis.synthesis.status === "success" && (() => {
            let rec: any = null;
            try {
              const raw = analysis.synthesis.recommendation;
              const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/({[\s\S]*})/);
              rec = JSON.parse(jsonMatch ? jsonMatch[1] : raw);
            } catch {}

            return (
              <div className="p-4 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-[#00d4ff] rounded-sm flex items-center justify-center font-mono text-xs font-bold text-[#0a0e27]">I</div>
                  <h4 className="text-sm font-mono font-bold text-[#00d4ff] uppercase">Final Recommendation</h4>
                </div>
                {rec ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className={`text-2xl font-mono font-bold ${rec.action === "BUY" ? "text-[#00ff88]" : rec.action === "SELL" ? "text-[#ff4757]" : "text-[#ffa502]"}`}>
                        {rec.action}
                      </span>
                      {rec.confidence && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#8892a6] font-mono">Confidence:</span>
                          <span className="text-sm font-mono font-bold text-[#00d4ff]">{rec.confidence}%</span>
                        </div>
                      )}
                      {rec.risk_reward && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#8892a6] font-mono">R/R:</span>
                          <span className="text-sm font-mono text-[#ffa502]">{rec.risk_reward}</span>
                        </div>
                      )}
                      {rec.time_horizon && (
                        <span className="px-2 py-0.5 bg-[#1e2a47] text-xs font-mono text-[#8892a6]">{rec.time_horizon}</span>
                      )}
                    </div>
                    {rec.reasoning && (
                      <p className="text-xs text-[#8892a6] font-mono leading-relaxed">{rec.reasoning}</p>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-white font-mono whitespace-pre-wrap">
                    {analysis.synthesis.recommendation.replace(/```json|```/g, "")}
                  </div>
                )}
                <div className="mt-3 text-xs text-[#8892a6] font-mono">
                  Based on {analysis.synthesis.agents_consulted} agent analyses
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* Info Banner */}
      <div className="mt-4 px-3 py-2 bg-[#1e2a47]/20 border border-[#1e2a47] rounded-sm">
        <div className="text-xs text-[#8892a6] font-mono">
          <span className="text-[#00d4ff] font-bold">How it works:</span> 4 specialized agents (whales, DEX, risk, sentiment) analyze data in parallel → Orchestrator synthesizes final recommendation.
        </div>
      </div>
    </div>
  );
}
