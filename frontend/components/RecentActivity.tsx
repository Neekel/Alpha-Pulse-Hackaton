"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface RecentActivityProps {
  anomalies: any[];
}

export function RecentActivity({ anomalies }: RecentActivityProps) {
  // Group anomalies by type and count
  const stats = useMemo(() => {
    const grouped = anomalies.reduce((acc: any, anomaly) => {
      const type = anomaly.type;
      if (!acc[type]) {
        acc[type] = { count: 0, totalAmount: 0, avgConfidence: 0 };
      }
      acc[type].count++;
      acc[type].totalAmount += anomaly.amount || 0;
      acc[type].avgConfidence += anomaly.confidence || 0;
      return acc;
    }, {});

    // Calculate averages and format
    return Object.entries(grouped).map(([type, data]: [string, any]) => ({
      type,
      count: data.count,
      totalAmount: data.totalAmount,
      avgConfidence: data.avgConfidence / data.count,
    }));
  }, [anomalies]);

  const emojiMap: Record<string, string> = {
    WHALE_BUY: "🐋",
    LIQUIDITY_EXIT: "🔴",
    SMART_CLUSTER: "🎯",
    MOMENTUM_BUILD: "🚀",
  };

  const colorMap: Record<string, string> = {
    WHALE_BUY: "from-blue-500 to-cyan-500",
    LIQUIDITY_EXIT: "from-red-500 to-orange-500",
    SMART_CLUSTER: "from-purple-500 to-pink-500",
    MOMENTUM_BUILD: "from-green-500 to-emerald-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <motion.span
          className="text-2xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          📊
        </motion.span>
        Activity Stats (24h)
      </h3>

      {stats.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm">Monitoring blockchain for anomalies...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/50 rounded-lg p-4 hover:bg-gray-900/70 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{emojiMap[stat.type] || "🔔"}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">
                    {stat.type.replace(/_/g, " ")}
                  </div>
                  <div className="text-xs text-gray-400">
                    {stat.count} {stat.count === 1 ? "detection" : "detections"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">
                    ${(stat.totalAmount / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-gray-400">Total Volume</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${colorMap[stat.type] || "from-gray-500 to-gray-600"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.avgConfidence * 100}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </div>
                <span className="text-xs text-purple-400 font-semibold whitespace-nowrap">
                  {(stat.avgConfidence * 100).toFixed(0)}% avg
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <motion.div
        className="mt-4 pt-4 border-t border-gray-700/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Total Detections</span>
          <span className="text-white font-bold">{anomalies.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-400">Total Volume</span>
          <span className="text-white font-bold">
            ${(stats.reduce((sum, s) => sum + s.totalAmount, 0) / 1000).toFixed(0)}K
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
