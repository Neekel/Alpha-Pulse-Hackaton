"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface Prediction {
  direction: "BULLISH" | "BEARISH" | "NEUTRAL";
  timeframe: string;
  confidence: number;
  reasoning: string;
  signals: {
    gas: string;
    volume: string;
    whales: string;
    flow: string;
  };
  timestamp: string;
}

export function AIPredictions() {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch prediction from API
    const fetchPrediction = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/prediction`
        );
        if (response.ok) {
          const data = await response.json();
          setPrediction(data);
        }
      } catch (error) {
        console.error("Failed to fetch prediction:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
    // Refresh every 30 minutes
    const interval = setInterval(fetchPrediction, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const directionConfig = {
    BULLISH: {
      emoji: "📈",
      color: "from-green-500 to-emerald-500",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      text: "text-green-400",
      label: "Bullish",
    },
    BEARISH: {
      emoji: "📉",
      color: "from-red-500 to-orange-500",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-400",
      label: "Bearish",
    },
    NEUTRAL: {
      emoji: "➡️",
      color: "from-gray-500 to-gray-600",
      bg: "bg-gray-500/10",
      border: "border-gray-500/30",
      text: "text-gray-400",
      label: "Neutral",
    },
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
      >
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-4xl"
          >
            🤖
          </motion.div>
        </div>
        <p className="text-center text-gray-400 text-sm">
          AI analyzing market data...
        </p>
      </motion.div>
    );
  }

  if (!prediction) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          AI Market Prediction
        </h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🔮</div>
          <p className="text-sm">Gathering market intelligence...</p>
        </div>
      </motion.div>
    );
  }

  const config = directionConfig[prediction.direction];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <motion.span
            className="text-2xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🤖
          </motion.span>
          AI Market Prediction
        </h3>
        <span className="text-xs text-gray-500">
          Updated {new Date(prediction.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Main Prediction */}
      <motion.div
        className={`${config.bg} ${config.border} border rounded-xl p-4 mb-4`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{config.emoji}</span>
            <div>
              <div className={`text-2xl font-bold ${config.text}`}>
                {config.label}
              </div>
              <div className="text-sm text-gray-400">{prediction.timeframe}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${config.text}`}>
              {prediction.confidence}%
            </div>
            <div className="text-xs text-gray-500">Confidence</div>
          </div>
        </div>

        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${config.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${prediction.confidence}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
      </motion.div>

      {/* AI Reasoning */}
      <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-lg">💡</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white mb-1">
              AI Analysis
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {prediction.reasoning}
            </p>
          </div>
        </div>
      </div>

      {/* Market Signals */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          className="bg-gray-900/50 rounded-lg p-3"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">⛽</span>
            <span className="text-xs text-gray-500">Gas Trend</span>
          </div>
          <div className="text-sm font-semibold text-white">
            {prediction.signals.gas}
          </div>
        </motion.div>

        <motion.div
          className="bg-gray-900/50 rounded-lg p-3"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">📊</span>
            <span className="text-xs text-gray-500">Volume</span>
          </div>
          <div className="text-sm font-semibold text-white">
            {prediction.signals.volume}
          </div>
        </motion.div>

        <motion.div
          className="bg-gray-900/50 rounded-lg p-3"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">🐋</span>
            <span className="text-xs text-gray-500">Whales</span>
          </div>
          <div className="text-sm font-semibold text-white">
            {prediction.signals.whales}
          </div>
        </motion.div>

        <motion.div
          className="bg-gray-900/50 rounded-lg p-3"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">💰</span>
            <span className="text-xs text-gray-500">Money Flow</span>
          </div>
          <div className="text-sm font-semibold text-white">
            {prediction.signals.flow}
          </div>
        </motion.div>
      </div>

      {/* Disclaimer */}
      <motion.div
        className="mt-4 pt-4 border-t border-gray-700/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs text-gray-500 text-center">
          ⚠️ AI predictions are not financial advice. DYOR.
        </p>
      </motion.div>
    </motion.div>
  );
}
