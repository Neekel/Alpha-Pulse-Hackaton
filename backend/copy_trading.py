"""Copy Trading System - Track and analyze top traders"""
from typing import List, Dict, Any
from datetime import datetime, timedelta
from web3 import Web3
from loguru import logger


class TopTrader:
    """Represents a top performing trader"""
    
    def __init__(self, address: str, profit: float, win_rate: float, trades: int):
        self.address = address
        self.profit = profit
        self.win_rate = win_rate
        self.trades = trades
        self.rank = 0
        self.strategy = "Unknown"
        self.followers = 0


class CopyTradingSystem:
    """Tracks top traders and their strategies"""
    
    def __init__(self, web3: Web3, supabase_client):
        self.web3 = web3
        self.supabase = supabase_client
        self.top_traders: List[TopTrader] = []
    
    async def get_top_traders(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top performing traders from database"""
        
        try:
            # Query anomalies to find most profitable wallets
            response = self.supabase.table('anomalies') \
                .select('wallet, amount, type, confidence') \
                .order('timestamp', desc=True) \
                .limit(1000) \
                .execute()
            
            anomalies = response.data if response.data else []
            
            # Aggregate by wallet
            wallet_stats = {}
            for anomaly in anomalies:
                wallet = anomaly.get('wallet', 'unknown')
                amount = anomaly.get('amount', 0)
                confidence = anomaly.get('confidence', 0)
                
                if wallet not in wallet_stats:
                    wallet_stats[wallet] = {
                        'total_volume': 0,
                        'trades': 0,
                        'avg_confidence': 0,
                        'types': []
                    }
                
                wallet_stats[wallet]['total_volume'] += amount
                wallet_stats[wallet]['trades'] += 1
                wallet_stats[wallet]['avg_confidence'] += confidence
                wallet_stats[wallet]['types'].append(anomaly.get('type'))
            
            # Calculate metrics and rank
            traders = []
            for wallet, stats in wallet_stats.items():
                if stats['trades'] < 3:  # Minimum 3 trades
                    continue
                
                avg_confidence = stats['avg_confidence'] / stats['trades']
                
                # Mock profit calculation (in production, track actual P&L)
                estimated_profit = stats['total_volume'] * 0.15 * avg_confidence
                win_rate = avg_confidence * 100
                
                traders.append({
                    'address': wallet,
                    'profit': estimated_profit,
                    'profit_pct': 15.0 * avg_confidence,
                    'win_rate': win_rate,
                    'trades': stats['trades'],
                    'total_volume': stats['total_volume'],
                    'avg_confidence': avg_confidence,
                    'strategy': self._identify_strategy(stats['types']),
                    'followers': 0,  # Mock data
                    'last_trade': datetime.utcnow().isoformat()
                })
            
            # Sort by profit
            traders.sort(key=lambda x: x['profit'], reverse=True)
            
            # Add rank
            for i, trader in enumerate(traders[:limit]):
                trader['rank'] = i + 1
            
            return traders[:limit]
            
        except Exception as e:
            logger.error(f"Error getting top traders: {e}")
            return self._get_mock_traders(limit)
    
    def _identify_strategy(self, trade_types: List[str]) -> str:
        """Identify trading strategy based on trade types"""
        
        whale_count = trade_types.count('WHALE_BUY')
        cluster_count = trade_types.count('SMART_CLUSTER')
        exit_count = trade_types.count('LIQUIDITY_EXIT')
        
        if whale_count > len(trade_types) * 0.6:
            return "Whale Follower"
        elif cluster_count > len(trade_types) * 0.5:
            return "Smart Money"
        elif exit_count > len(trade_types) * 0.4:
            return "Liquidity Hunter"
        else:
            return "Diversified"
    
    async def get_trader_trades(self, address: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get recent trades for a specific trader"""
        
        try:
            response = self.supabase.table('anomalies') \
                .select('*') \
                .eq('wallet', address) \
                .order('timestamp', desc=True) \
                .limit(limit) \
                .execute()
            
            trades = response.data if response.data else []
            
            # Enrich with mock P&L data
            for trade in trades:
                trade['pnl'] = trade.get('amount', 0) * 0.15 * trade.get('confidence', 0.5)
                trade['pnl_pct'] = 15.0 * trade.get('confidence', 0.5)
                trade['status'] = 'PROFIT' if trade['pnl'] > 0 else 'LOSS'
            
            return trades
            
        except Exception as e:
            logger.error(f"Error getting trader trades: {e}")
            return []
    
    async def analyze_trader_strategy(self, address: str, groq_client) -> Dict[str, Any]:
        """Use AI to analyze trader's strategy"""
        
        try:
            trades = await self.get_trader_trades(address, limit=50)
            
            if not trades:
                return {
                    "status": "error",
                    "message": "No trades found for this trader"
                }
            
            # Prepare data for AI
            trade_summary = {
                'total_trades': len(trades),
                'types': [t.get('type') for t in trades],
                'avg_amount': sum(t.get('amount', 0) for t in trades) / len(trades),
                'avg_confidence': sum(t.get('confidence', 0) for t in trades) / len(trades),
                'protocols': list(set(t.get('protocol', 'unknown') for t in trades))
            }
            
            prompt = f"""Analyze this trader's strategy:

Address: {address[:10]}...
Total trades: {trade_summary['total_trades']}
Trade types: {trade_summary['types'][:10]}
Average trade size: ${trade_summary['avg_amount']:,.0f}
Average confidence: {trade_summary['avg_confidence']:.2f}
Protocols used: {trade_summary['protocols']}

Provide:
1. Strategy type (e.g., "Whale Follower", "Liquidity Hunter", "Smart Money")
2. Risk profile (LOW/MEDIUM/HIGH)
3. Key strengths (2-3 points)
4. Recommended for (who should copy this trader)
5. Copy risk level (1-10)

Format: JSON with keys: strategy, risk_profile, strengths, recommended_for, copy_risk"""

            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=400
            )
            
            analysis = response.choices[0].message.content
            
            return {
                "status": "success",
                "address": address,
                "analysis": analysis,
                "trade_summary": trade_summary,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing trader strategy: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _get_mock_traders(self, limit: int) -> List[Dict[str, Any]]:
        """Return mock data for demo purposes"""
        
        mock_traders = [
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
            },
            {
                'rank': 3,
                'address': '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0',
                'profit': 87500,
                'profit_pct': 35.1,
                'win_rate': 68.9,
                'trades': 178,
                'total_volume': 1600000,
                'avg_confidence': 0.71,
                'strategy': 'Liquidity Hunter',
                'followers': 156,
                'last_trade': datetime.utcnow().isoformat()
            },
            {
                'rank': 4,
                'address': '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
                'profit': 76200,
                'profit_pct': 32.4,
                'win_rate': 65.7,
                'trades': 145,
                'total_volume': 1400000,
                'avg_confidence': 0.68,
                'strategy': 'Diversified',
                'followers': 134,
                'last_trade': datetime.utcnow().isoformat()
            },
            {
                'rank': 5,
                'address': '0x9876543210abcdef9876543210abcdef98765432',
                'profit': 65800,
                'profit_pct': 29.8,
                'win_rate': 63.2,
                'trades': 132,
                'total_volume': 1200000,
                'avg_confidence': 0.65,
                'strategy': 'Whale Follower',
                'followers': 112,
                'last_trade': datetime.utcnow().isoformat()
            }
        ]
        
        return mock_traders[:limit]
