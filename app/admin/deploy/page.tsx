"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { ethers } from "ethers";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { B21_CONTRACT_ADDRESS, OWNER_WALLET_ADDRESS } from "@/lib/utils";

// Minimal Bytecode/ABI for deployment would typically be imported.
// Since we don't have the compiled artifact here without running 'hardhat compile',
// I will simulate the "Deployment" flow or provide instructions.
// However, for a REAL user experience without backend compilation, 
// the best way is to use a pre-compiled bytecode string.

// PLAN: Since I cannot compile Solidity in the browser easily without artifacts,
// I will guide the user to use REMIX or provide a "Factory" approach if I had one.
// Given constraints: I will create a guide page with the Code they need to copy-paste into Remix.
// This is safer and more reliable than trying to inject 5KB of bytecode string here.

export default function DeployPage() {
  const { address, isConnected, connectWallet } = useWallet();
  const [copied, setCopied] = useState(false);

  const contractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract B21Crowdsale {
    address public owner;
    IERC20 public token;
    IERC20 public usdt;
    
    // Price: 0.006 USDT per 1 B21
    // Formula: (USDT * 1e12 * 1000) / 6
    
    event TokensPurchased(address indexed purchaser, uint256 usdtAmount, uint256 tokenAmount);

    constructor(address _token, address _usdt) {
        owner = msg.sender;
        token = IERC20(_token);
        usdt = IERC20(_usdt);
    }

    function buyTokens(uint256 usdtAmount) external {
        require(usdtAmount > 0, "Amount > 0");
        uint256 tokenAmount = (usdtAmount * 1e12 * 1000) / 6;
        require(token.balanceOf(address(this)) >= tokenAmount, "Insufficient B21 in contract");
        require(usdt.transferFrom(msg.sender, owner, usdtAmount), "USDT transfer failed");
        require(token.transfer(msg.sender, tokenAmount), "Token transfer failed");
        emit TokensPurchased(msg.sender, usdtAmount, tokenAmount);
    }
    
    function withdrawTokens(address _tokenAddress, uint256 _amount) external {
        require(msg.sender == owner, "Only owner");
        IERC20(_tokenAddress).transfer(owner, _amount);
    }
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(contractCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 max-w-4xl mx-auto">
      <div className="glass-card rounded-2xl p-8 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <h1 className="text-3xl font-heading font-black mb-6 text-white flex items-center gap-3 relative z-10">
          <span className="text-gold-500">Deploy</span> Crowdsale Contract
        </h1>

        <div className="space-y-6 relative z-10">
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-5 rounded-xl flex gap-3">
            <AlertTriangle className="text-yellow-500 flex-shrink-0" />
            <div className="text-sm text-yellow-200">
              <p className="font-bold mb-1">Deployment Required</p>
              <p>Since this is a decentralized application, you need to deploy the Crowdsale Smart Contract to the Polygon blockchain. This contract will handle the B21 sales securely.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Step 1 */}
            <div>
              <h3 className="text-xl font-heading font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gold-500 text-black text-xs flex items-center justify-center font-bold">1</span>
                  Copy Contract Code
              </h3>
              <div className="relative group">
                <pre className="glass-panel p-4 rounded-xl border border-white/10 text-xs text-gray-400 overflow-y-auto h-64 font-mono">
                  {contractCode}
                </pre>
                <button 
                  onClick={copyCode}
                  className="absolute top-2 right-2 px-3 py-1 bg-gold-500 hover:bg-yellow-400 text-black text-xs font-bold rounded transition-colors shadow-lg"
                >
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div>
               <h3 className="text-xl font-heading font-bold text-white mb-4 flex items-center gap-2">
                   <span className="w-6 h-6 rounded-full bg-gold-500 text-black text-xs flex items-center justify-center font-bold">2</span>
                   Deploy on Remix
               </h3>
               <ol className="space-y-4 text-gray-300 list-decimal list-inside bg-white/5 p-6 rounded-xl border border-white/5">
                  <li>Go to <a href="https://remix.ethereum.org" target="_blank" className="text-gold-500 hover:underline font-bold">Remix IDE</a>.</li>
                  <li>Create a new file <code>B21Crowdsale.sol</code> and paste the code.</li>
                  <li>Compile the contract (Ctrl+S).</li>
                  <li>Go to "Deploy & Run Transactions" tab.</li>
                  <li>Select "Injected Provider - MetaMask" as Environment.</li>
                  <li>
                    Fill Constructor Arguments:
                    <ul className="pl-6 mt-2 space-y-2 text-sm text-gray-400">
                        <li><strong>_token:</strong> <span className="font-mono text-gold-500 select-all bg-black/30 px-1 rounded">{B21_CONTRACT_ADDRESS}</span></li>
                        <li><strong>_usdt:</strong> <span className="font-mono text-gold-500 select-all bg-black/30 px-1 rounded">0xc2132D05D31c914a87C6611C10748AEb04B58e8F</span></li>
                    </ul>
                  </li>
                  <li>Click <strong>Transact</strong> and confirm in MetaMask.</li>
                  <li>Copy the new Contract Address.</li>
               </ol>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
             <h3 className="text-xl font-heading font-bold text-white mb-4 flex items-center gap-2">
                 <span className="w-6 h-6 rounded-full bg-gold-500 text-black text-xs flex items-center justify-center font-bold">3</span>
                 Fund the Contract
             </h3>
             <p className="text-gray-400 mb-4">
                After deploying, you must send B21 tokens to the new contract address so users can buy them.
             </p>
             <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-xl">
                <p className="text-blue-200 text-sm">
                   <strong>Formula:</strong> Send <code>210,000 B21</code> (ICO Allocation) to the new contract address.
                </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
