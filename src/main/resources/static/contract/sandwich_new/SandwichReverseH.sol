// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./Sandwich.sol";

contract SandwichReverseH is Sandwich {

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
        uint112 amountOut; uint8 random; address pair; uint8 pairR; address tokenIn;
        bytes memory data = msg.data;
        assembly {
            amountOut := mload(add(data, 18))
            random := mload(add(data, 19))
            pair := mload(add(data, 39))
            pairR := mload(add(data, 40))
        }
        pair = address(uint160(pair) * random + pairR);

        // 取tokenIn
        if (inIsNative) {
            tokenIn = weth;
        } else {
            uint8 tokenInR;
            assembly {
                tokenIn := mload(add(data, 60))
                tokenInR := mload(add(data, 61))
            }
            tokenIn = address(uint160(tokenIn) * random + tokenInR);
        }
        
        // 支付
        uint amountIn = getAmountIn(amountOut, pair, inIsToken0);
        require(ERC20(tokenIn).balanceOf(address(this)) >= amountIn);
        TransferHelper.safeTransfer(tokenIn, pair, amountIn);
        
        // 交换
        uint8 free;
        if (inIsNative) {
            assembly { free := mload(add(data, 41)) }
            swap(inIsToken0, amountOut, pair, free, data, 61);
        } else {
            assembly { free := mload(add(data, 62)) }
            swap(inIsToken0, amountOut, pair, free, data, 72);
        }        
    }

}