// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./Sandwich.sol";

contract SandwichReverse is Sandwich {

    constructor(ChiToken _chi, address _token, address _weth, uint _feeRate) Sandwich(_chi, _token, _weth, _feeRate) {}
        
    // 精确out卖
    function ve_Jc2() external {
        sellExactOut(true, false);
    }
    function bf_T2C() external {
        sellExactOut(false, false);
    }
    function zc_Kcd() external {
        sellExactOut(true, true);
    }
    function k8__86() external {
        sellExactOut(false, true);
    }
    function sellExactOut(bool inIsToken0, bool inIsNative) private onlyOwner {
        // 参数
        uint112 amountOut; address pair; address tokenIn;
        bytes memory data = msg.data;
        assembly {
            amountOut := mload(add(data, 18))
            pair := mload(add(data, 38))
        }

        // 取tokenIn
        if (inIsNative) {
            tokenIn = weth;
        } else {
            assembly { tokenIn := mload(add(data, 58)) }
        }
        
        // 支付
        uint amountIn = getAmountIn(amountOut, pair, inIsToken0);
        require(ERC20(tokenIn).balanceOf(address(this)) >= amountIn);
        TransferHelper.safeTransfer(tokenIn, pair, amountIn);
        
        // 交换
        uint8 free;
        if (inIsNative) {
            assembly { free := mload(add(data, 39)) }
            swap(inIsToken0, amountOut, pair, free, data, 59);
        } else {
            assembly { free := mload(add(data, 59)) }
            swap(inIsToken0, amountOut, pair, free, data, 79);
        }        
    }

}