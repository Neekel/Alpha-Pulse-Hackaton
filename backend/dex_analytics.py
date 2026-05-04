"""DEX Analytics - Real data from Mantle Network DEXes"""
import asyncio
import aiohttp
from web3 import Web3
from datetime import datetime, timedelta
from typing import List, Dict, Any
from loguru import logger

# FusionX V3 Subgraph on Mantle
FUSIONX_SUBGRAPH = "https://api.goldsky.com/api/public/project_clnbo3e3c16lj33xva5r2ckwz/subgraphs/fusionx-v3/prod/gn"

# Merchant Moe Subgraph on Mantle
MERCHANT_MOE_SUBGRAPH = "https://api.goldsky.com/api/public/project_clnbo3e3c16lj33xva5r2ckwz/subgraphs/merchantmoe/prod/gn"

# Agni Finance Subgraph
AGNI_SUBGRAPH = "https://api.goldsky.com/api/public/project_clnbo3e3c16lj33xva5r2ckwz/subgraphs/agni-finance/prod/gn"


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
    """Get 24h trading volumes from Mantle DEXes via subgraphs"""
    query = """
    {
      factories(first: 1) {
        totalVolumeUSD
        totalFeesUSD
        txCount
        poolCount
      }
      pools(first: 10, orderBy: volumeUSD, orderDirection: desc,
            where: {volumeUSD_gt: "1000"}) {
        id
        token0 { symbol }
        token1 { symbol }
        volumeUSD
        feesUSD
        txCount
        liquidity
        totalValueLockedUSD
      }
    }
    """

    results = []

    # Query FusionX
    data = await _query_subgraph(FUSIONX_SUBGRAPH, query)
    if data.get("data", {}).get("pools"):
        for pool in data["data"]["pools"][:5]:
            results.append({
                "dex": "FusionX V3",
                "pair": f"{pool['token0']['symbol']}/{pool['token1']['symbol']}",
                "volume_24h": float(pool.get("volumeUSD", 0)),
                "fees_24h": float(pool.get("feesUSD", 0)),
                "tx_count": int(pool.get("txCount", 0)),
                "tvl": float(pool.get("totalValueLockedUSD", 0)),
                "pool_address": pool["id"],
            })

    # Query Merchant Moe
    moe_query = """
    {
      lbpairs(first: 5, orderBy: volumeUSD, orderDirection: desc) {
        id
        tokenX { symbol }
        tokenY { symbol }
        volumeUSD
        feesUSD
        txCount
        totalValueLockedUSD
      }
    }
    """
    moe_data = await _query_subgraph(MERCHANT_MOE_SUBGRAPH, moe_query)
    if moe_data.get("data", {}).get("lbpairs"):
        for pool in moe_data["data"]["lbpairs"][:3]:
            results.append({
                "dex": "Merchant Moe",
                "pair": f"{pool['tokenX']['symbol']}/{pool['tokenY']['symbol']}",
                "volume_24h": float(pool.get("volumeUSD", 0)),
                "fees_24h": float(pool.get("feesUSD", 0)),
                "tx_count": int(pool.get("txCount", 0)),
                "tvl": float(pool.get("totalValueLockedUSD", 0)),
                "pool_address": pool["id"],
            })

    # Sort by volume
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
