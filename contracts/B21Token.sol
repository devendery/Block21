// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract B21Token is ERC20, Ownable {
    constructor() ERC20("Block21", "B21") Ownable(msg.sender) {
        // 2.1 Million Fixed Supply
        // 8 Decimals
        // 2,100,000 * 10^8
        _mint(msg.sender, 2100000 * 10**decimals());
    }

    function decimals() public view virtual override returns (uint8) {
        return 8;
    }
}
