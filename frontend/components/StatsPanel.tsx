"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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
  const [animatedAccuracy, setAnimatedAccuracy] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedAccuracy(stats.accuracy);
    }, 500);
    return () => clearTimeout(timer);
  }, [stats.accuracy]);

  const statItems = [
    {
      label: "Total Predictions",
      value: stats.total_predictions,
      color: "text-purple-400",
      icon: "📊",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      label: "Verified",
      value: stats.verified,
      color: "text-blue-400",
      icon: "✅",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      label: "Correct",
      value: stats.correct,
      color: "text-green-400",
      icon: "🎯",
      gradient: "from-green-500 to-green-600",
    },
    {
      label: "Accuracy",
      value: `${stats.accuracy.toFixed(1)}%`,
      color: "text-pink-400",
      icon: "🔥",
      gradient: "from-pink-500 to-pink-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="relative group"
        >
          {/* Glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity rounded-xl`} />
          
          <div className="relative bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <motion.span
                className="text-3xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
              >
                {stat.icon}
              </motion.span>
              {stat.label === "Accuracy" && (
                <motion.div
                  className="w-12 h-12 rounded-full border-4 border-pink-500/30 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <div className="text-xs font-bold text-pink-400">
                    {stats.accuracy.toFixed(0)}%
                  </div>
                </motion.div>
              )}
            </div>
            
            <motion.div
              className={`text-4xl font-bold ${stat.color} mb-2`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
            >
              {stat.value}
            </motion.div>
            
            <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
            
            {/* Progress bar for accuracy */}
            {stat.label === "Accuracy" && (
              <div className="mt-3 h-1 bg-gray-900/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${animatedAccuracy}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
