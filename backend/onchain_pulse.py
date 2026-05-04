"""On-Chain Pulse - Real-time Mantle Network metrics"""
import asyncio
import aiohttp
from web3 import Web3
from datetime import datetime, timedelta
from typing import List, Dict, Any
from loguru import logger

# Mantle Bridge contract address
MANTLE_BRIDGE = "0x95fC37A27a2f68e3A647CDc081F2702ca9a56D5E"

# Mantle L1 Standard Bridge
L1_BRIDGE = "0x95fC37A27a2f68e3A647CDc081F2702ca9a56D5E"


async def get_gas_history(web3: Web3, blocks: int = 20) -> List[Dict[str, Any]]:
    """Get gas price history from last N blocks"""
    history = []
    try:
        current_block = web3.eth.block_number
        for block_num in range(current_block - blocks, current_block + 1):
            try:
                block = web3.eth.get_block(block_num)
                gas_price = web3.eth.gas_price
                history.append({
                    "block": block_num,
                    "timestamp": datetime.fromtimestamp(block.timestamp).isoformat(),
                    "gas_price_gwei": round(float(web3.from_wei(gas_price, "gwei")), 4),
                    "base_fee_gwei": round(
                        float(web3.from_wei(block.get("baseFeePerGas", 0), "gwei")), 4
                    ) if block.get("baseFeePerGas") else 0,
                    "tx_count": len(block.transactions),
                    "gas_used": block.gasUsed,
                    "gas_limit": block.gasLimit,
                    "utilization_pct": round(block.gasUsed / block.gasLimit * 100, 1) if block.gasLimit else 0,
                })
            except Exception as e:
                logger.debug(f"Error getting block {block_num}: {e}")
                continue
    except Exception as e:
        logger.error(f"Error getting gas history: {e}")

    return history


async def get_network_metrics(web3: Web3) -> Dict[str, Any]:
    """Get current Mantle network metrics"""
    try:
        current_block = web3.eth.block_number
        gas_price = web3.eth.gas_price
        gas_gwei = float(web3.from_wei(gas_price, "gwei"))

        # Get last 10 blocks for TPS calculation
        blocks_data = []
        total_txs = 0
        time_span = 0

        for i in range(10):
            try:
                block = web3.eth.get_block(current_block - i)
                blocks_data.append(block)
                total_txs += len(block.transactions)
            except Exception:
                continue

        # Calculate TPS
        if len(blocks_data) >= 2:
            time_span = blocks_data[0].timestamp - blocks_data[-1].timestamp
            tps = total_txs / time_span if time_span > 0 else 0
        else:
            tps = 0

        # Get latest block details
        latest_block = web3.eth.get_block(current_block)
        utilization = (
            latest_block.gasUsed / latest_block.gasLimit * 100
            if latest_block.gasLimit else 0
        )

        # Determine congestion level
        if utilization > 80:
            congestion = "HIGH"
            congestion_color = "#ff4757"
        elif utilization > 50:
            congestion = "MEDIUM"
            congestion_color = "#ffa502"
        else:
            congestion = "LOW"
            congestion_color = "#00ff88"

        return {
            "block_number": current_block,
            "gas_price_gwei": round(gas_gwei, 4),
            "gas_price_wei": gas_price,
            "tps": round(tps, 2),
            "block_time_sec": round(time_span / len(blocks_data), 1) if blocks_data else 2,
            "latest_block_txs": len(latest_block.transactions),
            "gas_utilization_pct": round(utilization, 1),
            "congestion": congestion,
            "congestion_color": congestion_color,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error getting network metrics: {e}")
        return {
            "block_number": 0,
            "gas_price_gwei": 0,
            "tps": 0,
            "congestion": "UNKNOWN",
            "congestion_color": "#8892a6",
            "timestamp": datetime.utcnow().isoformat(),
        }


async def get_bridge_activity(web3: Web3) -> Dict[str, Any]:
    """Get Mantle bridge activity from recent blocks"""
    try:
        current_block = web3.eth.block_number
        bridge_txs = []
        total_bridged_eth = 0.0

        # Scan last 200 blocks for bridge transactions
        for block_num in range(current_block - 200, current_block):
            try:
                block = web3.eth.get_block(block_num, full_transactions=True)
                for tx in block.transactions:
                    to = (tx.get("to") or "").lower()
                    if MANTLE_BRIDGE.lower() in to:
                        value_eth = float(web3.from_wei(tx.get("value", 0), "ether"))
                        total_bridged_eth += value_eth
                        bridge_txs.append({
                            "tx_hash": tx["hash"].hex(),
                            "from": tx.get("from", ""),
                            "value_eth": round(value_eth, 4),
                            "value_usd": round(value_eth * 3000, 2),  # ETH price estimate
                            "block": block_num,
                            "timestamp": datetime.fromtimestamp(block.timestamp).isoformat(),
                            "direction": "IN",  # Deposit to Mantle
                        })
            except Exception:
                continue

        return {
            "bridge_txs_count": len(bridge_txs),
            "total_bridged_eth": round(total_bridged_eth, 4),
            "total_bridged_usd": round(total_bridged_eth * 3000, 2),
            "recent_txs": bridge_txs[:10],
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error getting bridge activity: {e}")
        return {
            "bridge_txs_count": 0,
            "total_bridged_eth": 0,
            "total_bridged_usd": 0,
            "recent_txs": [],
        }


async def get_active_addresses(web3: Web3, blocks: int = 100) -> Dict[str, Any]:
    """Count unique active addresses in recent blocks"""
    try:
        current_block = web3.eth.block_number
        addresses = set()
        total_txs = 0

        for block_num in range(current_block - blocks, current_block):
            try:
                block = web3.eth.get_block(block_num, full_transactions=True)
                for tx in block.transactions:
                    if tx.get("from"):
                        addresses.add(tx["from"].lower())
                    if tx.get("to"):
                        addresses.add(tx["to"].lower())
                    total_txs += 1
            except Exception:
                continue

        return {
            "unique_addresses": len(addresses),
            "total_transactions": total_txs,
            "blocks_scanned": blocks,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error getting active addresses: {e}")
        return {"unique_addresses": 0, "total_transactions": 0}
