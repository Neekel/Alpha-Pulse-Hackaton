"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface LiveChartProps {
  anomalies: any[];
}

export function LiveChart({ anomalies }: LiveChartProps) {
  const chartData = useMemo(() => {
    const typeCounts = anomalies.reduce((acc: any, anomaly) => {
      acc[anomaly.type] = (acc[anomaly.type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count: count as number,
      percentage: ((count as number) / anomalies.length) * 100,
    }));
  }, [anomalies]);

  const typeColors: Record<string, string> = {
    WHALE_BUY: "from-blue-500 to-cyan-500",
    LIQUIDITY_EXIT: "from-red-500 to-orange-500",
    SMART_CLUSTER: "from-purple-500 to-pink-500",
    MOMENTUM_BUILD: "from-green-500 to-emerald-500",
  };

  const typeEmojis: Record<string, string> = {
    WHALE_BUY: "🐋",
    LIQUIDITY_EXIT: "🔴",
    SMART_CLUSTER: "🎯",
    MOMENTUM_BUILD: "🚀",
  };

  if (anomalies.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Anomaly Distribution
        </h3>
        <span className="text-sm text-gray-400">
          Last {anomalies.length} signals
        </span>
      </div>

      <div className="space-y-4">
        {chartData.map((item, index) => (
          <motion.div
            key={item.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{typeEmojis[item.type]}</span>
                <span className="text-sm font-semibold text-white">
                  {item.type.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">{item.count} signals</span>
                <span className="text-sm font-bold text-purple-400">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="relative h-3 bg-gray-900/50 rounded-full overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${
                  typeColors[item.type] || "from-gray-500 to-gray-600"
                } rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-6 pt-6 border-t border-purple-500/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {anomalies.length}
            </div>
            <div className="text-xs text-gray-400">Total Signals</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {chartData.length}
            </div>
            <div className="text-xs text-gray-400">Types Detected</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-pink-400">
              {anomalies.filter((a) => a.priority === "CRITICAL").length}
            </div>
            <div className="text-xs text-gray-400">Critical</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
