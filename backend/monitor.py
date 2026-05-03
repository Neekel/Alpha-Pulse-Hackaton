"""Blockchain monitor for Mantle Network"""
import asyncio
from web3 import Web3
from typing import Dict, Any, List, Callable
from loguru import logger
from datetime import datetime
import json


class MantleMonitor:
    def __init__(self, rpc_url: str, poll_interval: int = 10):
        self.web3 = Web3(Web3.HTTPProvider(rpc_url))
        self.poll_interval = poll_interval
        self.last_block = 0
        self.callbacks: List[Callable] = []
        self.is_running = False
        
        # Check connection
        if not self.web3.is_connected():
            raise ConnectionError(f"Failed to connect to Mantle RPC: {rpc_url}")
        
        logger.info(f"Connected to Mantle Network (Chain ID: {self.web3.eth.chain_id})")
    
    def add_callback(self, callback: Callable):
        """Add callback function to be called when new transactions are detected"""
        self.callbacks.append(callback)
    
    async def start(self):
        """Start monitoring blockchain"""
        self.is_running = True
        self.last_block = self.web3.eth.block_number
        logger.info(f"Starting monitor from block {self.last_block}")
        
        while self.is_running:
            try:
                await self._poll_blocks()
                await asyncio.sleep(self.poll_interval)
            except Exception as e:
                logger.error(f"Error in monitor loop: {e}")
                await asyncio.sleep(self.poll_interval)
    
    def stop(self):
        """Stop monitoring"""
        self.is_running = False
        logger.info("Monitor stopped")
    
    async def _poll_blocks(self):
        """Poll for new blocks and process transactions"""
        try:
            current_block = self.web3.eth.block_number
            
            if current_block > self.last_block:
                logger.info(f"New blocks: {self.last_block + 1} to {current_block}")
                
                # Process new blocks
                for block_num in range(self.last_block + 1, current_block + 1):
                    await self._process_block(block_num)
                
                self.last_block = current_block
        except Exception as e:
            logger.error(f"Error polling blocks: {e}")
    
    async def _process_block(self, block_number: int):
        """Process a single block"""
        try:
            block = self.web3.eth.get_block(block_number, full_transactions=True)
            logger.debug(f"Processing block {block_number} with {len(block.transactions)} transactions")
            
            for tx in block.transactions:
                await self._process_transaction(tx, block)
        except Exception as e:
            logger.error(f"Error processing block {block_number}: {e}")
    
    async def _process_transaction(self, tx: Any, block: Any):
        """Process a single transaction"""
        try:
            # Parse transaction
            parsed_tx = self._parse_transaction(tx, block)
            
            # Call all callbacks
            for callback in self.callbacks:
                try:
                    if asyncio.iscoroutinefunction(callback):
                        await callback(parsed_tx)
                    else:
                        callback(parsed_tx)
                except Exception as e:
                    logger.error(f"Error in callback: {e}")
        except Exception as e:
            logger.error(f"Error processing transaction: {e}")
    
    def _parse_transaction(self, tx: Any, block: Any) -> Dict[str, Any]:
        """Parse transaction into standardized format"""
        try:
            value_wei = tx.get('value', 0)
            value_eth = self.web3.from_wei(value_wei, 'ether')
            
            # Estimate USD value (simplified - in production, fetch real price)
            # For now, assume 1 MNT = $0.50 (update with real oracle)
            value_usd = float(value_eth) * 0.50
            
            # Detect transaction type
            tx_type = self._detect_tx_type(tx)
            
            parsed = {
                "hash": tx.get('hash', b'').hex() if isinstance(tx.get('hash'), bytes) else str(tx.get('hash', '')),
                "from": tx.get('from', ''),
                "to": tx.get('to', ''),
                "value": float(value_eth),
                "value_usd": value_usd,
                "gas_price": tx.get('gasPrice', 0),
                "gas_used": tx.get('gas', 0),
                "block_number": block.number,
                "timestamp": datetime.fromtimestamp(block.timestamp),
                "type": tx_type,
                "input": tx.get('input', '0x'),
                "protocol": self._detect_protocol(tx),
                "token": self._detect_token(tx)
            }
            
            return parsed
        except Exception as e:
            logger.error(f"Error parsing transaction: {e}")
            return {}
    
    def _detect_tx_type(self, tx: Any) -> str:
        """Detect transaction type from input data"""
        input_data = tx.get('input', '0x')
        
        if input_data == '0x' or len(input_data) <= 10:
            return "transfer"
        
        # Common DEX function signatures
        method_id = input_data[:10]
        
        method_map = {
            "0x38ed1739": "swap",  # swapExactTokensForTokens
            "0x7ff36ab5": "swap",  # swapExactETHForTokens
            "0x18cbafe5": "swap",  # swapExactTokensForETH
            "0xe8e33700": "add_liquidity",  # addLiquidity
            "0xf305d719": "add_liquidity",  # addLiquidityETH
            "0xbaa2abde": "remove_liquidity",  # removeLiquidity
            "0x02751cec": "remove_liquidity",  # removeLiquidityETH
            "0xa9059cbb": "transfer",  # ERC20 transfer
            "0x095ea7b3": "approve",  # ERC20 approve
        }
        
        return method_map.get(method_id, "unknown")
    
    def _detect_protocol(self, tx: Any) -> str:
        """Detect which protocol the transaction interacts with"""
        to_address = tx.get('to', '').lower()
        
        # Known protocol addresses on Mantle (update with real addresses)
        protocols = {
            # Add real addresses here
            "merchant_moe": "Merchant Moe",
            "agni_finance": "Agni Finance",
            "fusionx": "FusionX",
        }
        
        for key, name in protocols.items():
            if key in to_address:
                return name
        
        return "Unknown"
    
    def _detect_token(self, tx: Any) -> str:
        """Detect token involved in transaction"""
        # This would require decoding the input data
        # For MVP, return placeholder
        return "MNT"
    
    def get_gas_price(self) -> int:
        """Get current gas price from Mantle RPC"""
        try:
            gas_price = self.web3.eth.gas_price
            logger.debug(f"Current gas price: {gas_price} wei")
            return gas_price
        except Exception as e:
            logger.error(f"Error getting gas price: {e}")
            return 0
    
    def get_block_number(self) -> int:
        """Get current block number"""
        try:
            return self.web3.eth.block_number
        except Exception as e:
            logger.error(f"Error getting block number: {e}")
            return 0
    
    async def get_wallet_history(self, wallet: str, blocks: int = 1000) -> List[Dict[str, Any]]:
        """Get transaction history for a wallet"""
        try:
            current_block = self.web3.eth.block_number
            start_block = max(0, current_block - blocks)
            
            transactions = []
            
            # This is simplified - in production, use event logs or indexer
            for block_num in range(start_block, current_block + 1):
                try:
                    block = self.web3.eth.get_block(block_num, full_transactions=True)
                    
                    for tx in block.transactions:
                        if tx.get('from', '').lower() == wallet.lower() or \
                           tx.get('to', '').lower() == wallet.lower():
                            transactions.append(self._parse_transaction(tx, block))
                except Exception as e:
                    logger.debug(f"Error processing block {block_num}: {e}")
                    continue
            
            return transactions
        except Exception as e:
            logger.error(f"Error getting wallet history: {e}")
            return []
