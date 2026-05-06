"""Token Scanner - Detect new ERC20 tokens deployed on Mantle (non-blocking)"""
import asyncio
import aiohttp
from web3 import Web3
from datetime import datetime
from typing import List, Dict, Any, Optional
from loguru import logger

MANTLESCAN_API = "https://api.mantlescan.xyz/api"

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


def _scan_deploy_txs_sync(rpc_url: str, blocks_back: int = 100) -> List[tuple]:
    """Synchronous: find contract deployment txs in recent blocks. Run via to_thread."""
    web3 = Web3(Web3.HTTPProvider(rpc_url, request_kwargs={"timeout": 5}))
    deploy_txs = []
    try:
        current_block = web3.eth.block_number
        # Sample every 5th block
        sample = list(range(current_block - blocks_back, current_block, 5))[-30:]
        for block_num in sample:
            try:
                block = web3.eth.get_block(block_num, full_transactions=True)
                for tx in block.transactions:
                    if tx.get("to") is None:
                        deploy_txs.append((dict(tx), block.timestamp, block.number))
                if len(deploy_txs) >= 20:
                    break
            except Exception:
                continue
    except Exception as e:
        logger.error(f"Scan deploy txs error: {e}")
    return deploy_txs


def _get_erc20_info_sync(rpc_url: str, tx_hash: str, deployer: str, timestamp: int, block_num: int) -> Optional[Dict]:
    """Synchronous: get receipt + ERC20 info. Run via to_thread."""
    web3 = Web3(Web3.HTTPProvider(rpc_url, request_kwargs={"timeout": 5}))
    try:
        receipt = web3.eth.get_transaction_receipt(tx_hash)
        if not receipt or not receipt.get("contractAddress"):
            return None
        addr = receipt["contractAddress"]
        contract = web3.eth.contract(address=Web3.to_checksum_address(addr), abi=ERC20_ABI)
        try:
            name = contract.functions.name().call()
            symbol = contract.functions.symbol().call()
            decimals = contract.functions.decimals().call()
            total_supply_raw = contract.functions.totalSupply().call()
            total_supply = total_supply_raw / (10 ** decimals) if decimals else total_supply_raw
        except Exception:
            return None  # Not ERC20

        deploy_time = datetime.fromtimestamp(timestamp)
        age_hours = (datetime.utcnow() - deploy_time).total_seconds() / 3600

        return {
            "address": addr,
            "name": name[:50] if name else "Unknown",
            "symbol": symbol[:20] if symbol else "???",
            "decimals": decimals,
            "total_supply": total_supply,
            "deployer": deployer,
            "tx_hash": tx_hash if isinstance(tx_hash, str) else tx_hash.hex(),
            "block": block_num,
            "deployed_at": deploy_time.isoformat(),
            "age_hours": round(age_hours, 2),
            "is_verified": False,
            "source_code": "",
            "holders": 1,
            "liquidity_usd": 0,
        }
    except Exception as e:
        logger.debug(f"ERC20 info error: {e}")
        return None


async def _check_verification(address: str) -> tuple:
    """Async: check Mantlescan verification."""
    try:
        url = f"{MANTLESCAN_API}?module=contract&action=getsourcecode&address={address}"
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=4)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    result = data.get("result", [{}])
                    if result and isinstance(result, list) and result[0].get("SourceCode"):
                        return True, result[0]["SourceCode"][:300]
    except Exception:
        pass
    return False, ""


async def get_new_tokens(rpc_url: str, blocks_back: int = 100) -> List[Dict[str, Any]]:
    """Find new ERC20 tokens deployed on Mantle."""
    # Step 1: scan blocks in thread
    deploy_txs = await asyncio.to_thread(_scan_deploy_txs_sync, rpc_url, blocks_back)
    logger.info(f"Found {len(deploy_txs)} contract deployments")

    # Step 2: get ERC20 info in parallel threads (max 8 at once)
    sem = asyncio.Semaphore(8)

    async def process(tx_dict, ts, block_num):
        async with sem:
            tx_hash = tx_dict.get("hash", "")
            if hasattr(tx_hash, "hex"):
                tx_hash = tx_hash.hex()
            deployer = tx_dict.get("from", "")
            info = await asyncio.to_thread(_get_erc20_info_sync, rpc_url, tx_hash, deployer, ts, block_num)
            if not info:
                return None
            # Check verification async
            is_verified, source = await _check_verification(info["address"])
            info["is_verified"] = is_verified
            info["source_code"] = source
            score = _safety_score(info)
            info["safety_score"] = score
            info["risk_label"] = _risk_label(score)
            info["risk_color"] = _risk_color(score)
            info.pop("source_code", None)
            return info

    results = await asyncio.gather(*[process(tx, ts, bn) for tx, ts, bn in deploy_txs])
    tokens = [r for r in results if r is not None]
    tokens.sort(key=lambda x: x["deployed_at"], reverse=True)
    return tokens[:20]


async def get_token_stats(rpc_url: str) -> Dict[str, Any]:
    """Quick token deployment rate estimate."""
    def _sync(rpc_url):
        web3 = Web3(Web3.HTTPProvider(rpc_url, request_kwargs={"timeout": 5}))
        deployments = 0
        try:
            current_block = web3.eth.block_number
            # Sample 20 blocks spread over last 200
            for block_num in range(current_block - 200, current_block, 10):
                try:
                    block = web3.eth.get_block(block_num, full_transactions=True)
                    for tx in block.transactions:
                        if tx.get("to") is None:
                            deployments += 1
                except Exception:
                    continue
        except Exception as e:
            logger.error(f"Token stats error: {e}")
        # Extrapolate: sampled 20 blocks out of 200, Mantle ~2s/block = 1800 blocks/hr
        rate_per_block = deployments / 20 if deployments else 0
        per_hour = max(1, int(rate_per_block * 1800))  # at least 1
        return {"new_tokens_1h": per_hour, "new_tokens_24h": per_hour * 24, "timestamp": datetime.utcnow().isoformat()}

    return await asyncio.to_thread(_sync, rpc_url)
