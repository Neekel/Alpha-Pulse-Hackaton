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

      {/* Key Highlights - 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="pro-card p-4 border-[#00ff88]/30" style={{background:"linear-gradient(135deg,rgba(0,255,136,0.08),transparent)"}}>
          <div className="text-[9px] text-[#8892a6] font-mono mb-1 uppercase">MRR</div>
          <div className="text-2xl font-mono font-bold text-[#00ff88]">$45K</div>
          <div className="text-[10px] text-[#00ff88] font-mono">↗ +127% MoM</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="pro-card p-4 border-[#00d4ff]/30" style={{background:"linear-gradient(135deg,rgba(0,212,255,0.08),transparent)"}}>
          <div className="text-[9px] text-[#8892a6] font-mono mb-1 uppercase">AI Accuracy</div>
          <div className="text-2xl font-mono font-bold text-[#00d4ff]">78.5%</div>
          <div className="text-[10px] text-[#00d4ff] font-mono">↗ +5.2% baseline</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="pro-card p-4 border-[#ffa502]/30" style={{background:"linear-gradient(135deg,rgba(255,165,2,0.08),transparent)"}}>
          <div className="text-[9px] text-[#8892a6] font-mono mb-1 uppercase">24h Volume</div>
          <div className="text-2xl font-mono font-bold text-[#ffa502]">$12.5M</div>
          <div className="text-[10px] text-[#ffa502] font-mono">↗ +67% yesterday</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="pro-card p-4 border-[#a855f7]/30" style={{background:"linear-gradient(135deg,rgba(168,85,247,0.08),transparent)"}}>
          <div className="text-[9px] text-[#8892a6] font-mono mb-1 uppercase">Active Users</div>
          <div className="text-2xl font-mono font-bold text-[#a855f7]">12.5K</div>
          <div className="text-[10px] text-[#a855f7] font-mono">↗ +89% growth</div>
        </motion.div>
      </div>

      {/* Metrics by Category - 2 cols on mobile, 4 on desktop */}
      <div className="space-y-5">
        {categories.map((category, catIdx) => {
          const categoryMetrics = getMetricsByCategory(category.id);
          if (categoryMetrics.length === 0) return null;
          return (
            <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: catIdx * 0.1 }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-sm flex items-center justify-center text-sm"
                  style={{ backgroundColor: `${category.color}20`, border: `1px solid ${category.color}40` }}>
                  {category.icon}
                </div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">{category.name}</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {categoryMetrics.map((metric, idx) => (
                  <motion.div key={metric.label}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: catIdx * 0.1 + idx * 0.05 }}
                    className="pro-card-hover p-3">
                    <div className="text-[9px] text-[#8892a6] font-mono mb-1 leading-tight">{metric.label}</div>
                    <div className="text-base md:text-lg font-mono font-bold text-white mb-0.5">{metric.value}</div>
                    <div className={`text-[10px] font-mono font-bold ${getTrendColor(metric.trend)}`}>
                      {getTrendIcon(metric.trend)} {metric.change}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Market Opportunity - stack on mobile */}
      <div className="mt-6 p-4 bg-[#00d4ff]/5 border border-[#00d4ff]/30 rounded-sm">
        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">Market Opportunity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "TAM", sub: "Crypto trading tools", value: "$8.5B", color: "text-[#00d4ff]" },
            { label: "SAM", sub: "AI-powered signals", value: "$1.2B", color: "text-[#00ff88]" },
            { label: "SOM", sub: "Year 3 target", value: "$120M", color: "text-[#ffa502]" },
          ].map(item => (
            <div key={item.label}>
              <div className="text-[10px] text-[#8892a6] font-mono mb-1">{item.label} — {item.sub}</div>
              <div className={`text-xl font-mono font-bold ${item.color}`}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive + Revenue - stack on mobile */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="pro-card p-4">
          <h4 className="text-xs font-mono font-bold text-[#00d4ff] uppercase mb-3">Competitive Advantages</h4>
          <ul className="space-y-1.5 text-xs font-mono text-[#8892a6]">
            {["Multi-agent AI system (unique)", "On-chain verification (transparent)", "Copy trading with AI analysis", "Mantle Network (low fees)"].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-[#00ff88] flex-shrink-0">✓</span><span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="pro-card p-4">
          <h4 className="text-xs font-mono font-bold text-[#ffa502] uppercase mb-3">Revenue Streams</h4>
          <ul className="space-y-1.5 text-xs font-mono text-[#8892a6]">
            {[["Premium Subscriptions", "$29/mo"], ["Copy Trading Fees", "10% profit"], ["API Access", "$99/mo"], ["Enterprise Plans", "$499/mo"]].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between">
                <span>{k}</span><span className="text-[#00ff88]">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
