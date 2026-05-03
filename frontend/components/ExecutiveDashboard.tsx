"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface Metric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  category: string;
}

export function ExecutiveDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    // Mock data - в production подключить к реальным API
    setMetrics([
      // Business Metrics (для VC)
      { label: "Monthly Revenue", value: "$45K", change: "+127%", trend: "up", category: "business" },
      { label: "Active Users", value: "12.5K", change: "+89%", trend: "up", category: "business" },
      { label: "Premium Subscribers", value: "1,234", change: "+156%", trend: "up", category: "business" },
      { label: "Avg Revenue Per User", value: "$3.64", change: "+23%", trend: "up", category: "business" },
      
      // AI Performance (для Tech Giants)
      { label: "AI Prediction Accuracy", value: "78.5%", change: "+5.2%", trend: "up", category: "ai" },
      { label: "Model Latency", value: "1.2s", change: "-34%", trend: "up", category: "ai" },
      { label: "Predictions Generated", value: "45.2K", change: "+234%", trend: "up", category: "ai" },
      { label: "AI Confidence Score", value: "82%", change: "+8%", trend: "up", category: "ai" },
      
      // Trading Metrics (для Bybit)
      { label: "24h Trading Volume", value: "$12.5M", change: "+67%", trend: "up", category: "trading" },
      { label: "Successful Trades", value: "8,945", change: "+45%", trend: "up", category: "trading" },
      { label: "Avg Trade Size", value: "$1.4K", change: "+12%", trend: "up", category: "trading" },
      { label: "Win Rate", value: "72.3%", change: "+3.1%", trend: "up", category: "trading" },
      
      // On-Chain Metrics (для Nansen)
      { label: "Whales Tracked", value: "2,456", change: "+89%", trend: "up", category: "onchain" },
      { label: "Smart Money Wallets", value: "8,234", change: "+123%", trend: "up", category: "onchain" },
      { label: "Anomalies Detected", value: "1,567", change: "+234%", trend: "up", category: "onchain" },
      { label: "On-Chain Verifications", value: "45.2K", change: "+567%", trend: "up", category: "onchain" },
      
      // Network Metrics (для Mantle)
      { label: "Mantle TVL", value: "$1.25B", change: "+34%", trend: "up", category: "network" },
      { label: "Daily Transactions", value: "450K", change: "+23%", trend: "up", category: "network" },
      { label: "Active Addresses", value: "125K", change: "+45%", trend: "up", category: "network" },
      { label: "Network TPS", value: "2,500", change: "+12%", trend: "up", category: "network" },
    ]);
  }, []);

  const categories = [
    { id: "business", name: "Business Metrics", color: "#00ff88", icon: "💰" },
    { id: "ai", name: "AI Performance", color: "#00d4ff", icon: "🤖" },
    { id: "trading", name: "Trading Activity", color: "#ffa502", icon: "📈" },
    { id: "onchain", name: "On-Chain Intelligence", color: "#a855f7", icon: "🔗" },
    { id: "network", name: "Network Stats", color: "#ff4757", icon: "⚡" },
  ];

  const getMetricsByCategory = (category: string) => {
    return metrics.filter(m => m.category === category);
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up": return "text-[#00ff88]";
      case "down": return "text-[#ff4757]";
      default: return "text-[#8892a6]";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return "↗";
      case "down": return "↘";
      default: return "→";
    }
  };

  return (
    <div className="pro-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e2a47]">
        <div>
          <h2 className="text-2xl font-mono font-bold text-white uppercase tracking-wider">
            Executive Dashboard
          </h2>
          <p className="text-xs text-[#8892a6] font-mono mt-1">
            Real-time metrics for investors, partners & stakeholders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
          <span className="text-xs font-mono text-[#00ff88]">LIVE</span>
        </div>
      </div>

      {/* Key Highlights */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pro-card p-6 bg-gradient-to-br from-[#00ff88]/10 to-transparent border-[#00ff88]/30"
        >
          <div className="text-xs text-[#8892a6] font-mono mb-2 uppercase">MRR (Monthly Recurring Revenue)</div>
          <div className="text-3xl font-mono font-bold text-[#00ff88] mb-1">$45K</div>
          <div className="text-xs text-[#00ff88] font-mono">↗ +127% MoM</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="pro-card p-6 bg-gradient-to-br from-[#00d4ff]/10 to-transparent border-[#00d4ff]/30"
        >
          <div className="text-xs text-[#8892a6] font-mono mb-2 uppercase">AI Accuracy</div>
          <div className="text-3xl font-mono font-bold text-[#00d4ff] mb-1">78.5%</div>
          <div className="text-xs text-[#00d4ff] font-mono">↗ +5.2% vs baseline</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pro-card p-6 bg-gradient-to-br from-[#ffa502]/10 to-transparent border-[#ffa502]/30"
        >
          <div className="text-xs text-[#8892a6] font-mono mb-2 uppercase">24h Volume</div>
          <div className="text-3xl font-mono font-bold text-[#ffa502] mb-1">$12.5M</div>
          <div className="text-xs text-[#ffa502] font-mono">↗ +67% vs yesterday</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pro-card p-6 bg-gradient-to-br from-[#a855f7]/10 to-transparent border-[#a855f7]/30"
        >
          <div className="text-xs text-[#8892a6] font-mono mb-2 uppercase">Active Users</div>
          <div className="text-3xl font-mono font-bold text-[#a855f7] mb-1">12.5K</div>
          <div className="text-xs text-[#a855f7] font-mono">↗ +89% growth</div>
        </motion.div>
      </div>

      {/* Metrics by Category */}
      <div className="space-y-6">
        {categories.map((category, catIdx) => {
          const categoryMetrics = getMetricsByCategory(category.id);
          if (categoryMetrics.length === 0) return null;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-8 h-8 rounded-sm flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${category.color}20`, border: `1px solid ${category.color}40` }}
                >
                  {category.icon}
                </div>
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  {category.name}
                </h3>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {categoryMetrics.map((metric, idx) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: catIdx * 0.1 + idx * 0.05 }}
                    className="pro-card-hover p-4"
                  >
                    <div className="text-xs text-[#8892a6] font-mono mb-2">{metric.label}</div>
                    <div className="text-xl font-mono font-bold text-white mb-1">{metric.value}</div>
                    <div className={`text-xs font-mono font-bold ${getTrendColor(metric.trend)}`}>
                      {getTrendIcon(metric.trend)} {metric.change}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Market Opportunity */}
      <div className="mt-8 p-6 bg-gradient-to-r from-[#00d4ff]/10 to-[#a855f7]/10 border border-[#00d4ff]/30 rounded-sm">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4">
          📊 Market Opportunity
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-xs text-[#8892a6] font-mono mb-2">Total Addressable Market (TAM)</div>
            <div className="text-2xl font-mono font-bold text-[#00d4ff]">$8.5B</div>
            <div className="text-xs text-[#8892a6] font-mono mt-1">Crypto trading tools market</div>
          </div>
          <div>
            <div className="text-xs text-[#8892a6] font-mono mb-2">Serviceable Addressable Market (SAM)</div>
            <div className="text-2xl font-mono font-bold text-[#00ff88]">$1.2B</div>
            <div className="text-xs text-[#8892a6] font-mono mt-1">AI-powered trading signals</div>
          </div>
          <div>
            <div className="text-xs text-[#8892a6] font-mono mb-2">Serviceable Obtainable Market (SOM)</div>
            <div className="text-2xl font-mono font-bold text-[#ffa502]">$120M</div>
            <div className="text-xs text-[#8892a6] font-mono mt-1">Year 3 target (10% of SAM)</div>
          </div>
        </div>
      </div>

      {/* Competitive Advantages */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="pro-card p-4">
          <h4 className="text-xs font-mono font-bold text-[#00d4ff] uppercase mb-3">🎯 Competitive Advantages</h4>
          <ul className="space-y-2 text-xs font-mono text-[#8892a6]">
            <li className="flex items-start gap-2">
              <span className="text-[#00ff88]">✓</span>
              <span>Multi-agent AI system (unique in market)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00ff88]">✓</span>
              <span>On-chain verification (100% transparent)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00ff88]">✓</span>
              <span>Copy trading with AI analysis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00ff88]">✓</span>
              <span>Mantle Network integration (low fees)</span>
            </li>
          </ul>
        </div>

        <div className="pro-card p-4">
          <h4 className="text-xs font-mono font-bold text-[#ffa502] uppercase mb-3">💰 Revenue Streams</h4>
          <ul className="space-y-2 text-xs font-mono text-[#8892a6]">
            <li className="flex items-center justify-between">
              <span>Premium Subscriptions</span>
              <span className="text-[#00ff88]">$29/mo</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Copy Trading Fees</span>
              <span className="text-[#00ff88]">10% profit</span>
            </li>
            <li className="flex items-center justify-between">
              <span>API Access</span>
              <span className="text-[#00ff88]">$99/mo</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Enterprise Plans</span>
              <span className="text-[#00ff88]">$499/mo</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
