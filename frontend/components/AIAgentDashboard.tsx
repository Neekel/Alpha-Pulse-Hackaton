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

      {/* Agent Status Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {agents.map((agent, idx) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="pro-card-hover p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#00d4ff] rounded-sm flex items-center justify-center font-mono text-sm font-bold text-[#0a0e27]">
                  {agent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-white">
                    {agent.name}
                  </h3>
                  <p className="text-xs text-[#8892a6] font-mono mt-1">
                    {agent.role}
                  </p>
                </div>
              </div>
              <div className={`text-lg font-mono ${getStatusColor(agent.status)}`}>
                {getStatusIcon(agent.status)}
              </div>
            </div>
            {agent.last_analysis && (
              <div className="text-xs text-[#8892a6] font-mono">
                Last: {new Date(agent.last_analysis).toLocaleTimeString()}
              </div>
            )}
          </motion.div>
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
            {analysis.agents.map((result, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-[#141b2d] rounded-sm"
              >
                <div className={`text-sm font-mono ${getStatusColor(result.status)}`}>
                  {getStatusIcon(result.status)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-mono font-bold text-white mb-1">
                    {result.agent}
                  </div>
                  {result.data && (
                    <div className="text-xs text-[#8892a6] font-mono">
                      {JSON.stringify(result.data.analysis).substring(0, 150)}...
                    </div>
                  )}
                  {result.error && (
                    <div className="text-xs text-[#ff4757] font-mono">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Synthesis */}
          {analysis.synthesis.status === "success" && (
            <div className="p-4 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-[#00d4ff] rounded-sm flex items-center justify-center font-mono text-xs font-bold text-[#0a0e27]">
                  Σ
                </div>
                <h4 className="text-sm font-mono font-bold text-[#00d4ff] uppercase">
                  Final Recommendation
                </h4>
              </div>
              <div className="text-sm text-white font-mono whitespace-pre-wrap">
                {analysis.synthesis.recommendation}
              </div>
              <div className="mt-3 text-xs text-[#8892a6] font-mono">
                Based on {analysis.synthesis.agents_consulted} agent analyses
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Info Banner */}
      <div className="mt-6 p-4 bg-[#1e2a47]/20 border border-[#1e2a47] rounded-sm">
        <div className="text-xs text-[#8892a6] font-mono">
          <span className="text-[#00d4ff] font-bold">How it works:</span> Each AI agent specializes in a different aspect (whales, DEX, risk, sentiment). They analyze data in parallel, then the Orchestrator synthesizes their insights into a final recommendation.
        </div>
      </div>
    </div>
  );
}
