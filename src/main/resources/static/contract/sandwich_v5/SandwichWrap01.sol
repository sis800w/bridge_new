// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./SandwichWrap.sol";

// 非隐身版
contract SandwichWrap01 is SandwichWrap {
    constructor(address _weth, ChiToken _chi, uint _feeRate, Sandwich _sandwich) SandwichWrap(_weth, _chi, _feeRate, _sandwich) {}

    // 买（用slot）
    function d9_H82() external {
        buyWithSlot(true);
    }
    function g1_VAh() external {
        buyWithSlot(false);
    }
    function buyWithSlot(bool inIsToken0) private onlyOwner {
        // 基本参数
        bytes memory data = msg.data;
        uint112 amountIn; uint112 amountOutMin; address pair;
        assembly {
            amountIn := mload(add(data, 18))
            amountOutMin := mload(add(data, 32))
            pair := mload(add(data, 52))
        }

        // 必然失败单
        uint amountOut = UniswapV2Library.getAmountOut(amountIn, pair, inIsToken0, feeRate);
        if (amountOut < amountOutMin) {
            address slot;
            assembly { slot := mload(add(data, 72)) }
            Destory(slot).destory();
            return;
        }

        // 支付、交换
        (uint amount0Out, uint amount1Out) = inIsToken0 ? (uint(0), amountOut) : (amountOut, uint(0));
        sandwich.swap(weth, pair, amountIn, amount0Out, amount1Out);

        // gas退款
        uint end = 72;
        address slots;
        while(true) {
            assembly { slots := mload(add(data, end)) }
            if (slots == address(0)) break;
            Destory(slots).destory();
            end += 20;
        }
    }

    // 买（用chi）
    function k8__86() external {
        buyWithChi(true);
    }
    function ve_Jc2() external {
        buyWithChi(false);
    }
    function buyWithChi(bool inIsToken0) private onlyOwner {
        // 基本参数
        bytes memory data = msg.data;
        uint112 amountIn; uint112 amountOutMin; address pair; uint8 free;
        assembly {
            amountIn := mload(add(data, 18))
            amountOutMin := mload(add(data, 32))
            pair := mload(add(data, 52))
            free := mload(add(data, 53))
        }

        // 必然失败单
        uint amountOut = UniswapV2Library.getAmountOut(amountIn, pair, inIsToken0, feeRate);
        require(amountOut >= amountOutMin);

        // 支付、交换
        (uint amount0Out, uint amount1Out) = inIsToken0 ? (uint(0), amountOut) : (amountOut, uint(0));
        sandwich.swap(weth, pair, amountIn, amount0Out, amount1Out);

        // gas退款
        if (free > 0) chi.free(free);
    }

    // 卖
    function zc_Kcd() external {
        sell(true);
    }
    function bf_T2C() external {
        sell(false);
    }
    function sell(bool inIsToken0) private onlyOwner {
        // 基本参数
        bytes memory data = msg.data;
        address tokenIn;
        assembly {
            tokenIn := mload(add(data, 24))
        }

        // 必然失败单
        uint amountIn = ERC20(tokenIn).balanceOf(address(this));
        require(amountIn > 0);

        // 基本参数
        uint112 amountOutMin; address pair;
        assembly {
            pair := mload(add(data, 44))
            amountOutMin := mload(add(data, 58))
        }

        // 必然失败单
        uint amountOut = UniswapV2Library.getAmountOut(amountIn, pair, inIsToken0, feeRate);
        require(amountOut >= amountOutMin);

        // 支付、交换
        (uint amount0Out, uint amount1Out) = inIsToken0 ? (uint(0), amountOut) : (amountOut, uint(0));
        sandwich.swap(tokenIn, pair, amountIn, amount0Out, amount1Out);
    }

}