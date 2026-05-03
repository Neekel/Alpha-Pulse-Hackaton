"""Anomaly detectors for smart money patterns"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from web3 import Web3
from loguru import logger
import statistics


class AnomalyType:
    WHALE_BUY = "WHALE_BUY"
    LIQUIDITY_EXIT = "LIQUIDITY_EXIT"
    SMART_CLUSTER = "SMART_CLUSTER"
    MOMENTUM_BUILD = "MOMENTUM_BUILD"


class Priority:
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class Anomaly:
    def __init__(
        self,
        type: str,
        priority: str,
        confidence: float,
        wallet: str,
        protocol: str,
        action: str,
        amount: float,
        tx_hash: str,
        timestamp: datetime,
        metadata: Dict[str, Any] = None
    ):
        self.type = type
        self.priority = priority
        self.confidence = confidence
        self.wallet = wallet
        self.protocol = protocol
        self.action = action
        self.amount = amount
        self.tx_hash = tx_hash
        self.timestamp = timestamp
        self.metadata = metadata or {}
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "type": self.type,
            "priority": self.priority,
            "confidence": self.confidence,
            "wallet": self.wallet,
            "protocol": self.protocol,
            "action": self.action,
            "amount": self.amount,
            "tx_hash": self.tx_hash,
            "timestamp": self.timestamp.isoformat(),
            "metadata": self.metadata
        }


class AnomalyDetector:
    def __init__(self, web3: Web3, whale_threshold: float = 50000):
        self.web3 = web3
        self.whale_threshold = whale_threshold
        self.transaction_history: List[Dict] = []
        self.wallet_history: Dict[str, List[Dict]] = {}
        
    def add_transaction(self, tx: Dict[str, Any]):
        """Add transaction to history for pattern detection"""
        self.transaction_history.append({
            **tx,
            "timestamp": datetime.now()
        })
        
        # Keep only last 24 hours
        cutoff = datetime.now() - timedelta(hours=24)
        self.transaction_history = [
            t for t in self.transaction_history 
            if t["timestamp"] > cutoff
        ]
        
        # Update wallet history
        wallet = tx.get("from", "")
        if wallet:
            if wallet not in self.wallet_history:
                self.wallet_history[wallet] = []
            self.wallet_history[wallet].append(tx)
    
    def detect_whale_buy(self, tx: Dict[str, Any]) -> Optional[Anomaly]:
        """
        Detector: WHALE_BUY
        Condition: Single wallet purchase > $50K in < 1h
        Priority: CRITICAL
        """
        try:
            value_usd = tx.get("value_usd", 0)
            wallet = tx.get("from", "")
            
            if value_usd < self.whale_threshold:
                return None
            
            # Check if this wallet made multiple large purchases in last hour
            recent_txs = [
                t for t in self.wallet_history.get(wallet, [])
                if (datetime.now() - t.get("timestamp", datetime.now())).seconds < 3600
            ]
            
            total_volume = sum(t.get("value_usd", 0) for t in recent_txs)
            
            if total_volume >= self.whale_threshold:
                confidence = min(0.95, 0.5 + (total_volume / self.whale_threshold) * 0.1)
                
                return Anomaly(
                    type=AnomalyType.WHALE_BUY,
                    priority=Priority.CRITICAL,
                    confidence=confidence,
                    wallet=wallet,
                    protocol=tx.get("protocol", "Unknown"),
                    action=f"Bought ${total_volume:,.0f} in {len(recent_txs)} transactions",
                    amount=total_volume,
                    tx_hash=tx.get("hash", ""),
                    timestamp=datetime.now(),
                    metadata={
                        "tx_count": len(recent_txs),
                        "time_window": "1h"
                    }
                )
        except Exception as e:
            logger.error(f"Error in detect_whale_buy: {e}")
        
        return None
    
    def detect_liquidity_exit(self, tx: Dict[str, Any]) -> Optional[Anomaly]:
        """
        Detector: LIQUIDITY_EXIT
        Condition: LP token withdrawal > 20% of pool
        Priority: CRITICAL
        """
        try:
            # Check if this is a liquidity removal transaction
            if tx.get("type") != "remove_liquidity":
                return None
            
            pool_percentage = tx.get("pool_percentage", 0)
            
            if pool_percentage > 0.2:  # 20%
                confidence = min(0.95, 0.6 + pool_percentage * 0.3)
                
                return Anomaly(
                    type=AnomalyType.LIQUIDITY_EXIT,
                    priority=Priority.CRITICAL,
                    confidence=confidence,
                    wallet=tx.get("from", ""),
                    protocol=tx.get("protocol", "Unknown"),
                    action=f"Removed {pool_percentage*100:.1f}% of pool liquidity",
                    amount=tx.get("value_usd", 0),
                    tx_hash=tx.get("hash", ""),
                    timestamp=datetime.now(),
                    metadata={
                        "pool_address": tx.get("pool_address", ""),
                        "pool_percentage": pool_percentage
                    }
                )
        except Exception as e:
            logger.error(f"Error in detect_liquidity_exit: {e}")
        
        return None
    
    def detect_smart_cluster(self) -> Optional[Anomaly]:
        """
        Detector: SMART_CLUSTER
        Condition: 5+ wallets synchronized buys in < 10 min
        Priority: HIGH
        """
        try:
            # Get transactions from last 10 minutes
            cutoff = datetime.now() - timedelta(minutes=10)
            recent_txs = [
                t for t in self.transaction_history
                if t["timestamp"] > cutoff and t.get("type") == "buy"
            ]
            
            if len(recent_txs) < 5:
                return None
            
            # Group by token/protocol
            token_groups: Dict[str, List[Dict]] = {}
            for tx in recent_txs:
                token = tx.get("token", "")
                if token:
                    if token not in token_groups:
                        token_groups[token] = []
                    token_groups[token].append(tx)
            
            # Find clusters
            for token, txs in token_groups.items():
                unique_wallets = set(tx.get("from", "") for tx in txs)
                
                if len(unique_wallets) >= 5:
                    total_volume = sum(tx.get("value_usd", 0) for tx in txs)
                    confidence = min(0.90, 0.5 + len(unique_wallets) * 0.05)
                    
                    return Anomaly(
                        type=AnomalyType.SMART_CLUSTER,
                        priority=Priority.HIGH,
                        confidence=confidence,
                        wallet=f"{len(unique_wallets)} wallets",
                        protocol=txs[0].get("protocol", "Unknown"),
                        action=f"Synchronized buying of {token}",
                        amount=total_volume,
                        tx_hash=txs[-1].get("hash", ""),
                        timestamp=datetime.now(),
                        metadata={
                            "wallet_count": len(unique_wallets),
                            "tx_count": len(txs),
                            "token": token,
                            "time_window": "10min"
                        }
                    )
        except Exception as e:
            logger.error(f"Error in detect_smart_cluster: {e}")
        
        return None
    
    def detect_momentum_build(self, token: str) -> Optional[Anomaly]:
        """
        Detector: MOMENTUM_BUILD
        Condition: Volume > 3σ from 7-day average
        Priority: MEDIUM
        """
        try:
            # Get transactions for this token in last 7 days
            cutoff = datetime.now() - timedelta(days=7)
            token_txs = [
                t for t in self.transaction_history
                if t.get("token") == token and t["timestamp"] > cutoff
            ]
            
            if len(token_txs) < 10:  # Need enough data
                return None
            
            # Calculate daily volumes
            daily_volumes: Dict[str, float] = {}
            for tx in token_txs:
                date = tx["timestamp"].date().isoformat()
                if date not in daily_volumes:
                    daily_volumes[date] = 0
                daily_volumes[date] += tx.get("value_usd", 0)
            
            volumes = list(daily_volumes.values())
            
            if len(volumes) < 3:
                return None
            
            # Calculate mean and std dev
            mean_volume = statistics.mean(volumes)
            std_volume = statistics.stdev(volumes) if len(volumes) > 1 else 0
            
            # Check today's volume
            today = datetime.now().date().isoformat()
            today_volume = daily_volumes.get(today, 0)
            
            if std_volume > 0 and today_volume > mean_volume + 3 * std_volume:
                confidence = min(0.85, 0.5 + (today_volume - mean_volume) / (4 * std_volume) * 0.3)
                
                return Anomaly(
                    type=AnomalyType.MOMENTUM_BUILD,
                    priority=Priority.MEDIUM,
                    confidence=confidence,
                    wallet="Multiple",
                    protocol="Multiple DEXs",
                    action=f"Volume spike: ${today_volume:,.0f} (avg: ${mean_volume:,.0f})",
                    amount=today_volume,
                    tx_hash="",
                    timestamp=datetime.now(),
                    metadata={
                        "token": token,
                        "mean_volume": mean_volume,
                        "std_volume": std_volume,
                        "sigma_multiplier": (today_volume - mean_volume) / std_volume if std_volume > 0 else 0
                    }
                )
        except Exception as e:
            logger.error(f"Error in detect_momentum_build: {e}")
        
        return None
    
    def analyze_transaction(self, tx: Dict[str, Any]) -> List[Anomaly]:
        """Analyze a transaction for all anomaly types"""
        anomalies = []
        
        # Add to history
        self.add_transaction(tx)
        
        # Run detectors
        whale = self.detect_whale_buy(tx)
        if whale:
            anomalies.append(whale)
        
        liquidity = self.detect_liquidity_exit(tx)
        if liquidity:
            anomalies.append(liquidity)
        
        cluster = self.detect_smart_cluster()
        if cluster:
            anomalies.append(cluster)
        
        # Check momentum for token if present
        token = tx.get("token")
        if token:
            momentum = self.detect_momentum_build(token)
            if momentum:
                anomalies.append(momentum)
        
        return anomalies
