"use client";

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
  const items = [
    { label: "Predictions", value: stats.total_predictions, color: "text-[#00d4ff]" },
    { label: "Verified", value: stats.verified, color: "text-[#00ff88]" },
    { label: "Correct", value: stats.correct, color: "text-[#00ff88]" },
    {
      label: "Accuracy",
      value: `${stats.accuracy.toFixed(1)}%`,
      color: stats.accuracy >= 70 ? "text-[#00ff88]" : stats.accuracy >= 50 ? "text-[#ffa502]" : "text-[#ff4757]",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 mb-3">
      {items.map((item) => (
        <div key={item.label} className="pro-card px-4 py-3 flex items-center justify-between">
          <span className="text-[10px] text-[#8892a6] font-mono uppercase tracking-wide">{item.label}</span>
          <span className={`text-lg font-mono font-bold tabular-nums ${item.color}`}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}
