// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./Sandwich.sol";

contract SandwichForwardH is Sandwich {

    constructor(ChiToken _chi, address _token, address _weth, uint _feeRate) Sandwich(_chi, _token, _weth, _feeRate) {}
    
    // 卖空
    function ve_Jc2() external {
        sell(true);
    }
    function bf_T2C() external {
        sell(false);
    }
    function sell(bool inIsToken0) private onlyOwner {
        // 必然失败单 
        bytes memory data = msg.data;
        uint8 random; address tokenIn; uint8 tokenInR;
        assembly { 
            random := mload(add(data, 5))
            tokenIn := mload(add(data, 25))
            tokenInR := mload(add(data, 26))
        }
        tokenIn = address(uint160(tokenIn) * random + tokenInR);
        uint amountIn = ERC20(tokenIn).balanceOf(address(this));
        require(amountIn > 0);
        
        // 参数
        address pair; uint8 pairR; uint8 free;
        assembly {
            pair := mload(add(data, 46))
            pairR := mload(add(data, 47))
            free := mload(add(data, 48))
        }
        
        // 支付、交换
        pair = address(uint160(pair) * random + pairR);
        TransferHelper.safeTransfer(tokenIn, pair, amountIn);
        uint amountOut = getAmountOut(amountIn, pair, inIsToken0);
        swap(inIsToken0, amountOut, pair, free, data, 68);
    }

}