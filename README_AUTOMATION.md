# 🤖 Auto-Distribution Bot

This script automatically monitors the Liquidity Wallet for incoming USDT (Polygon) and sends back B21 tokens instantly.

## Setup

1. **Install Dependencies** (if not already done):
   ```bash
   npm install ethers
   ```

2. **Set Private Key**:
   You need the Private Key of the Liquidity Wallet (`0x7A08...`) which holds the B21 tokens.
   **DO NOT share this key.**

## Running the Bot

Run the following command in your terminal:

**Windows (PowerShell):**
```powershell
$env:LIQUIDITY_PRIVATE_KEY="your_private_key_here"; node scripts/auto_distribute.js
```

**Mac/Linux:**
```bash
LIQUIDITY_PRIVATE_KEY=your_private_key_here node scripts/auto_distribute.js
```

## How it Works
1. Connects to Polygon Mainnet.
2. Listens for `Transfer` events on the USDT contract.
3. If USDT is sent to your Liquidity Wallet:
   - Calculates B21 amount (`USDT / 0.012`).
   - Sends B21 back to the sender automatically.

## Requirements
- The Liquidity Wallet must have **MATIC** for gas fees.
- The Liquidity Wallet must have **B21 Tokens** to send.
