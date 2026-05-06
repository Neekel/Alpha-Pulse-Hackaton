"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message { role: "user" | "ai"; text: string; time: string; }

const SUGGESTIONS = [
  "What's happening on Mantle right now?",
  "Should I buy MNT today?",
  "Explain the latest whale activity",
  "What's the market sentiment?",
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, { role: "user", text: msg, time }]);
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      if (r.ok) {
        const d = await r.json();
        setMessages(prev => [...prev, { role: "ai", text: d.response, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
      }
    } catch { setMessages(prev => [...prev, { role: "ai", text: "Connection error. Please try again.", time: "" }]); }
    finally { setLoading(false); }
  };

  const analyze = async () => {
    if (!address.trim() || analyzing) return;
    setAnalyzing(true);
    setAnalyzeResult(null);
    try {
      const r = await fetch(`${API_URL}/api/ai/analyze/${address.trim()}`);
      if (r.ok) setAnalyzeResult(await r.json());
    } catch {} finally { setAnalyzing(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Chat */}
      <div className="pro-card p-5">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#1e2a47]">
          <div>
            <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wider">AI Chat</h2>
            <p className="text-sm text-[#8892a6] font-mono mt-1">Ask anything about Mantle market</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#00ff88] rounded-full animate-pulse" />
            <span className="text-sm font-mono text-[#00ff88] font-bold">ONLINE</span>
          </div>
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto space-y-3 mb-4 pr-1">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="text-[#8892a6] font-mono text-sm text-center">Ask me anything about Mantle Network</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="text-xs font-mono px-3 py-1.5 bg-[#1e2a47] text-[#00d4ff] border border-[#00d4ff]/30 rounded-sm hover:bg-[#00d4ff]/10 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-sm ${m.role === "user" ? "bg-[#00d4ff]/20 border border-[#00d4ff]/30" : "bg-[#1e2a47] border border-[#2a3f5f]"}`}>
                  {m.role === "ai" && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-4 bg-[#00d4ff] rounded-sm flex items-center justify-center">
                        <span className="text-[#0a0e27] font-bold text-[8px]">AI</span>
                      </div>
                      <span className="text-[10px] text-[#8892a6] font-mono">AlphaPulse AI</span>
                    </div>
                  )}
                  <p className="text-sm font-mono text-white leading-relaxed">{m.text}</p>
                  {m.time && <div className="text-[10px] text-[#8892a6] font-mono mt-1 text-right">{m.time}</div>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-[#1e2a47] border border-[#2a3f5f] px-4 py-3 rounded-sm">
                <div className="flex items-center gap-1">
                  {[0,1,2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 bg-[#00d4ff] rounded-full"
                      animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask about market, whales, signals..."
            className="flex-1 bg-[#1e2a47] border border-[#2a3f5f] rounded-sm px-4 py-2.5 text-sm font-mono text-white placeholder-[#8892a6] focus:outline-none focus:border-[#00d4ff] transition-colors"
          />
          <button onClick={() => send()} disabled={loading || !input.trim()}
            className="pro-btn-primary text-sm font-mono py-2.5 px-4 disabled:opacity-50">
            Send
          </button>
        </div>
      </div>

      {/* Wallet/Token Analyzer */}
      <div className="pro-card p-5">
        <div className="mb-4 pb-4 border-b border-[#1e2a47]">
          <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wider">AI Analyzer</h2>
          <p className="text-sm text-[#8892a6] font-mono mt-1">Paste wallet or token address → AI analyzes it</p>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="0x... wallet or token address"
            className="flex-1 bg-[#1e2a47] border border-[#2a3f5f] rounded-sm px-4 py-2.5 text-sm font-mono text-white placeholder-[#8892a6] focus:outline-none focus:border-[#00d4ff] transition-colors"
          />
          <button onClick={analyze} disabled={analyzing || !address.trim()}
            className="pro-btn-primary text-sm font-mono py-2.5 px-4 disabled:opacity-50">
            {analyzing ? "..." : "Analyze"}
          </button>
        </div>

        {/* Result */}
        <AnimatePresence>
          {analyzeResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-mono font-bold px-2 py-1 rounded-sm ${analyzeResult.type === "token" ? "bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/40" : "bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/40"}`}>
                  {analyzeResult.type === "token" ? "TOKEN" : "WALLET"}
                </span>
                <code className="text-xs font-mono text-[#8892a6]">{analyzeResult.address.slice(0,10)}...{analyzeResult.address.slice(-6)}</code>
              </div>
              <div className="p-4 bg-[#1e2a47]/50 border border-[#2a3f5f] rounded-sm">
                <p className="text-sm font-mono text-white leading-relaxed whitespace-pre-wrap">{analyzeResult.analysis}</p>
              </div>
              <div className="mt-2 text-xs text-[#8892a6] font-mono">
                Analyzed {new Date(analyzeResult.timestamp).toLocaleTimeString()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!analyzeResult && !analyzing && (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-[#8892a6] font-mono text-sm">Enter any address to analyze</div>
            <div className="text-xs text-[#8892a6]/60 font-mono mt-1">Wallet → trading strategy · Token → safety score</div>
          </div>
        )}

        {analyzing && (
          <div className="flex flex-col items-center justify-center h-40">
            <motion.div className="text-4xl mb-3" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>⟳</motion.div>
            <div className="text-[#00d4ff] font-mono text-sm">Analyzing on-chain data...</div>
          </div>
        )}
      </div>
    </div>
  );
}
