// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./Sandwich.sol";

// 内置除数，除数不可见，可授权多个合约来修改确保不被监听
contract Sandwich01 is Sandwich {
    uint8 internal random;

    constructor(address _weth, ChiToken _chi, uint _feeRate, uint8 _random) Sandwich(_weth, _chi, _feeRate) {
        random = _random;
    }

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
        uint112 amountIn; uint112 amountOutMin; address pair; uint8 pairR;
        assembly {
            amountIn := mload(add(data, 18))
            amountOutMin := mload(add(data, 32))
            pair := mload(add(data, 52))
            pairR := mload(add(data, 53))
        }
        pair = address(uint160(pair) * random + pairR);

        // 必然失败单
        uint amountOut = UniswapV2Library.getAmountOut(amountIn, pair, inIsToken0, feeRate);
        if (amountOut < amountOutMin) {
            address slot;
            assembly { slot := mload(add(data, 73)) }
            Destory(slot).destory();
            return;
        }

        // 支付、交换
        assert(ERC20(weth).transfer(pair, amountIn));
        (uint amount0Out, uint amount1Out) = inIsToken0 ? (uint(0), amountOut) : (amountOut, uint(0));
        UniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), new bytes(0));

        // gas退款
        uint end = 73;
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
        uint112 amountIn; uint112 amountOutMin; address pair; uint8 pairR; uint8 free;
        assembly {
            amountIn := mload(add(data, 18))
            amountOutMin := mload(add(data, 32))
            pair := mload(add(data, 52))
            pairR := mload(add(data, 53))
            free := mload(add(data, 54))
        }
        pair = address(uint160(pair) * random + pairR);

        // 必然失败单
        uint amountOut = UniswapV2Library.getAmountOut(amountIn, pair, inIsToken0, feeRate);
        require(amountOut >= amountOutMin);

        // 支付、交换
        assert(ERC20(weth).transfer(pair, amountIn));
        (uint amount0Out, uint amount1Out) = inIsToken0 ? (uint(0), amountOut) : (amountOut, uint(0));
        UniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), new bytes(0));

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
        address tokenIn; uint8 tokenInR;
        assembly {
            tokenIn := mload(add(data, 24))
            tokenInR := mload(add(data, 25))
        }
        uint8 _random = random;
        tokenIn = address(uint160(tokenIn) * _random + tokenInR);

        // 必然失败单
        uint amountIn = ERC20(tokenIn).balanceOf(address(this));
        require(amountIn > 0);

        // 基本参数
        uint112 amountOutMin; address pair; uint8 pairR;
        assembly {
            pair := mload(add(data, 45))
            pairR := mload(add(data, 46))
            amountOutMin := mload(add(data, 60))
        }
        pair = address(uint160(pair) * _random + pairR);

        // 必然失败单
        uint amountOut = UniswapV2Library.getAmountOut(amountIn, pair, inIsToken0, feeRate);
        require(amountOut >= amountOutMin);

        // 支付、交换
        TransferHelper.safeTransfer(tokenIn, pair, amountIn);
        (uint amount0Out, uint amount1Out) = inIsToken0 ? (uint(0), amountOut) : (amountOut, uint(0));
        UniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), new bytes(0));
    }

    // 配置
    function setRandom(uint8 _random) external onlyAdmin {
        random = _random;
    }
    function getRandom() external onlyOwner view returns(uint) {
        return random;
    }

}