"use client";

import { useState, useEffect } from "react";
import { AIPredictionsPro } from "@/components/AIPredictionsPro";
import { AlertFeedCompact } from "@/components/AlertFeedCompact";
import { PredictionHistory } from "@/components/PredictionHistory";
import { StatsPanel } from "@/components/StatsPanel";
import { ContractInfo } from "@/components/ContractInfo";
import { NetworkStatus } from "@/components/NetworkStatus";
import { AIAgentDashboard } from "@/components/AIAgentDashboard";
import { CopyTradingDashboard } from "@/components/CopyTradingDashboard";
import { MantleStats } from "@/components/MantleStats";

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, anomaliesRes] = await Promise.all([
        fetch(`${API_URL}/api/stats`),
        fetch(`${API_URL}/api/anomalies?limit=20`),
      ]);

      const statsData = await statsRes.json();
      const anomaliesData = await anomaliesRes.json();

      setStats(statsData);
      setAnomalies(anomaliesData.anomalies || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0e27] relative">
      {/* Professional Header */}
      <header className="border-b border-[#1e2a47] backdrop-blur-sm sticky top-0 z-50 bg-[#0a0e27]/95">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#00d4ff] rounded-sm flex items-center justify-center">
                <span className="text-[#0a0e27] font-mono font-bold text-xl">Α</span>
              </div>
              <div>
                <h1 className="text-2xl font-mono font-bold text-white uppercase tracking-wider">
                  AlphaPulse
                </h1>
                <p className="text-xs text-[#8892a6] font-mono">
                  Smart Money Intelligence • Powered by Mantle
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NetworkStatus />
              <a
                href="https://t.me/AlphaPulseBot"
                target="_blank"
                rel="noopener noreferrer"
                className="pro-btn-primary"
              >
                Telegram Bot
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        {stats && <StatsPanel stats={stats} />}

        {/* Mantle Network Stats */}
        <div className="mb-8">
          <MantleStats />
        </div>

        {/* Contract Info */}
        <div className="mb-8">
          <ContractInfo />
        </div>

        {/* AI Multi-Agent System */}
        <div className="mb-8">
          <AIAgentDashboard />
        </div>

        {/* Copy Trading Dashboard */}
        <div className="mb-8">
          <CopyTradingDashboard />
        </div>

        {/* Main Grid: AI Predictions (50%) + Live Alerts (50%) */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="h-[600px]">
            <AIPredictionsPro />
          </div>
          <div className="h-[600px]">
            <AlertFeedCompact anomalies={anomalies.slice(0, 10)} loading={loading} />
          </div>
        </div>

        {/* Prediction History */}
        <div className="mb-8">
          <PredictionHistory />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1e2a47] py-6 mt-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-[#8892a6] font-mono text-sm">
            Built for Turing Test Hackathon 2026 • Powered by Mantle Network
          </p>
          <p className="text-[#8892a6] font-mono text-xs mt-2">
            <a href="https://github.com" className="hover:text-[#00d4ff] transition-colors">GitHub</a>
            {" • "}
            <a href="https://t.me/AlphaPulseBot" className="hover:text-[#00d4ff] transition-colors">Telegram</a>
            {" • "}
            <a href="https://mantlescan.xyz" className="hover:text-[#00d4ff] transition-colors">Explorer</a>
            {" • "}
            <a href="https://www.mantle.xyz" className="hover:text-[#00d4ff] transition-colors">Mantle</a>
          </p>
        </div>
      </footer>
    </main>
  );
}
