"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export function AlphaSearch() {
  const [token, setToken] = useState("");
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleSearch = async () => {
    if (!token.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/alpha/${token.toUpperCase()}`);
      const data = await response.json();
      setReport(data.report);
    } catch (error) {
      console.error("Error fetching alpha report:", error);
      setReport("Error fetching report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4">🔍 Alpha Search</h3>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Enter token (e.g., MNT)"
          className="flex-1 bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Search"}
        </button>
      </div>

      {report && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-900/50 rounded-lg p-4"
        >
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {report}
          </p>
        </motion.div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Get AI-powered smart money analysis for any token on Mantle
      </div>
    </motion.div>
  );
}
