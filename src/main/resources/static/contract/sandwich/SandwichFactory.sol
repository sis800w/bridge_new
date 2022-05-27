// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./Sandwich.sol";

contract SandwichFactory {
    
    ChiToken public immutable chi;
    IWETH public immutable weth;
    uint public immutable feeRate;

    event NewSandwich(address indexed addr);

    constructor(ChiToken _chi, IWETH _weth, uint _feeRate) {
        chi = _chi;
        weth = _weth;
        feeRate = _feeRate;
    }

    function createSandwich() external {
        Sandwich sandwich = new Sandwich(chi, weth, msg.sender, feeRate);
        emit NewSandwich(address(sandwich));
    }

}