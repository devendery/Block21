// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title B21Crowdsale
 * @dev Crowdsale contract for Block21 (B21).
 * Users buy B21 with USDT (Polygon).
 * Rate is fixed: 1 B21 = 0.006 USDT.
 */

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}

contract B21Crowdsale {
    address public owner;
    IERC20 public token; // B21 Token
    IERC20 public usdt;  // USDT Token (Polygon)
    
    // Price: 0.006 USDT per 1 B21
    // USDT has 6 decimals. B21 has 8 decimals.
    // 1 B21 = 1 * 10^8 units.
    // 0.006 USDT = 6000 units (0.006 * 10^6).
    // Formula: B21 Amount = (USDT Amount * 10^2) / 6000 * 1000
    // Rate: 1000 B21 = 6 USDT.
    
    uint256 public rate; 
    
    uint256 public constant PRICE_PER_TOKEN = 6000; // 0.006 USDT (6 decimals)
    
    event TokensPurchased(address indexed purchaser, uint256 usdtAmount, uint256 tokenAmount);
    event Withdraw(uint256 amount);
    event WithdrawTokens(uint256 amount);

    constructor(address _token, address _usdt) {
        owner = msg.sender;
        token = IERC20(_token);
        usdt = IERC20(_usdt);
    }

    /**
     * @dev Buy tokens with USDT.
     * @param usdtAmount Amount of USDT to spend (in 6 decimals).
     */
    function buyTokens(uint256 usdtAmount) external {
        require(usdtAmount > 0, "Amount must be > 0");
        
        // 1. Calculate Token Amount
        // usdtAmount (6 decimals) -> B21 (8 decimals)
        // Price: 0.006 USDT = 1 B21
        // B21 = USDT / 0.006
        // B21 = (USDT * 10^8) / (0.006 * 10^6)
        // B21 = (USDT * 100) / 0.006
        // B21 = (USDT * 100 * 1000) / 6
        
        uint256 tokenAmount = (usdtAmount * 100 * 1000) / 6;
        
        // 2. Check Contract Balance
        require(token.balanceOf(address(this)) >= tokenAmount, "Insufficient tokens in contract");

        // 3. Transfer USDT from User to Owner (Directly)
        // Note: User must approve this contract to spend USDT first.
        bool success = usdt.transferFrom(msg.sender, owner, usdtAmount);
        require(success, "USDT transfer failed");

        // 4. Transfer B21 to User
        bool tokenSuccess = token.transfer(msg.sender, tokenAmount);
        require(tokenSuccess, "Token transfer failed");

        emit TokensPurchased(msg.sender, usdtAmount, tokenAmount);
    }

    /**
     * @dev Withdraw any accidental tokens sent to contract (Admin only).
     */
    function withdrawTokens(address _tokenAddress, uint256 _amount) external {
        require(msg.sender == owner, "Only owner");
        IERC20(_tokenAddress).transfer(owner, _amount);
    }
}
