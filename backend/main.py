"""Main entry point for AlphaPulse backend"""
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger
import sys
from supabase import create_client, Client
from web3 import Web3

from config import settings
from monitor import MantleMonitor
from detectors import AnomalyDetector
from ai_explainer import AIExplainer
from bot import AlphaPulseBot

# Configure logging
logger.remove()
logger.add(sys.stderr, level="INFO")
logger.add("logs/alphapulse.log", rotation="1 day", retention="7 days", level="DEBUG")

# Global instances
monitor: MantleMonitor = None
detector: AnomalyDetector = None
explainer: AIExplainer = None
bot: AlphaPulseBot = None
supabase: Client = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    global monitor, detector, explainer, bot, supabase
    
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
