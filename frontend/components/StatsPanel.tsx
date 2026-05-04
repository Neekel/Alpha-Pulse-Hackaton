"use client";

import { motion } from "framer-motion";

interface StatsPanelProps {
  stats: {
    total_predictions: number;
    verified: number;
    correct: number;
    accuracy: number;
    by_type: Record<string, any>;
  };
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const statItems = [
    {
      label: "Total Predictions",
      value: stats.total_predictions,
      color: "text-[#00d4ff]",
    },
    {
      label: "Verified",
      value: stats.verified,
      color: "text-[#00ff88]",
    },
    {
      label: "Correct",
      value: stats.correct,
      color: "text-[#00ff88]",
    },
    {
      label: "Accuracy",
      value: `${stats.accuracy.toFixed(1)}%`,
      color: stats.accuracy >= 70 ? "text-[#00ff88]" : stats.accuracy >= 50 ? "text-[#ffa502]" : "text-[#ff4757]",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="pro-card p-4 hover:border-[#00d4ff]/30 transition-colors"
        >
          <div className="text-[10px] text-[#8892a6] font-mono mb-1.5 uppercase tracking-wide">{stat.label}</div>
          <div className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
          
          {stat.label === "Accuracy" && (
            <div className="mt-2 h-1 bg-[#1e2a47] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#00d4ff]"
                initial={{ width: 0 }}
                animate={{ width: `${stats.accuracy}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
