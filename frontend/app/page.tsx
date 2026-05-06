"use client";

import { useState, useEffect } from "react";
import { AIPredictionsPro } from "@/components/AIPredictionsPro";
import { AlertFeedCompact } from "@/components/AlertFeedCompact";
import { PredictionHistory } from "@/components/PredictionHistory";
import { NetworkStatus } from "@/components/NetworkStatus";
import { AIAgentDashboard } from "@/components/AIAgentDashboard";
import { CopyTradingDashboard } from "@/components/CopyTradingDashboard";
import { MantleStats } from "@/components/MantleStats";
import { ExecutiveDashboard } from "@/components/ExecutiveDashboard";
import { DEXAnalytics } from "@/components/DEXAnalytics";
import { TokenScanner } from "@/components/TokenScanner";
import { OnChainPulse } from "@/components/OnChainPulse";
import { AIChat } from "@/components/AIChat";
import { AIDailyBriefing } from "@/components/AIDailyBriefing";

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [menuOpen, setMenuOpen] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const anomaliesRes = await fetch(`${API_URL}/api/anomalies?limit=20`);
      const anomaliesData = await anomaliesRes.json();
      setAnomalies(anomaliesData.anomalies || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0e27]">
      {/* Header */}
      <header className="border-b border-[#1e2a47] sticky top-0 z-50 bg-[#0a0e27]/95 backdrop-blur-sm">
        <div className="px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#00d4ff] rounded-sm flex items-center justify-center flex-shrink-0">
                <span className="text-[#0a0e27] font-mono font-bold text-base md:text-xl">Α</span>
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-mono font-bold text-white uppercase tracking-wider leading-none">
                  AlphaPulse
                </h1>
                <p className="text-[10px] md:text-xs text-[#8892a6] font-mono hidden sm:block">
                  Smart Money Intelligence • Mantle
                </p>
              </div>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-3">
              <NetworkStatus />
              <a
                href="https://t.me/AlphaPulseBot"
                target="_blank"
                rel="noopener noreferrer"
                className="pro-btn-primary text-sm"
              >
                Telegram Bot
              </a>
            </div>

            {/* Mobile: network badge + menu */}
            <div className="flex md:hidden items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-[#141b2d] border border-[#00ff88]/30 rounded-sm">
                <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full" />
                <span className="text-[10px] font-mono text-[#00ff88]">5000</span>
              </div>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 flex flex-col items-center justify-center gap-1 pro-btn p-0"
              >
                <span className={`block w-4 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
                <span className={`block w-4 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`block w-4 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-[#1e2a47] flex flex-col gap-2">
              <NetworkStatus />
              <a
                href="https://t.me/AlphaPulseBot"
                target="_blank"
                rel="noopener noreferrer"
                className="pro-btn-primary text-center text-sm py-2"
                onClick={() => setMenuOpen(false)}
              >
                Telegram Bot
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="px-3 md:px-6 py-3 md:py-4 max-w-screen-2xl mx-auto">

        <MantleStats />

        {/* AI Multi-Agent System */}
        <div className="mb-3"><AIAgentDashboard /></div>
        {/* AI Daily Briefing + Chat + Analyzer */}
        <div className="mb-3"><AIDailyBriefing /></div>
        <div className="mb-3"><AIChat /></div>

        {/* Copy Trading Dashboard */}
        <div className="mb-3"><CopyTradingDashboard /></div>

        {/* On-Chain Pulse */}
        <div className="mb-3"><OnChainPulse /></div>

        {/* DEX Analytics */}
        <div className="mb-3"><DEXAnalytics /></div>

        {/* Token Scanner */}
        <div className="mb-3"><TokenScanner /></div>

        {/* AI Predictions + Alerts side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
          <AIPredictionsPro />
          <AlertFeedCompact anomalies={anomalies.slice(0, 10)} loading={loading} />
        </div>

        <div className="mb-3"><PredictionHistory /></div>
        <div className="mb-3"><ExecutiveDashboard /></div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1e2a47] py-4 md:py-6">
        <div className="px-4 md:px-6 text-center">
          <p className="text-[#8892a6] font-mono text-xs md:text-sm">
            Turing Test Hackathon 2026 • Mantle Network
          </p>
          <div className="flex items-center justify-center gap-3 mt-2 text-[10px] md:text-xs font-mono">
            <a href="https://github.com" className="text-[#8892a6] hover:text-[#00d4ff] transition-colors">GitHub</a>
            <span className="text-[#1e2a47]">•</span>
            <a href="https://t.me/AlphaPulseBot" className="text-[#8892a6] hover:text-[#00d4ff] transition-colors">Telegram</a>
            <span className="text-[#1e2a47]">•</span>
            <a href="https://mantlescan.xyz" className="text-[#8892a6] hover:text-[#00d4ff] transition-colors">Explorer</a>
            <span className="text-[#1e2a47]">•</span>
            <a href="https://www.mantle.xyz" className="text-[#8892a6] hover:text-[#00d4ff] transition-colors">Mantle</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
