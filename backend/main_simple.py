"""Simplified main.py for testing - without AI agents"""
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

app = FastAPI(title="AlphaPulse API - Simple")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "AlphaPulse",
        "version": "1.0.0-simple",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/stats")
async def get_stats():
    return {
        "total_predictions": 156,
        "verified": 98,
        "correct": 76,
        "accuracy": 77.5,
        "by_type": {}
    }

@app.get("/api/anomalies")
async def get_anomalies(limit: int = 50):
    return {
        "anomalies": [],
        "count": 0
    }

@app.get("/api/mantle/stats")
async def get_mantle_stats():
    return {
        "network": "Mantle Mainnet",
        "chain_id": 5000,
        "block_number": 94837500,
        "gas_price_gwei": 0.02,
        "tvl": 1250000000,
        "daily_transactions": 450000,
        "active_addresses_24h": 125000,
        "tps": 2500,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/ai-agents/status")
async def get_ai_agents_status():
    return {
        "status": "operational",
        "agents": [
            {"name": "Whale Tracker", "role": "Monitors whales", "status": "idle", "last_analysis": None},
            {"name": "DEX Analyzer", "role": "Monitors DEX", "status": "idle", "last_analysis": None},
            {"name": "Risk Assessor", "role": "Assesses risk", "status": "idle", "last_analysis": None},
            {"name": "Sentiment Analyzer", "role": "Analyzes sentiment", "status": "idle", "last_analysis": None}
        ],
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/ai-agents/analyze")
async def run_ai_analysis():
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "agents": [
            {
                "agent": "Whale Tracker",
                "status": "success",
                "data": {
                    "whale_count": 5,
                    "analysis": '{"pattern": "accumulation", "risk": "LOW", "insight": "Whales are accumulating", "confidence": 78}',
                    "timestamp": datetime.utcnow().isoformat()
                }
            }
        ],
        "synthesis": {
            "status": "success",
            "recommendation": '{"action": "BUY", "confidence": 75, "reasoning": "Strong whale accumulation detected with low risk", "risk_reward": "3:1", "time_horizon": "MEDIUM"}',
            "agents_consulted": 4
        },
        "status": "completed"
    }

@app.get("/api/copy-trading/top-traders")
async def get_top_traders(limit: int = 10):
    traders = [
        {
            'rank': 1,
            'address': '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            'profit': 125000,
            'profit_pct': 45.2,
            'win_rate': 78.5,
            'trades': 156,
            'total_volume': 2500000,
            'avg_confidence': 0.82,
            'strategy': 'Whale Follower',
            'followers': 234,
            'last_trade': datetime.utcnow().isoformat()
        },
        {
            'rank': 2,
            'address': '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
            'profit': 98000,
            'profit_pct': 38.7,
            'win_rate': 72.3,
            'trades': 203,
            'total_volume': 1800000,
            'avg_confidence': 0.75,
            'strategy': 'Smart Money',
            'followers': 189,
            'last_trade': datetime.utcnow().isoformat()
        }
    ]
    return {
        "traders": traders[:limit],
        "count": len(traders[:limit]),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/prediction-multi")
async def get_multi_predictions():
    return {
        "predictions": [
            {"timeframe": "1H", "direction": "BULLISH", "confidence": 78, "priceTarget": "+3-5%", "risk": "LOW", "action": "BUY"},
            {"timeframe": "6H", "direction": "BULLISH", "confidence": 72, "priceTarget": "+8-12%", "risk": "MEDIUM", "action": "HOLD"},
            {"timeframe": "24H", "direction": "NEUTRAL", "confidence": 65, "priceTarget": "±5%", "risk": "MEDIUM", "action": "WAIT"}
        ],
        "factors": [
            {"name": "Whale Activity", "value": "High", "impact": 85, "trend": "up"},
            {"name": "Gas Price", "value": "0.02 Gwei", "impact": 45, "trend": "neutral"},
            {"name": "DEX Volume", "value": "+45%", "impact": 72, "trend": "up"}
        ],
        "accuracy": {"1h": 78, "6h": 72, "24h": 68},
        "lastUpdate": datetime.utcnow().isoformat()
    }

@app.get("/api/prediction-history")
async def get_prediction_history():
    return {
        "predictions": [],
        "total": 0,
        "verified": 0,
        "correct": 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main_simple:app", host="0.0.0.0", port=8000, reload=False)
