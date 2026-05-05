"""Token Scanner - Detect new tokens deployed on Mantle Network"""
import asyncio
import aiohttp
from web3 import Web3
from datetime import datetime
from typing import List, Dict, Any, Optional
from loguru import logger

# Mantlescan API - free, no key needed for basic endpoints
MANTLESCAN_API = "https://api.mantlescan.xyz/api"

# ERC20 minimal ABI
ERC20_ABI = [
    {"inputs": [], "name": "name", "outputs": [{"type": "string"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "symbol", "outputs": [{"type": "string"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "decimals", "outputs": [{"type": "uint8"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "totalSupply", "outputs": [{"type": "uint256"}], "stateMutability": "view", "type": "function"},
]

HONEYPOT_KEYWORDS = ["blacklist", "whitelist", "pause", "freeze", "setMaxTx", "antiBot"]


def _safety_score(info: Dict) -> int:
    score = 100
    if not info.get("is_verified"):
        score -= 40
    source = info.get("source_code", "").lower()
    for kw in HONEYPOT_KEYWORDS:
        if kw.lower() in source:
            score -= 8
    age_h = info.get("age_hours", 24)
    if age_h < 1:
        score -= 20
    elif age_h < 6:
        score -= 10
    if info.get("liquidity_usd", 0) < 1000:
        score -= 10
    return max(0, min(100, score))


def _risk_label(score: int) -> str:
    if score >= 80: return "SAFE"
    if score >= 60: return "LOW RISK"
    if score >= 40: return "MEDIUM RISK"
    if score >= 20: return "HIGH RISK"
    return "DANGER"


def _risk_color(score: int) -> str:
    if score >= 80: return "#00ff88"
    if score >= 60: return "#00d4ff"
    if score >= 40: return "#ffa502"
    if score >= 20: return "#ff4757"
    return "#ff0000"


async def _get_recent_contracts_mantlescan(limit: int = 20) -> List[Dict]:
    """Fetch recently verified contracts from Mantlescan API"""
    try:
        url = (
            f"{MANTLESCAN_API}?module=contract&action=getcontractcreation"
            f"&contractaddresses=&apikey=YourApiKeyToken"
        )
        # Use the txlist endpoint to find contract deployments
        # Mantlescan: get latest transactions that are contract creations
        url = (
            f"{MANTLESCAN_API}?module=account&action=txlist"
            f"&address=0x0000000000000000000000000000000000000000"
            f"&startblock=0&endblock=99999999&sort=desc&page=1&offset={limit}"
        )
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=8)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("result", []) if isinstance(data.get("result"), list) else []
    except Exception as e:
        logger.warning(f"Mantlescan API error: {e}")
    return []


async def _get_verified_contracts(page: int = 1, offset: int = 20) -> List[Dict]:
    """Get recently verified contracts from Mantlescan"""
    try:
        url = (
            f"{MANTLESCAN_API}?module=contract&action=getcontractcreation"
            f"&page={page}&offset={offset}&sort=desc"
        )
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=8)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    result = data.get("result", [])
                    if isinstance(result, list):
                        return result
    except Exception as e:
        logger.warning(f"Mantlescan verified contracts error: {e}")
    return []


async def _check_is_erc20(web3: Web3, address: str) -> Optional[Dict]:
    """Check if address is ERC20 and return token info"""
    try:
        contract = web3.eth.contract(
            address=Web3.to_checksum_address(address),
            abi=ERC20_ABI
        )
        name = contract.functions.name().call()
        symbol = contract.functions.symbol().call()
        decimals = contract.functions.decimals().call()
        total_supply_raw = contract.functions.totalSupply().call()
        total_supply = total_supply_raw / (10 ** decimals) if decimals else total_supply_raw
        return {
            "name": name[:50] if name else "Unknown",
            "symbol": symbol[:20] if symbol else "???",
            "decimals": decimals,
            "total_supply": total_supply,
        }
    except Exception:
        return None


async def _check_verification(address: str) -> tuple[bool, str]:
    """Check if contract is verified on Mantlescan, return (is_verified, source_code)"""
    try:
        url = f"{MANTLESCAN_API}?module=contract&action=getsourcecode&address={address}"
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    result = data.get("result", [{}])
                    if result and isinstance(result, list) and result[0].get("SourceCode"):
                        return True, result[0]["SourceCode"][:500]
    except Exception:
        pass
    return False, ""


async def get_new_tokens(web3: Web3, blocks_back: int = 300) -> List[Dict[str, Any]]:
    """
    Scan recent blocks for new ERC20 token deployments.
    Uses RPC to find contract creations, then checks ERC20 interface.
    Optimized: scans in parallel batches.
    """
    tokens = []
    current_block = web3.eth.block_number
    start_block = current_block - blocks_back

    logger.info(f"Scanning blocks {start_block}-{current_block} for new tokens")

    # Collect contract deployment txs
    deploy_txs = []
    # Sample every 5th block for speed
    sample_blocks = list(range(start_block, current_block, 5))[-60:]  # max 60 blocks

    for block_num in sample_blocks:
        try:
            block = web3.eth.get_block(block_num, full_transactions=True)
            for tx in block.transactions:
                if tx.get("to") is None:
                    deploy_txs.append((tx, block))
            if len(deploy_txs) >= 30:
                break
        except Exception:
            continue

    logger.info(f"Found {len(deploy_txs)} contract deployments")

    # Process deployments in parallel (max 10 at a time)
    async def process_deploy(tx, block):
        try:
            receipt = web3.eth.get_transaction_receipt(tx["hash"])
            if not receipt or not receipt.get("contractAddress"):
                return None
            addr = receipt["contractAddress"]

            # Check ERC20
            token_info = await _check_is_erc20(web3, addr)
            if not token_info:
                return None

            # Check verification
            is_verified, source_code = await _check_verification(addr)

            deploy_time = datetime.fromtimestamp(block.timestamp)
            age_hours = (datetime.utcnow() - deploy_time).total_seconds() / 3600

            info = {
                "address": addr,
                **token_info,
                "deployer": tx.get("from", ""),
                "tx_hash": tx["hash"].hex(),
                "block": block.number,
                "deployed_at": deploy_time.isoformat(),
                "age_hours": round(age_hours, 2),
                "is_verified": is_verified,
                "source_code": source_code,
                "holders": 1,
                "liquidity_usd": 0,
            }
            score = _safety_score(info)
            info["safety_score"] = score
            info["risk_label"] = _risk_label(score)
            info["risk_color"] = _risk_color(score)
            info.pop("source_code", None)  # Don't send full source to frontend
            return info
        except Exception as e:
            logger.debug(f"process_deploy error: {e}")
            return None

    # Process in batches of 10
    for i in range(0, len(deploy_txs), 10):
        batch = deploy_txs[i:i+10]
        results = await asyncio.gather(*[process_deploy(tx, blk) for tx, blk in batch])
        tokens.extend([r for r in results if r is not None])
        if len(tokens) >= 20:
            break

    tokens.sort(key=lambda x: x["deployed_at"], reverse=True)
    return tokens[:20]


async def get_token_stats(web3: Web3) -> Dict[str, Any]:
    """Quick token deployment stats from last 100 blocks"""
    try:
        current_block = web3.eth.block_number
        deployments = 0
        # Sample 20 blocks
        for block_num in range(current_block - 100, current_block, 5):
            try:
                block = web3.eth.get_block(block_num, full_transactions=True)
                for tx in block.transactions:
                    if tx.get("to") is None:
                        deployments += 1
            except Exception:
                continue
        # Extrapolate to 1h (Mantle ~2s block time = ~1800 blocks/hr)
        rate_per_block = deployments / 20 if deployments else 0
        per_hour = int(rate_per_block * 1800)
        return {
            "new_tokens_1h": per_hour,
            "new_tokens_24h": per_hour * 24,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Token stats error: {e}")
        return {"new_tokens_1h": 0, "new_tokens_24h": 0}
