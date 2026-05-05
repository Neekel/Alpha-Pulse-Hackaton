"""DEX Analytics - Real data from Mantle Network DEXes"""
import asyncio
import aiohttp
from web3 import Web3
from datetime import datetime
from typing import List, Dict, Any
from loguru import logger

# Official FusionX subgraphs on Mantle (from docs.fusionx.finance)
FUSIONX_V3_SUBGRAPH = "https://subgraph-api.mantle.xyz/subgraphs/name/fusionx/exchange-v3"
FUSIONX_V2_SUBGRAPH = "https://subgraph-api.mantle.xyz/subgraphs/name/fusionx/exchange"

# Merchant Moe - try mantle subgraph API
MERCHANT_MOE_SUBGRAPH = "https://subgraph-api.mantle.xyz/subgraphs/name/merchantmoe/exchange"


async def _query_subgraph(url: str, query: str) -> Dict:
    """Execute a GraphQL query against a subgraph"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                url,
                json={"query": query},
                timeout=aiohttp.ClientTimeout(total=10)
            ) as resp:
                if resp.status == 200:
                    return await resp.json()
    except Exception as e:
        logger.warning(f"Subgraph query failed ({url}): {e}")
    return {}


async def get_dex_volumes() -> List[Dict[str, Any]]:
    """Get trading volumes from Mantle DEXes via official subgraphs"""

    # FusionX V3 query
    v3_query = """
    {
      pools(first: 10, orderBy: volumeUSD, orderDirection: desc,
            where: {volumeUSD_gt: "100"}) {
        id
        token0 { symbol }
        token1 { symbol }
        volumeUSD
        feesUSD
        txCount
        totalValueLockedUSD
      }
    }
    """

    # FusionX V2 query
    v2_query = """
    {
      pairs(first: 10, orderBy: volumeUSD, orderDirection: desc,
            where: {volumeUSD_gt: "100"}) {
        id
        token0 { symbol }
        token1 { symbol }
        volumeUSD
        txCount
        reserveUSD
      }
    }
    """

    results = []

    # Query FusionX V3
    v3_data = await _query_subgraph(FUSIONX_V3_SUBGRAPH, v3_query)
    if v3_data.get("data", {}).get("pools"):
        for pool in v3_data["data"]["pools"][:5]:
            results.append({
                "dex": "FusionX V3",
                "pair": f"{pool['token0']['symbol']}/{pool['token1']['symbol']}",
                "volume_24h": float(pool.get("volumeUSD", 0)),
                "fees_24h": float(pool.get("feesUSD", 0)),
                "tx_count": int(pool.get("txCount", 0)),
                "tvl": float(pool.get("totalValueLockedUSD", 0)),
                "pool_address": pool["id"],
            })

    # Query FusionX V2
    v2_data = await _query_subgraph(FUSIONX_V2_SUBGRAPH, v2_query)
    if v2_data.get("data", {}).get("pairs"):
        for pair in v2_data["data"]["pairs"][:3]:
            results.append({
                "dex": "FusionX V2",
                "pair": f"{pair['token0']['symbol']}/{pair['token1']['symbol']}",
                "volume_24h": float(pair.get("volumeUSD", 0)),
                "fees_24h": float(pair.get("volumeUSD", 0)) * 0.003,  # 0.3% fee
                "tx_count": int(pair.get("txCount", 0)),
                "tvl": float(pair.get("reserveUSD", 0)),
                "pool_address": pair["id"],
            })

    # Query Merchant Moe
    moe_query = """
    {
      pairs(first: 5, orderBy: volumeUSD, orderDirection: desc) {
        id
        token0 { symbol }
        token1 { symbol }
        volumeUSD
        txCount
        reserveUSD
      }
    }
    """
    moe_data = await _query_subgraph(MERCHANT_MOE_SUBGRAPH, moe_query)
    if moe_data.get("data", {}).get("pairs"):
        for pair in moe_data["data"]["pairs"][:3]:
            results.append({
                "dex": "Merchant Moe",
                "pair": f"{pair['token0']['symbol']}/{pair['token1']['symbol']}",
                "volume_24h": float(pair.get("volumeUSD", 0)),
                "fees_24h": float(pair.get("volumeUSD", 0)) * 0.003,
                "tx_count": int(pair.get("txCount", 0)),
                "tvl": float(pair.get("reserveUSD", 0)),
                "pool_address": pair["id"],
            })

    results.sort(key=lambda x: x["volume_24h"], reverse=True)
    return results[:10]


async def get_large_swaps(web3: Web3, min_usd: float = 10000) -> List[Dict[str, Any]]:
    """Detect large swaps from recent blocks via RPC"""
    swaps = []
    try:
        current_block = web3.eth.block_number
        # Scan last 50 blocks (~10 minutes on Mantle)
        for block_num in range(current_block - 50, current_block):
            try:
                block = web3.eth.get_block(block_num, full_transactions=True)
                for tx in block.transactions:
                    value_mnt = float(web3.from_wei(tx.get("value", 0), "ether"))
                    # Rough MNT price estimate
                    value_usd = value_mnt * 0.80
                    if value_usd >= min_usd:
                        swaps.append({
                            "tx_hash": tx["hash"].hex(),
                            "from": tx.get("from", ""),
                            "to": tx.get("to", "") or "Contract Deploy",
                            "value_mnt": round(value_mnt, 2),
                            "value_usd": round(value_usd, 2),
                            "block": block_num,
                            "timestamp": datetime.fromtimestamp(block.timestamp).isoformat(),
                        })
            except Exception:
                continue
    except Exception as e:
        logger.error(f"Error scanning large swaps: {e}")

    swaps.sort(key=lambda x: x["value_usd"], reverse=True)
    return swaps[:20]


async def get_dex_summary(web3: Web3) -> Dict[str, Any]:
    """Get overall DEX summary"""
    volumes = await get_dex_volumes()
    total_volume = sum(v["volume_24h"] for v in volumes)
    total_tvl = sum(v["tvl"] for v in volumes)
    total_txs = sum(v["tx_count"] for v in volumes)

    return {
        "total_volume_24h": total_volume,
        "total_tvl": total_tvl,
        "total_transactions_24h": total_txs,
        "top_pairs": volumes[:5],
        "timestamp": datetime.utcnow().isoformat(),
    }
