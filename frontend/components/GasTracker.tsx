"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function GasTracker() {
  const [gasPrice, setGasPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchGasPrice();
    const interval = setInterval(fetchGasPrice, 15000); // Update every 15s
    return () => clearInterval(interval);
  }, []);

  const fetchGasPrice = async () => {
    try {
      const response = await fetch(`${API_URL}/api/gas`);
      const data = await response.json();
      setGasPrice(data.gas_price_gwei);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching gas price:", error);
      setLoading(false);
    }
  };

  const getGasLevel = (gwei: number) => {
    if (gwei < 20) return { label: "Low", color: "text-green-400" };
    if (gwei < 50) return { label: "Medium", color: "text-yellow-400" };
    return { label: "High", color: "text-red-400" };
  };

  const level = gasPrice ? getGasLevel(gasPrice) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4">⛽ Gas Tracker</h3>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-4xl font-bold text-white">
              {gasPrice?.toFixed(2)}
            </div>
            <div className="text-gray-400">Gwei</div>
          </div>

          {level && (
            <div className={`text-lg font-semibold ${level.color} mb-4`}>
              {level.label}
            </div>
          )}

          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs text-gray-400">
              Current gas price on Mantle Network. Updates every 15 seconds.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
