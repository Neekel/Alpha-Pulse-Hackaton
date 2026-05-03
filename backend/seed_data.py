"""Seed test data for demo"""
from supabase import create_client
from datetime import datetime, timedelta
import random

# Your Supabase credentials
SUPABASE_URL = "https://fdgxtrwydaqivcltygce.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkZ3h0cnd5ZGFxaXZjbHR5Z2NlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzc4ODc5NywiZXhwIjoyMDkzMzY0Nzk3fQ.PPrGSVTy-mltOYBNd1OfDn96Fd6bRVOG7hd0Jqd497I"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Mock anomalies
anomalies = [
    {
        "type": "WHALE_BUY",
        "priority": "HIGH",
        "confidence": 0.92,
        "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        "protocol": "Merchant Moe",
        "action": "Bought 50,000 USDC worth of MNT",
        "amount": 50000.0,
        "tx_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "timestamp": (datetime.utcnow() - timedelta(minutes=5)).isoformat(),
        "metadata": {"token": "MNT", "dex": "Merchant Moe", "price_impact": 2.5},
        "explanation": "Large whale wallet accumulated significant MNT position. Historical data shows this wallet has 78% accuracy in timing market bottoms. Similar accumulation patterns preceded 40%+ rallies in the past."
    },
    {
        "type": "LIQUIDITY_EXIT",
        "priority": "CRITICAL",
        "confidence": 0.88,
        "wallet": "0x8Ba1f109551bD432803012645Ac136ddd64DBA72",
        "protocol": "Agni Finance",
        "action": "Removed $120K liquidity from USDC-MNT pool",
        "amount": 120000.0,
        "tx_hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        "timestamp": (datetime.utcnow() - timedelta(minutes=15)).isoformat(),
        "metadata": {"token": "MNT", "dex": "Agni Finance", "pool_impact": 8.2},
        "explanation": "Major liquidity provider exited position. This wallet provided liquidity for 6+ months. Exit suggests potential upcoming volatility or insider information about protocol changes."
    },
    {
        "type": "SMART_CLUSTER",
        "priority": "MEDIUM",
        "confidence": 0.85,
        "wallet": "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
        "protocol": "Multiple DEXs",
        "action": "7 smart wallets bought within 10 minutes",
        "amount": 85000.0,
        "tx_hash": "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
        "timestamp": (datetime.utcnow() - timedelta(minutes=25)).isoformat(),
        "metadata": {"token": "MNT", "cluster_size": 7, "coordination_score": 0.91},
        "explanation": "Coordinated buying detected across 7 wallets with historical correlation. These wallets often move together before major price movements. Average holding period: 3-7 days with 65% win rate."
    },
    {
        "type": "MOMENTUM_BUILD",
        "priority": "MEDIUM",
        "confidence": 0.79,
        "wallet": "0x1234567890123456789012345678901234567890",
        "protocol": "FusionX",
        "action": "Volume spike: 300% above 24h average",
        "amount": 250000.0,
        "tx_hash": "0x4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
        "timestamp": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
        "metadata": {"token": "MNT", "volume_increase": 3.2, "unique_buyers": 45},
        "explanation": "Unusual volume surge with increasing buy pressure. 45 unique buyers in last hour vs 12 average. Price holding support level while volume increases - classic accumulation pattern."
    },
    {
        "type": "WHALE_BUY",
        "priority": "HIGH",
        "confidence": 0.94,
        "wallet": "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
        "protocol": "Merchant Moe",
        "action": "Bought 75,000 USDC worth of MNT",
        "amount": 75000.0,
        "tx_hash": "0x9012345678901234567890123456789012345678901234567890123456789012",
        "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
        "metadata": {"token": "MNT", "dex": "Merchant Moe", "price_impact": 3.8},
        "explanation": "Top 50 MNT holder increased position. This wallet has never sold MNT since accumulation started 8 months ago. Strong conviction holder adding more during consolidation."
    }
]

# Mock predictions
predictions = [
    {
        "type": "WHALE_BUY",
        "prediction": "MNT will increase 10%+ in 24h",
        "confidence": 0.85,
        "verified": True,
        "correct": True,
        "created_at": (datetime.utcnow() - timedelta(days=2)).isoformat(),
        "verified_at": (datetime.utcnow() - timedelta(days=1)).isoformat()
    },
    {
        "type": "LIQUIDITY_EXIT",
        "prediction": "Increased volatility expected",
        "confidence": 0.78,
        "verified": True,
        "correct": True,
        "created_at": (datetime.utcnow() - timedelta(days=3)).isoformat(),
        "verified_at": (datetime.utcnow() - timedelta(days=2)).isoformat()
    },
    {
        "type": "SMART_CLUSTER",
        "prediction": "Price movement in 6-12 hours",
        "confidence": 0.82,
        "verified": True,
        "correct": False,
        "created_at": (datetime.utcnow() - timedelta(days=4)).isoformat(),
        "verified_at": (datetime.utcnow() - timedelta(days=3)).isoformat()
    },
    {
        "type": "WHALE_BUY",
        "prediction": "Accumulation phase, bullish",
        "confidence": 0.88,
        "verified": True,
        "correct": True,
        "created_at": (datetime.utcnow() - timedelta(days=5)).isoformat(),
        "verified_at": (datetime.utcnow() - timedelta(days=4)).isoformat()
    },
    {
        "type": "MOMENTUM_BUILD",
        "prediction": "Breakout likely in 24h",
        "confidence": 0.75,
        "verified": True,
        "correct": True,
        "created_at": (datetime.utcnow() - timedelta(days=6)).isoformat(),
        "verified_at": (datetime.utcnow() - timedelta(days=5)).isoformat()
    }
]

print("🌱 Seeding anomalies...")
for anomaly in anomalies:
    try:
        result = supabase.table('anomalies').insert(anomaly).execute()
        print(f"✅ Added {anomaly['type']}")
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n🌱 Seeding predictions...")
for prediction in predictions:
    try:
        result = supabase.table('predictions').insert(prediction).execute()
        print(f"✅ Added {prediction['type']} prediction")
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n✅ Done! Check your frontend now.")
