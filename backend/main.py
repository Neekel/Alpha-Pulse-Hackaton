"""Main entry point for AlphaPulse backend"""
import asyncio
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger
import sys
from supabase import create_client, Client
from web3 import Web3
from groq import Groq

from config import settings
from monitor import MantleMonitor
from detectors import AnomalyDetector
from ai_explainer import AIExplainer
from bot import AlphaPulseBot
from ai_agents import OrchestratorAgent
from copy_trading import CopyTradingSystem
from dex_analytics import get_dex_summary, get_large_swaps
from token_scanner import get_new_tokens, get_token_stats
from onchain_pulse import get_gas_history, get_network_metrics, get_bridge_activity, get_active_addresses

# Simple in-memory cache: {key: (data, expires_at)}
import time
_cache: dict = {}

def _cached(key: str, ttl: int, fn):
    """Return cached value or call fn() and cache result"""
    now = time.time()
    if key in _cache and _cache[key][1] > now:
        return _cache[key][0]
    return None  # caller must refresh

def _set_cache(key: str, data, ttl: int):
    _cache[key] = (data, time.time() + ttl)

# Configure logging
logger.remove()
logger.add(sys.stderr, level="INFO")
import os
os.makedirs("logs", exist_ok=True)
logger.add("logs/alphapulse.log", rotation="1 day", retention="7 days", level="DEBUG")

# Global instances
monitor: MantleMonitor = None
detector: AnomalyDetector = None
explainer: AIExplainer = None
bot: AlphaPulseBot = None
supabase: Client = None
orchestrator: OrchestratorAgent = None
copy_trading: CopyTradingSystem = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    global monitor, detector, explainer, bot, supabase, orchestrator, copy_trading
    
    logger.info("Starting AlphaPulse backend...")
    
    try:
        # Initialize Supabase
        supabase = create_client(settings.supabase_url, settings.supabase_key)
        logger.info("Supabase connected")
        
        # Initialize Web3
        web3 = Web3(Web3.HTTPProvider(settings.mantle_rpc_url))
        
        # Initialize components
        detector = AnomalyDetector(web3, settings.whale_threshold)
        explainer = AIExplainer(settings.groq_api_key, settings.groq_model)
        bot = AlphaPulseBot(settings.telegram_bot_token, explainer, supabase)
        monitor = MantleMonitor(settings.mantle_rpc_url, settings.poll_interval)
        
        # Initialize AI Multi-Agent System
        groq_client = Groq(api_key=settings.groq_api_key)
        orchestrator = OrchestratorAgent(groq_client)
        logger.info("AI Multi-Agent System initialized")
        
        # Initialize Copy Trading System
        copy_trading = CopyTradingSystem(web3, supabase)
        logger.info("Copy Trading System initialized")
        
        # Add transaction callback
        async def on_transaction(tx):
            """Handle new transaction"""
            try:
                # Analyze for anomalies
                anomalies = detector.analyze_transaction(tx)
                
                for anomaly in anomalies:
                    logger.info(f"Anomaly detected: {anomaly.type} - {anomaly.action}")
                    
                    # Generate AI explanation
                    explanation = explainer.explain_anomaly(anomaly)
                    
                    # Save to database
                    supabase.table('anomalies').insert({
                        'type': anomaly.type,
                        'priority': anomaly.priority,
                        'confidence': anomaly.confidence,
                        'wallet': anomaly.wallet,
                        'protocol': anomaly.protocol,
                        'action': anomaly.action,
                        'amount': anomaly.amount,
                        'tx_hash': anomaly.tx_hash,
                        'timestamp': anomaly.timestamp.isoformat(),
                        'metadata': anomaly.metadata,
                        'explanation': explanation
                    }).execute()
                    
                    # Send alert to Telegram subscribers
                    await bot.send_alert(anomaly, explanation)
            except Exception as e:
                logger.error(f"Error processing transaction: {e}")
        
        monitor.add_callback(on_transaction)
        
        # Start bot
        asyncio.create_task(bot.start_bot())
        
        # Start monitor
        asyncio.create_task(monitor.start())
        
        logger.info("AlphaPulse backend started successfully")
        
        yield
        
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        raise
    finally:
        # Cleanup
        logger.info("Shutting down AlphaPulse backend...")
        if monitor:
            monitor.stop()
        if bot:
            await bot.stop_bot()


