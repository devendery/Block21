const { ethers } = require("ethers");

// --- CONFIGURATION ---
const RPC_URL = "https://polygon-rpc.com"; // Polygon Mainnet
const LIQUIDITY_WALLET = "0x7A085FC48397bC0020F9e3979F2061B53F87eC1c"; // The wallet receiving USDT
const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // USDT Contract
const B21_ADDRESS = "0x9e885a4b54a04c8311e8c480f89c0e92cc0a1db2"; // B21 Contract (from lib/utils.ts)
const B21_PRICE = 0.012; // $0.012 per B21

// Private Key of the Liquidity Wallet (MUST SET IN ENVIRONMENT)
// WARNING: NEVER COMMIT PRIVATE KEYS TO GITHUB
const PRIVATE_KEY = process.env.LIQUIDITY_PRIVATE_KEY;

if (!PRIVATE_KEY) {
    console.error("❌ ERROR: Missing LIQUIDITY_PRIVATE_KEY in environment variables.");
    console.log("👉 Usage: set LIQUIDITY_PRIVATE_KEY=your_key && node scripts/auto_distribute.js");
    process.exit(1);
}

// --- ABIs ---
const ERC20_ABI = [
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address account) view returns (uint256)"
];

async function main() {
    console.log("🤖 Starting B21 Auto-Distributor...");
    console.log(`📍 Monitoring Wallet: ${LIQUIDITY_WALLET}`);
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    const usdtContract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider);
    const b21Contract = new ethers.Contract(B21_ADDRESS, ERC20_ABI, wallet); // Connect wallet for sending

    // Verify Wallet Balance
    const b21Balance = await b21Contract.balanceOf(wallet.address);
    console.log(`💰 Distributor B21 Balance: ${ethers.formatUnits(b21Balance, 8)} B21`);

    console.log("👀 Listening for USDT transfers...");

    // Listen for USDT Transfer events
    usdtContract.on("Transfer", async (from, to, value, event) => {
        try {
            // Check if the recipient is our Liquidity Wallet
            if (to.toLowerCase() !== LIQUIDITY_WALLET.toLowerCase()) return;

            console.log(`\n🔔 Incoming USDT detected!`);
            console.log(`   From: ${from}`);
            console.log(`   Value: ${ethers.formatUnits(value, 6)} USDT`);
            console.log(`   TxHash: ${event.log.transactionHash}`);

            // Calculate B21 Amount
            // Value is 6 decimals. B21 is 8 decimals.
            // Formula: (USDT / 0.012)
            
            const usdtFloat = parseFloat(ethers.formatUnits(value, 6));
            const b21AmountFloat = usdtFloat / B21_PRICE;
            const b21AmountWei = ethers.parseUnits(b21AmountFloat.toFixed(8), 8);

            console.log(`   🧮 Calculated B21: ${b21AmountFloat} B21`);

            // Send B21
            console.log(`   🚀 Sending B21...`);
            const tx = await b21Contract.transfer(from, b21AmountWei);
            console.log(`   ✅ Sent! TxHash: ${tx.hash}`);
            
            // Wait for confirmation
            await tx.wait();
            console.log(`   🎉 Transaction Confirmed!`);

        } catch (error) {
            console.error("❌ Error processing transaction:", error);
        }
    });
}

main().catch((error) => {
    console.error("Fatal Error:", error);
    process.exit(1);
});
