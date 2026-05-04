"""Token Scanner - Detect new tokens deployed on Mantle Network"""
import asyncio
import aiohttp
from web3 import Web3
from datetime import datetime
from typing import List, Dict, Any, Optional
from loguru import logger

# Mantlescan API
MANTLESCAN_API = "https://api.mantlescan.xyz/api"
MANTLESCAN_KEY = "YourApiKeyToken"  # Public endpoints don't need key

# ERC20 minimal ABI for token info
ERC20_ABI = [
    {"inputs": [], "name": "name", "outputs": [{"type": "string"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "symbol", "outputs": [{"type": "string"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "decimals", "outputs": [{"type": "uint8"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "totalSupply", "outputs": [{"type": "uint256"}], "stateMutability": "view", "type": "function"},
]

# Known honeypot patterns in bytecode
HONEYPOT_SIGNATURES = [
    "blacklist", "whitelist", "pause", "freeze",
    "setMaxTx", "setMaxWallet", "antiBot"
]


def _calculate_safety_score(contract_info: Dict) -> int:
    """Calculate safety score 0-100 based on contract properties"""
    score = 100

    # Deduct for no verification
    if not contract_info.get("is_verified"):
        score -= 40

    # Deduct for suspicious patterns
    source = contract_info.get("source_code", "").lower()
    for pattern in HONEYPOT_SIGNATURES:
        if pattern.lower() in source:
            score -= 10

    # Deduct for very new contract (< 1 hour)
    age_hours = contract_info.get("age_hours", 24)
    if age_hours < 1:
        score -= 20
    elif age_hours < 6:
        score -= 10

    # Deduct for zero liquidity
    if contract_info.get("liquidity_usd", 0) < 1000:
        score -= 15

    # Deduct for very few holders
    if contract_info.get("holders", 0) < 10:
        score -= 15

    return max(0, min(100, score))


def _get_risk_label(score: int) -> str:
    if score >= 80:
        return "SAFE"
    elif score >= 60:
        return "LOW RISK"
    elif score >= 40:
        return "MEDIUM RISK"
    elif score >= 20:
        return "HIGH RISK"
    return "DANGER"


def _get_risk_color(score: int) -> str:
    if score >= 80:
        return "#00ff88"
    elif score >= 60:
        return "#00d4ff"
    elif score >= 40:
        return "#ffa502"
    elif score >= 20:
        return "#ff4757"
    return "#ff0000"


async def get_new_tokens(web3: Web3, blocks_back: int = 500) -> List[Dict[str, Any]]:
    """Scan recent blocks for newly deployed token contracts"""
    tokens = []
    current_block = web3.eth.block_number
    start_block = current_block - blocks_back

    logger.info(f"Scanning blocks {start_block} to {current_block} for new tokens")

    # Scan blocks in batches
    batch_size = 50
    for batch_start in range(start_block, current_block, batch_size):
        batch_end = min(batch_start + batch_size, current_block)
        try:
            for block_num in range(batch_start, batch_end):
                block = web3.eth.get_block(block_num, full_transactions=True)
                for tx in block.transactions:
                    # Contract deployment: to is None/empty
                    if tx.get("to") is None or tx.get("to") == "":
                        token_info = await _analyze_contract(
                            web3, tx, block
                        )
                        if token_info:
                            tokens.append(token_info)
        except Exception as e:
            logger.debug(f"Error scanning batch {batch_start}-{batch_end}: {e}")
            continue

        # Limit results
        if len(tokens) >= 20:
            break

    tokens.sort(key=lambda x: x["deployed_at"], reverse=True)
    return tokens[:20]


async def _analyze_contract(
    web3: Web3, tx: Dict, block: Any
) -> Optional[Dict[str, Any]]:
    """Try to get ERC20 info from a deployed contract"""
    try:
        # Get contract address from receipt
        receipt = web3.eth.get_transaction_receipt(tx["hash"])
        if not receipt or not receipt.get("contractAddress"):
            return None

        contract_address = receipt["contractAddress"]

        # Try to call ERC20 methods
        contract = web3.eth.contract(
            address=Web3.to_checksum_address(contract_address),
            abi=ERC20_ABI
        )

        try:
            name = contract.functions.name().call()
            symbol = contract.functions.symbol().call()
            decimals = contract.functions.decimals().call()
            total_supply = contract.functions.totalSupply().call()
        except Exception:
            # Not an ERC20 token
            return None

        # Calculate age
        deploy_time = datetime.fromtimestamp(block.timestamp)
        age_hours = (datetime.utcnow() - deploy_time).total_seconds() / 3600

        # Check verification via Mantlescan API
        is_verified = await _check_verification(contract_address)

        contract_info = {
            "address": contract_address,
            "name": name[:50] if name else "Unknown",
            "symbol": symbol[:20] if symbol else "???",
            "decimals": decimals,
            "total_supply": total_supply / (10 ** decimals) if decimals else total_supply,
            "deployer": tx.get("from", ""),
            "tx_hash": tx["hash"].hex(),
            "block": block.number,
            "deployed_at": deploy_time.isoformat(),
            "age_hours": round(age_hours, 2),
            "is_verified": is_verified,
            "holders": 1,  # At least deployer
            "liquidity_usd": 0,
            "source_code": "",
        }

        # Calculate safety score
        score = _calculate_safety_score(contract_info)
        contract_info["safety_score"] = score
        contract_info["risk_label"] = _get_risk_label(score)
        contract_info["risk_color"] = _get_risk_color(score)

        return contract_info

    except Exception as e:
        logger.debug(f"Error analyzing contract: {e}")
        return None


async def _check_verification(address: str) -> bool:
    """Check if contract is verified on Mantlescan"""
    try:
        url = f"{MANTLESCAN_API}?module=contract&action=getsourcecode&address={address}"
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    result = data.get("result", [{}])
                    if result and result[0].get("SourceCode"):
                        return True
    except Exception:
        pass
    return False


async def get_token_stats(web3: Web3) -> Dict[str, Any]:
    """Get token deployment statistics"""
    try:
        current_block = web3.eth.block_number
        # Count contract deployments in last 100 blocks
        deployments_1h = 0
        deployments_24h = 0

        # Sample last 100 blocks for speed
        for block_num in range(current_block - 100, current_block):
            try:
                block = web3.eth.get_block(block_num, full_transactions=True)
                for tx in block.transactions:
                    if tx.get("to") is None:
                        deployments_1h += 1
            except Exception:
                continue

        return {
            "new_tokens_1h": deployments_1h,
            "new_tokens_24h": deployments_1h * 24,  # Estimate
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error getting token stats: {e}")
        return {"new_tokens_1h": 0, "new_tokens_24h": 0}
