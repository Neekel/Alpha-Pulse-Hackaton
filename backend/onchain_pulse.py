"""On-Chain Pulse - Real-time Mantle Network metrics (non-blocking)"""
import asyncio
from web3 import Web3
from datetime import datetime
from typing import List, Dict, Any
from loguru import logger

MANTLE_BRIDGE = "0x95fC37A27a2f68e3A647CDc081F2702ca9a56D5E"


def _fetch_gas_history_sync(rpc_url: str, blocks: int = 10) -> List[Dict[str, Any]]:
    """Synchronous: fetch last N blocks for gas history. Run via to_thread."""
    web3 = Web3(Web3.HTTPProvider(rpc_url, request_kwargs={"timeout": 5}))
    history = []
    try:
        current_block = web3.eth.block_number
        gas_price = web3.eth.gas_price
        gas_gwei = round(float(web3.from_wei(gas_price, "gwei")), 4)

        # Only fetch every 2nd block to halve RPC calls
        for block_num in range(current_block - blocks * 2, current_block, 2):
            try:
                block = web3.eth.get_block(block_num)
                history.append({
                    "block": block_num,
                    "timestamp": datetime.fromtimestamp(block.timestamp).isoformat(),
                    "gas_price_gwei": gas_gwei,
                    "base_fee_gwei": round(float(web3.from_wei(block.get("baseFeePerGas", 0), "gwei")), 4)
                        if block.get("baseFeePerGas") else 0,
                    "tx_count": len(block.transactions),
                    "gas_used": block.gasUsed,
                    "gas_limit": block.gasLimit,
                    "utilization_pct": round(block.gasUsed / block.gasLimit * 100, 1) if block.gasLimit else 0,
                })
            except Exception:
                continue
    except Exception as e:
        logger.error(f"Gas history sync error: {e}")
    return history


def _fetch_network_metrics_sync(rpc_url: str) -> Dict[str, Any]:
    """Synchronous: fetch 3 blocks for TPS. Run via to_thread."""
    web3 = Web3(Web3.HTTPProvider(rpc_url, request_kwargs={"timeout": 5}))
    try:
        current_block = web3.eth.block_number
        gas_price = web3.eth.gas_price
        gas_gwei = round(float(web3.from_wei(gas_price, "gwei")), 4)

        # Only 3 blocks for TPS — fast
        blocks_data = []
        total_txs = 0
        for i in range(3):
            try:
                b = web3.eth.get_block(current_block - i)
                blocks_data.append(b)
                total_txs += len(b.transactions)
            except Exception:
                continue

        tps = 0.0
        block_time = 2.0
        if len(blocks_data) >= 2:
            span = blocks_data[0].timestamp - blocks_data[-1].timestamp
            tps = round(total_txs / span, 2) if span > 0 else 0
            block_time = round(span / len(blocks_data), 1)

        latest = blocks_data[0] if blocks_data else None
        utilization = round(latest.gasUsed / latest.gasLimit * 100, 1) if latest and latest.gasLimit else 0

        if utilization > 80:
            congestion, color = "HIGH", "#ff4757"
        elif utilization > 50:
            congestion, color = "MEDIUM", "#ffa502"
        else:
            congestion, color = "LOW", "#00ff88"

        return {
            "block_number": current_block,
            "gas_price_gwei": gas_gwei,
            "tps": tps,
            "block_time_sec": block_time,
            "latest_block_txs": len(latest.transactions) if latest else 0,
            "gas_utilization_pct": utilization,
            "congestion": congestion,
            "congestion_color": color,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Network metrics sync error: {e}")
        return {
            "block_number": 0, "gas_price_gwei": 0, "tps": 0,
            "congestion": "UNKNOWN", "congestion_color": "#8892a6",
            "timestamp": datetime.utcnow().isoformat(),
        }


def _fetch_bridge_activity_sync(rpc_url: str, blocks: int = 50) -> Dict[str, Any]:
    """Synchronous: scan last N blocks for bridge txs. Run via to_thread."""
    web3 = Web3(Web3.HTTPProvider(rpc_url, request_kwargs={"timeout": 5}))
    bridge_txs = []
    total_eth = 0.0
    try:
        current_block = web3.eth.block_number
        # Sample every 3rd block for speed
        for block_num in range(current_block - blocks, current_block, 3):
            try:
                block = web3.eth.get_block(block_num, full_transactions=True)
                for tx in block.transactions:
                    to = (tx.get("to") or "").lower()
                    if MANTLE_BRIDGE.lower() in to:
                        val = float(web3.from_wei(tx.get("value", 0), "ether"))
                        total_eth += val
                        bridge_txs.append({
                            "tx_hash": tx["hash"].hex(),
                            "from": tx.get("from", ""),
                            "value_eth": round(val, 4),
                            "value_usd": round(val * 3000, 2),
                            "block": block_num,
                            "timestamp": datetime.fromtimestamp(block.timestamp).isoformat(),
                        })
            except Exception:
                continue
    except Exception as e:
        logger.error(f"Bridge sync error: {e}")
    return {
        "bridge_txs_count": len(bridge_txs),
        "total_bridged_eth": round(total_eth, 4),
        "total_bridged_usd": round(total_eth * 3000, 2),
        "recent_txs": bridge_txs[:10],
        "timestamp": datetime.utcnow().isoformat(),
    }


def _fetch_active_addresses_sync(rpc_url: str, blocks: int = 20) -> Dict[str, Any]:
    """Synchronous: count unique addresses in last N blocks. Run via to_thread."""
    web3 = Web3(Web3.HTTPProvider(rpc_url, request_kwargs={"timeout": 5}))
    addresses: set = set()
    total_txs = 0
    try:
        current_block = web3.eth.block_number
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
    except Exception as e:
        logger.error(f"Active addresses sync error: {e}")
    return {
        "unique_addresses": len(addresses),
        "total_transactions": total_txs,
        "blocks_scanned": blocks,
        "timestamp": datetime.utcnow().isoformat(),
    }


# ── Async wrappers ──────────────────────────────────────────────────────────

async def get_gas_history(rpc_url: str, blocks: int = 10) -> List[Dict[str, Any]]:
    return await asyncio.to_thread(_fetch_gas_history_sync, rpc_url, blocks)


async def get_network_metrics(rpc_url: str) -> Dict[str, Any]:
    return await asyncio.to_thread(_fetch_network_metrics_sync, rpc_url)


async def get_bridge_activity(rpc_url: str, blocks: int = 50) -> Dict[str, Any]:
    return await asyncio.to_thread(_fetch_bridge_activity_sync, rpc_url, blocks)


async def get_active_addresses(rpc_url: str, blocks: int = 20) -> Dict[str, Any]:
    return await asyncio.to_thread(_fetch_active_addresses_sync, rpc_url, blocks)