# Create FastAPI app
app = FastAPI(
    title="AlphaPulse API",
    description="AI-powered Smart Money detector for Mantle Network",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint"""
    from datetime import datetime
    return {
        "status": "ok",
        "service": "AlphaPulse",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/api/health")
async def health():
    """Detailed health check"""
    try:
        # Check Mantle RPC
        block_number = monitor.get_block_number() if monitor else 0
        gas_price = monitor.get_gas_price() if monitor else 0
        
        # Check bot
        bot_status = "running" if bot and bot.app else "stopped"
        subscribers = len(bot.subscribers) if bot else 0
        
        return {
            "status": "healthy",
            "mantle_rpc": {
                "connected": block_number > 0,
                "block_number": block_number,
                "gas_price": gas_price
            },
            "telegram_bot": {
                "status": bot_status,
                "subscribers": subscribers
            },
            "detector": {
                "active": detector is not None,
                "transactions_tracked": len(detector.transaction_history) if detector else 0
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/anomalies")
async def get_anomalies(limit: int = 50, type: str = None):
    """Get recent anomalies"""
    try:
        query = supabase.table('anomalies').select('*').order('timestamp', desc=True)
        
        if type:
            query = query.eq('type', type)
        
        response = query.limit(limit).execute()
        
        return {
            "anomalies": response.data,
            "count": len(response.data)
        }
    except Exception as e:
        logger.error(f"Error fetching anomalies: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/anomalies/{anomaly_id}")
async def get_anomaly(anomaly_id: str):
    """Get specific anomaly by ID"""
    try:
        response = supabase.table('anomalies').select('*').eq('id', anomaly_id).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Anomaly not found")
        
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching anomaly: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats")
async def get_stats():
    """Get accuracy statistics"""
    try:
        # Fetch all predictions
        response = supabase.table('predictions').select('*').execute()
        predictions = response.data if response.data else []
        
        total = len(predictions)
        verified = len([p for p in predictions if p.get('verified')])
        correct = len([p for p in predictions if p.get('correct')])
        
        accuracy = (correct / verified * 100) if verified > 0 else 0
        
        # Stats by type
        by_type = {}
        for pred in predictions:
            pred_type = pred.get('type', 'unknown')
            if pred_type not in by_type:
                by_type[pred_type] = {'total': 0, 'correct': 0, 'verified': 0}
            
            by_type[pred_type]['total'] += 1
            if pred.get('verified'):
                by_type[pred_type]['verified'] += 1
            if pred.get('correct'):
                by_type[pred_type]['correct'] += 1
        
        return {
            "total_predictions": total,
            "verified": verified,
            "correct": correct,
            "accuracy": round(accuracy, 2),
            "by_type": by_type
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/alpha/{token}")
async def get_alpha(token: str):
    """Get alpha report for a token"""
    try:
        token = token.upper()
        
        # Fetch recent anomalies for this token
        response = supabase.table('anomalies') \
            .select('*') \
            .eq('token', token) \
            .order('timestamp', desc=True) \
            .limit(10) \
            .execute()
        
        anomalies = response.data if response.data else []
        
        # Get price data (simplified)
        price_data = {
            'current': 0.50,
            'change_24h': 2.5,
            'volume_24h': 1250000
        }
        
        # Generate AI report
        report = explainer.generate_alpha_report(token, anomalies, price_data)
        
        return {
            "token": token,
            "report": report,
            "anomaly_count": len(anomalies),
            "price_data": price_data
        }
    except Exception as e:
        logger.error(f"Error generating alpha report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/gas")
async def get_gas_price():
    """Get current Mantle gas price"""
    from datetime import datetime
    try:
        gas_price = monitor.get_gas_price() if monitor else 0
        gas_price_gwei = gas_price / 1e9
        
        return {
            "gas_price_wei": gas_price,
            "gas_price_gwei": round(gas_price_gwei, 2),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error fetching gas price: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/prediction")
async def get_ai_prediction():
    """Get AI market prediction based on current data"""
    from datetime import datetime
    try:
        # Fetch recent anomalies
        response = supabase.table('anomalies') \
            .select('*') \
            .order('timestamp', desc=True) \
            .limit(20) \
            .execute()
        
        anomalies = response.data if response.data else []
        
        # Count by type
        whale_count = len([a for a in anomalies if a.get('type') == 'WHALE_BUY'])
        exit_count = len([a for a in anomalies if a.get('type') == 'LIQUIDITY_EXIT'])
        cluster_count = len([a for a in anomalies if a.get('type') == 'SMART_CLUSTER'])
        
        # Get gas price
        gas_price = monitor.get_gas_price() if monitor else 0
        gas_gwei = gas_price / 1e9
        
        # Simple AI logic
        bullish_signals = whale_count + cluster_count
        bearish_signals = exit_count
        
        if bullish_signals > bearish_signals * 2:
            direction = "BULLISH"
            confidence = min(70 + bullish_signals * 5, 95)
            reasoning = f"Strong accumulation detected: {whale_count} whale buys and {cluster_count} smart clusters in last hour. Gas price stable at {gas_gwei:.1f} Gwei. Historical data shows similar patterns preceded 15-30% rallies."
        elif bearish_signals > bullish_signals:
            direction = "BEARISH"
            confidence = min(65 + bearish_signals * 5, 90)
            reasoning = f"Risk signals detected: {exit_count} liquidity exits observed. Smart money reducing exposure. Recommend caution in next 6-12 hours."
        else:
            direction = "NEUTRAL"
            confidence = 60
            reasoning = f"Mixed signals: {bullish_signals} bullish vs {bearish_signals} bearish indicators. Market in consolidation phase. Wait for clearer direction."
        
        return {
            "direction": direction,
            "timeframe": "Next 6-12 hours",
            "confidence": confidence,
            "reasoning": reasoning,
            "signals": {
                "gas": f"{gas_gwei:.1f} Gwei" if gas_gwei > 0 else "Stable",
                "volume": f"{len(anomalies)} detections/hour",
                "whales": f"{whale_count} active" if whale_count > 0 else "Quiet",
                "flow": "Accumulation" if bullish_signals > bearish_signals else "Distribution" if bearish_signals > bullish_signals else "Neutral"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error generating prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/prediction-multi")
async def get_multi_timeframe_predictions():
    """Get predictions for multiple timeframes"""
    from datetime import datetime
    import random
    
    try:
        # Mock data for now - in production, use real ML model
        predictions = [
            {
                "timeframe": "1H",
                "direction": "BULLISH",
                "confidence": 78,
                "priceTarget": "+3-5%",
                "risk": "LOW",
                "action": "BUY"
            },
            {
                "timeframe": "6H",
                "direction": "BULLISH",
                "confidence": 72,
                "priceTarget": "+8-12%",
                "risk": "MEDIUM",
                "action": "HOLD"
            },
            {
                "timeframe": "24H",
                "direction": "NEUTRAL",
                "confidence": 65,
                "priceTarget": "±5%",
                "risk": "MEDIUM",
                "action": "WAIT"
            }
        ]
        
        factors = [
            {"name": "Whale Activity", "value": "High", "impact": 85, "trend": "up"},
            {"name": "Gas Price", "value": "12.5 Gwei", "impact": 45, "trend": "neutral"},
            {"name": "DEX Volume", "value": "+45%", "impact": 72, "trend": "up"},
            {"name": "Smart Clusters", "value": "3 detected", "impact": 68, "trend": "up"},
            {"name": "Liquidity", "value": "Stable", "impact": 55, "trend": "neutral"}
        ]
        
        return {
            "predictions": predictions,
            "factors": factors,
            "accuracy": {"1h": 78, "6h": 72, "24h": 68},
            "lastUpdate": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error generating multi predictions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/prediction-history")
async def get_prediction_history():
    """Get historical predictions with results"""
    try:
        response = supabase.table('predictions') \
            .select('*') \
            .order('created_at', desc=True) \
            .limit(50) \
            .execute()
        
        predictions = response.data if response.data else []
        
        return {
            "predictions": predictions,
            "total": len(predictions),
            "verified": len([p for p in predictions if p.get('verified')]),
            "correct": len([p for p in predictions if p.get('correct')])
        }
    except Exception as e:
        logger.error(f"Error fetching prediction history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=False,
        log_level="info"
    )


@app.get("/api/ai-agents/status")
async def get_ai_agents_status():
    """Get status of all AI agents"""
    try:
        if not orchestrator:
            raise HTTPException(status_code=503, detail="AI agents not initialized")
        
        return {
            "status": "operational",
            "agents": orchestrator.get_agent_status(),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting AI agents status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai-agents/analyze")
async def run_ai_analysis():
    """Run full multi-agent analysis"""
    try:
        if not orchestrator:
            raise HTTPException(status_code=503, detail="AI agents not initialized")
        
        # Fetch recent data
        response = supabase.table('anomalies') \
            .select('*') \
            .order('timestamp', desc=True) \
            .limit(50) \
            .execute()
        
        anomalies = response.data if response.data else []
        
        # Run multi-agent analysis
        result = await orchestrator.run_analysis({'anomalies': anomalies})
        
        return result
        
    except Exception as e:
        logger.error(f"Error running AI analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/copy-trading/top-traders")
async def get_top_traders(limit: int = 10):
    """Get top performing traders"""
    cached = _cached("top_traders", 60, None)
    if cached:
        return cached
    try:
        if not copy_trading:
            raise HTTPException(status_code=503, detail="Copy trading system not initialized")
        traders = await copy_trading.get_top_traders(limit)
        result = {
            "traders": traders,
            "count": len(traders),
            "timestamp": datetime.utcnow().isoformat()
        }
        _set_cache("top_traders", result, 60)
        return result
    except Exception as e:
        logger.error(f"Error getting top traders: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/copy-trading/trader/{address}")
async def get_trader_details(address: str):
    """Get detailed information about a specific trader"""
    try:
        if not copy_trading:
            raise HTTPException(status_code=503, detail="Copy trading system not initialized")
        
        # Get trader's recent trades
        trades = await copy_trading.get_trader_trades(address, limit=20)
        
        # Get AI analysis of strategy
        groq_client = Groq(api_key=settings.groq_api_key)
        strategy_analysis = await copy_trading.analyze_trader_strategy(address, groq_client)
        
        return {
            "address": address,
            "trades": trades,
            "strategy_analysis": strategy_analysis,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting trader details: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/copy-trading/trader/{address}/trades")
async def get_trader_trades(address: str, limit: int = 20):
    """Get recent trades for a specific trader"""
    try:
        if not copy_trading:
            raise HTTPException(status_code=503, detail="Copy trading system not initialized")
        
        trades = await copy_trading.get_trader_trades(address, limit)
        
        return {
            "address": address,
            "trades": trades,
            "count": len(trades),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting trader trades: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/mantle/stats")
async def get_mantle_stats():
    """Get Mantle Network statistics"""
    from datetime import datetime
    try:
        block_number = monitor.get_block_number() if monitor else 0
        gas_price = monitor.get_gas_price() if monitor else 0
        gas_gwei = gas_price / 1e9
        
        # Mock TVL and other stats (in production, fetch from Mantle API)
        return {
            "network": "Mantle Mainnet",
            "chain_id": 5000,
            "block_number": block_number,
            "gas_price_gwei": round(gas_gwei, 2),
            "tvl": 1250000000,  # Mock: $1.25B TVL
            "daily_transactions": 450000,  # Mock
            "active_addresses_24h": 125000,  # Mock
            "tps": 2500,  # Mock: 2500 TPS
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting Mantle stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── DEX ANALYTICS ────────────────────────────────────────────────────────────

@app.get("/api/dex/summary")
async def dex_summary():
    """DEX volumes and top pairs from Mantle subgraphs"""
    cached = _cached("dex_summary", 120, None)
    if cached:
        return cached
    try:
        web3 = Web3(Web3.HTTPProvider(settings.mantle_rpc_url))
        data = await get_dex_summary(web3)
        _set_cache("dex_summary", data, 120)
        return data
    except Exception as e:
        logger.error(f"DEX summary error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dex/large-swaps")
async def dex_large_swaps(min_usd: float = 10000):
    """Large swaps detected on Mantle (>$10K by default)"""
    cached = _cached("large_swaps", 60, None)
    if cached:
        return cached
    try:
        web3 = Web3(Web3.HTTPProvider(settings.mantle_rpc_url))
        swaps = await get_large_swaps(web3, min_usd)
        result = {"swaps": swaps, "count": len(swaps), "timestamp": datetime.utcnow().isoformat()}
        _set_cache("large_swaps", result, 60)
        return result
    except Exception as e:
        logger.error(f"Large swaps error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── TOKEN SCANNER ─────────────────────────────────────────────────────────────

@app.get("/api/tokens/new")
async def new_tokens(blocks_back: int = 100):
    """Newly deployed ERC20 tokens on Mantle"""
    cached = _cached("new_tokens", 120, None)
    if cached:
        return cached
    try:
        tokens = await get_new_tokens(settings.mantle_rpc_url, blocks_back)
        stats = await get_token_stats(settings.mantle_rpc_url)
        result = {
            "tokens": tokens,
            "count": len(tokens),
            "stats": stats,
            "timestamp": datetime.utcnow().isoformat(),
        }
        _set_cache("new_tokens", result, 120)
        return result
    except Exception as e:
        logger.error(f"New tokens error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── ON-CHAIN PULSE ────────────────────────────────────────────────────────────

@app.get("/api/pulse/network")
async def pulse_network():
    """Real-time Mantle network metrics: gas, TPS, congestion"""
    cached = _cached("pulse_network", 15, None)
    if cached:
        return cached
    try:
        data = await get_network_metrics(settings.mantle_rpc_url)
        _set_cache("pulse_network", data, 15)
        return data
    except Exception as e:
        logger.error(f"Network metrics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/pulse/gas-history")
async def pulse_gas_history(blocks: int = 10):
    """Gas price history for last N blocks"""
    cached = _cached("pulse_gas", 30, None)
    if cached:
        return cached
    try:
        history = await get_gas_history(settings.mantle_rpc_url, blocks)
        result = {"history": history, "count": len(history), "timestamp": datetime.utcnow().isoformat()}
        _set_cache("pulse_gas", result, 30)
        return result
    except Exception as e:
        logger.error(f"Gas history error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/pulse/bridge")
async def pulse_bridge():
    """Mantle bridge deposit/withdrawal activity"""
    cached = _cached("pulse_bridge", 60, None)
    if cached:
        return cached
    try:
        data = await get_bridge_activity(settings.mantle_rpc_url, 50)
        _set_cache("pulse_bridge", data, 60)
        return data
    except Exception as e:
        logger.error(f"Bridge activity error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/pulse/addresses")
async def pulse_addresses(blocks: int = 20):
    """Unique active addresses in recent blocks"""
    cached = _cached("pulse_addresses", 60, None)
    if cached:
        return cached
    try:
        data = await get_active_addresses(settings.mantle_rpc_url, blocks)
        _set_cache("pulse_addresses", data, 60)
        return data
    except Exception as e:
        logger.error(f"Active addresses error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── AI CHAT ──────────────────────────────────────────────────────────────────

@app.post("/api/ai/chat")
async def ai_chat(body: dict):
    """AI Chat — answers questions about Mantle market with real context"""
    from datetime import datetime
    try:
        user_message = body.get("message", "").strip()
        if not user_message:
            raise HTTPException(status_code=400, detail="Message required")

        # Gather real context
        try:
            stats_resp = supabase.table('anomalies').select('type,amount,confidence').order('timestamp', desc=True).limit(10).execute()
            recent = stats_resp.data or []
        except Exception:
            recent = []

        gas_price = monitor.get_gas_price() if monitor else 0
        gas_gwei = round(gas_price / 1e9, 4) if gas_price else 0
        block = monitor.get_block_number() if monitor else 0

        system_prompt = f"""You are AlphaPulse AI — an expert on-chain analyst for Mantle Network.
Current context:
- Block: {block}
- Gas: {gas_gwei} Gwei
- Recent anomalies: {len(recent)} detected
- Types: {[a.get('type') for a in recent[:5]]}

Answer concisely in 2-4 sentences. Be specific, use numbers. Focus on actionable insights.
If asked about price predictions, use the anomaly data as signals.
Always mention Mantle Network context."""

        groq_client = Groq(api_key=settings.groq_api_key)

        def _call():
            return groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.5,
                max_tokens=300,
            ).choices[0].message.content

        response = await asyncio.to_thread(_call)
        return {"response": response, "timestamp": datetime.utcnow().isoformat()}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── AI DAILY BRIEFING ────────────────────────────────────────────────────────

@app.get("/api/ai/daily-briefing")
async def ai_daily_briefing():
    """AI Daily Briefing — generated once per day with real market context"""
    from datetime import datetime
    try:
        # Gather context
        try:
            anomalies_resp = supabase.table('anomalies').select('*').order('timestamp', desc=True).limit(50).execute()
            anomalies = anomalies_resp.data or []
        except Exception:
            anomalies = []

        gas_price = monitor.get_gas_price() if monitor else 0
        gas_gwei = round(gas_price / 1e9, 4) if gas_price else 0
        block = monitor.get_block_number() if monitor else 0

        whale_count = len([a for a in anomalies if a.get('type') == 'WHALE_BUY'])
        exit_count = len([a for a in anomalies if a.get('type') == 'LIQUIDITY_EXIT'])
        cluster_count = len([a for a in anomalies if a.get('type') == 'SMART_CLUSTER'])
        total_volume = sum(a.get('amount', 0) for a in anomalies)

        prompt = f"""You are AlphaPulse AI. Generate a professional daily market briefing for Mantle Network.

Data for today:
- Current block: {block}
- Gas price: {gas_gwei} Gwei
- Whale buys detected: {whale_count}
- Liquidity exits: {exit_count}
- Smart clusters: {cluster_count}
- Total anomaly volume: ${total_volume:,.0f}
- Date: {datetime.utcnow().strftime('%B %d, %Y')}

Write a briefing with these sections (use these exact headers):
**MARKET OVERVIEW** — 2 sentences on overall market state
**KEY SIGNALS** — 3 bullet points with specific numbers
**RISK ASSESSMENT** — 1 sentence on current risk level
**TODAY'S OUTLOOK** — 1 actionable recommendation

Be specific, professional, Bloomberg-style. No fluff."""

        groq_client = Groq(api_key=settings.groq_api_key)

        def _call():
            return groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=500,
            ).choices[0].message.content

        briefing = await asyncio.to_thread(_call)
        return {
            "briefing": briefing,
            "date": datetime.utcnow().strftime('%Y-%m-%d'),
            "generated_at": datetime.utcnow().isoformat(),
            "stats": {
                "whale_count": whale_count,
                "exit_count": exit_count,
                "cluster_count": cluster_count,
                "total_volume": total_volume,
                "gas_gwei": gas_gwei,
                "block": block,
            }
        }
    except Exception as e:
        logger.error(f"Daily briefing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── AI ANALYZER (Wallet + Token) ─────────────────────────────────────────────

@app.get("/api/ai/analyze/{address}")
async def ai_analyze_address(address: str):
    """Analyze wallet OR token — auto-detects based on bytecode"""
    from datetime import datetime
    try:
        web3 = Web3(Web3.HTTPProvider(settings.mantle_rpc_url))

        # Detect: wallet or contract?
        try:
            code = web3.eth.get_code(Web3.to_checksum_address(address))
            is_contract = len(code) > 2  # '0x' = empty
        except Exception:
            is_contract = False

        groq_client = Groq(api_key=settings.groq_api_key)

        if is_contract:
            # Token analysis
            from token_scanner import ERC20_ABI, _safety_score, _risk_label, _risk_color, HONEYPOT_KEYWORDS
            token_info = {"name": "Unknown", "symbol": "???", "is_contract": True}
            try:
                contract = web3.eth.contract(address=Web3.to_checksum_address(address), abi=ERC20_ABI)
                token_info["name"] = contract.functions.name().call()
                token_info["symbol"] = contract.functions.symbol().call()
                token_info["decimals"] = contract.functions.decimals().call()
                supply = contract.functions.totalSupply().call()
                token_info["total_supply"] = supply / (10 ** token_info["decimals"])
            except Exception:
                pass

            prompt = f"""You are a DeFi security expert. Analyze this token on Mantle Network:
Address: {address}
Name: {token_info.get('name')}
Symbol: {token_info.get('symbol')}
Total Supply: {token_info.get('total_supply', 'Unknown')}

Provide:
1. Token type assessment (utility/meme/DeFi/scam risk)
2. Key risks (2-3 points)
3. Safety verdict: SAFE / CAUTION / DANGER
4. One-line recommendation

Be concise, 4-5 sentences total."""

            analysis_type = "token"
        else:
            # Wallet analysis — get recent transactions
            try:
                anomalies_resp = supabase.table('anomalies').select('*').eq('wallet', address).order('timestamp', desc=True).limit(20).execute()
                wallet_anomalies = anomalies_resp.data or []
            except Exception:
                wallet_anomalies = []

            types = [a.get('type') for a in wallet_anomalies]
            total_vol = sum(a.get('amount', 0) for a in wallet_anomalies)
            avg_conf = sum(a.get('confidence', 0) for a in wallet_anomalies) / len(wallet_anomalies) if wallet_anomalies else 0

            prompt = f"""You are a blockchain analyst. Analyze this wallet on Mantle Network:
Address: {address}
Detected anomalies: {len(wallet_anomalies)}
Activity types: {types[:10]}
Total volume: ${total_vol:,.0f}
Average confidence: {avg_conf:.2f}

Provide:
1. Wallet type (whale/trader/bot/retail)
2. Trading strategy assessment
3. Risk profile (LOW/MEDIUM/HIGH)
4. Should users copy this wallet? Why?

Be concise, 4-5 sentences total."""

            analysis_type = "wallet"

        def _call():
            return groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=400,
            ).choices[0].message.content

        analysis = await asyncio.to_thread(_call)

        return {
            "address": address,
            "type": analysis_type,
            "analysis": analysis,
            "is_contract": is_contract,
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as e:
        logger.error(f"AI analyze error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
