// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./Sandwich.sol";

// 内置地址，地址不可见，可授权多个合约来修改确保不被监听
contract Sandwich02 is Sandwich {
    mapping(uint16 => address) private addrs;
    mapping(address => uint16) private keys;

    constructor(address _weth, ChiToken _chi, uint _feeRate) Sandwich(_weth, _chi, _feeRate) {
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
        uint112 amountIn; uint112 amountOutMin; uint16 pairKey;
        assembly {
            amountIn := mload(add(data, 18))
            amountOutMin := mload(add(data, 32))
            pairKey := mload(add(data, 34))
        }
        address pair = addrs[pairKey];

        // 必然失败单
        uint amountOut = UniswapV2Library.getAmountOut(amountIn, pair, inIsToken0, feeRate);
        if (amountOut < amountOutMin) {
            address slot;
            assembly { slot := mload(add(data, 54)) }
            Destory(slot).destory();
            return;
        }

        // 支付、交换
        assert(ERC20(weth).transfer(pair, amountIn));
        (uint amount0Out, uint amount1Out) = inIsToken0 ? (uint(0), amountOut) : (amountOut, uint(0));
        UniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), new bytes(0));

        // gas退款
        uint end = 54;
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
        uint112 amountIn; uint112 amountOutMin; uint16 pairKey; uint8 free;
        assembly {
            amountIn := mload(add(data, 18))
            amountOutMin := mload(add(data, 32))
            pairKey := mload(add(data, 34))
            free := mload(add(data, 35))
        }
        address pair = addrs[pairKey];

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
        uint16 tokenInKey;
        assembly {
            tokenInKey := mload(add(data, 6))
        }
        address tokenIn = addrs[tokenInKey];

        // 必然失败单
        uint amountIn = ERC20(tokenIn).balanceOf(address(this));
        require(amountIn > 0);

        // 基本参数
        uint16 pairKey; uint112 amountOutMin;
        assembly {
            pairKey := mload(add(data, 8))
            amountOutMin := mload(add(data, 22))
        }
        address pair = addrs[pairKey];

        // 必然失败单
        uint amountOut = UniswapV2Library.getAmountOut(amountIn, pair, inIsToken0, feeRate);
        require(amountOut >= amountOutMin);

        // 支付、交换
        TransferHelper.safeTransfer(tokenIn, pair, amountIn);
        (uint amount0Out, uint amount1Out) = inIsToken0 ? (uint(0), amountOut) : (amountOut, uint(0));
        UniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), new bytes(0));
    }

    // 配置
    function addAddrs() external {
        addAddrsPrivate(msg.data);
    }
    function addAddrs(bytes memory data) external {
        addAddrsPrivate(data);
    }
    function addAddrsPrivate(bytes memory data) private onlyAdmin {
        uint keyEnd = 6; uint addrEnd = 26; uint16 key; address addr;
        while(true) {
            assembly {
                key := mload(add(data, keyEnd))
                addr := mload(add(data, addrEnd))
            }
            if (key == 0) break;
            if (addr == address(0)) break;
            addrs[key] = addr;
            keys[addr] = key;
            keyEnd += 22;
            addrEnd += 22;
        }
    }
    function addAddr(uint16 key, address addr) external onlyAdmin {
        require(key > 0);
        require(addr != address(0));
        addrs[key] = addr;
        keys[addr] = key;
    }
    function removeAddr(address addr) external onlyAdmin {
        uint16 key = keys[addr];
        delete addrs[key];
        delete keys[addr];
    }
    function getAddr(uint16 key) external onlyAdmin view returns(address) {
        return addrs[key];
    }
    function getKey(address addr) external onlyAdmin view returns(uint16) {
        return keys[addr];
    }
    function getKey(address addr1, address addr2) external onlyAdmin view returns(uint16, uint16) {
        return (keys[addr1], keys[addr2]);
    }
}