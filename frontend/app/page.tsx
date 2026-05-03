"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertFeed } from "@/components/AlertFeed";
import { StatsPanel } from "@/components/StatsPanel";
import { AlphaSearch } from "@/components/AlphaSearch";
import { GasTracker } from "@/components/GasTracker";
import { LiveChart } from "@/components/LiveChart";
import { ContractInfo } from "@/components/ContractInfo";
import { AIPredictions } from "@/components/AIPredictions";
import { NetworkStatus } from "@/components/NetworkStatus";

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showParticles, setShowParticles] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    setIsMounted(true);
    setShowParticles(true);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
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
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Floating Particles */}
      {isMounted && showParticles && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
              initial={{
                x: Math.random() * 1000,
                y: Math.random() * 1000,
              }}
              animate={{
                y: [null, Math.random() * 1000],
                x: [null, Math.random() * 1000],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-purple-500/20 backdrop-blur-sm sticky top-0 z-50 bg-gray-900/50">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-2xl">🔮</span>
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                  AlphaPulse
                </h1>
                <p className="text-gray-400 mt-1 text-sm">
                  AI-powered Smart Money detector • Mantle Network
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NetworkStatus />
              <motion.a
                href="https://t.me/AlphaPulseBot"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📱 Join Telegram
              </motion.a>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-block mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-300 text-sm font-semibold">
              🏆 Turing Test Hackathon 2026 • $100K Prize Pool
            </span>
          </motion.div>
          
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Whales Don't Sleep.
            <br />
            <motion.span
              className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              Now You Know What They Do.
            </motion.span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
            Real-time detection of smart money movements on Mantle Network.
            <br />
            <span className="text-purple-400 font-semibold">AI-explained insights • On-chain verifiable predictions</span>
          </p>

          {/* Key Metrics Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6 mb-8"
          >
            {[
              { icon: "🐋", label: "Whale Tracking", value: "Real-time" },
              { icon: "✅", label: "On-Chain Verified", value: "100%" },
              { icon: "🤖", label: "AI Powered", value: "Groq LLM" },
              { icon: "⚡", label: "Response Time", value: "<2s" },
            ].map((metric, i) => (
              <motion.div
                key={metric.label}
                className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl px-6 py-3 hover:border-purple-500/60 transition-colors"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{metric.icon}</span>
                  <div className="text-left">
                    <div className="text-xs text-gray-400">{metric.label}</div>
                    <div className="text-sm font-bold text-white">{metric.value}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Stats Overview */}
        {stats && <StatsPanel stats={stats} />}

        {/* Contract Info Banner */}
        <ContractInfo />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mt-12">
          {/* Left Column - Alert Feed */}
          <div className="lg:col-span-2 space-y-6">
            <AlertFeed anomalies={anomalies} loading={loading} />
            <LiveChart anomalies={anomalies} />
          </div>

          {/* Right Column - Tools */}
          <div className="space-y-6">
            <AlphaSearch />
            <GasTracker />
            <AIPredictions />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-white mb-12">
          Killer Features
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: "🐋",
              title: "Whale Tracking",
              description: "Detect purchases >$50K in real-time",
            },
            {
              icon: "🔴",
              title: "Liquidity Exits",
              description: "Alert on >20% pool withdrawals",
            },
            {
              icon: "🎯",
              title: "Smart Clusters",
              description: "Identify coordinated buying patterns",
            },
            {
              icon: "✅",
              title: "Verifiable",
              description: "All predictions on-chain, timestamped",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/50 transition-colors"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h4 className="text-xl font-bold text-white mb-2">
                {feature.title}
              </h4>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>Built for Turing Test Hackathon 2026 on Mantle Network</p>
          <p className="mt-2 text-sm">
            <a
              href="https://github.com"
              className="hover:text-purple-400 transition-colors"
            >
              GitHub
            </a>
            {" · "}
            <a
              href="https://t.me/AlphaPulseBot"
              className="hover:text-purple-400 transition-colors"
            >
              Telegram Bot
            </a>
            {" · "}
            <a
              href="https://sepolia.mantlescan.xyz"
              className="hover:text-purple-400 transition-colors"
            >
              Mantle Explorer
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
