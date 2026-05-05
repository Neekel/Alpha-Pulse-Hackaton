"use client";

const contracts = [
  {
    name: "PredictionRegistry",
    address: "0x4597f29db1FBFAbfCEdDb3E9dEF7cfD584dbA090",
    desc: "On-chain prediction verification",
  },
  {
    name: "AnomalyRewards",
    address: "0xCD71e0A3dB3d31e81c1f0961e6B8E58e863A6119",
    desc: "User staking & rewards",
  },
];

export function ContractInfo() {
  return (
    <div className="pro-card px-4 py-3 mb-2">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-mono font-bold text-white uppercase tracking-wider">Smart Contracts</span>
          <span className="text-xs font-mono text-[#00ff88] px-1.5 py-0.5 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-sm">Verified</span>
          <span className="text-xs font-mono text-[#8892a6]">Mantle Mainnet</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {contracts.map((c) => (
            <a
              key={c.name}
              href={`https://mantlescan.xyz/address/${c.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 group"
            >
              <span className="text-sm font-mono font-bold text-white group-hover:text-[#00d4ff] transition-colors">{c.name}</span>
              <code className="text-xs font-mono text-[#00d4ff] bg-[#1e2a47] px-1.5 py-0.5 rounded-sm">
                {c.address.slice(0, 6)}...{c.address.slice(-4)}
              </code>
              <span className="text-xs text-[#8892a6] font-mono hidden sm:inline">{c.desc}</span>
              <span className="text-[#00d4ff] text-sm">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
