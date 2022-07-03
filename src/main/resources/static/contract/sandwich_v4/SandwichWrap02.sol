// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

abstract contract Ownable {
    address internal immutable owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }
}

// 地址加密版
contract SandwichWrap02 is Ownable {
    Sandwich private immutable sandwich;

    constructor(Sandwich _sandwich) {
        sandwich = _sandwich;
    }

    function ve_Jc2() private onlyOwner {
        // 基本参数
        bytes memory data = msg.data;
        uint112 amountIn; uint112 amountOutMin; uint8 inIsToken0; address pair; uint8 pairR;
        assembly {
            amountIn := mload(add(data, 18))
            amountOutMin := mload(add(data, 32))
            inIsToken0 := mload(add(data, 33))
            pair := mload(add(data, 53))
            pairR := mload(add(data, 54))
        }

        // slot地址
        uint start = 55;
        uint size = (data.length - start) / 20;
        address[] memory slots = new address[](size);
        address slot;
        for (uint i = 0; i < size; i++) {
            start += 20;
            assembly { slot := mload(add(data, start)) }
            slots[i] = slot;
        }
        sandwich.buyWithSlot2(amountIn, amountOutMin, inIsToken0 == 1, pair, pairR, slots);
    }

    function bf_T2C() external onlyOwner {
        bytes memory data = msg.data;
        uint112 amountIn; uint112 amountOutMin; uint8 inIsToken0; address pair; uint8 pairR; uint8 free;
        assembly {
            amountIn := mload(add(data, 18))
            amountOutMin := mload(add(data, 32))
            inIsToken0 := mload(add(data, 33))
            pair := mload(add(data, 53))
            pairR := mload(add(data, 54))
            free := mload(add(data, 55))
        }
        sandwich.buyWithChi2(amountIn, amountOutMin, inIsToken0 == 1, pair, pairR, free);
    }

    function zc_Kcd() external onlyOwner {
        bytes memory data = msg.data;
        uint112 amountOutMin; uint8 inIsToken0; address pair; uint8 pairR; address tokenIn; uint8 tokenInR;
        assembly {
            amountOutMin := mload(add(data, 18))
            inIsToken0 := mload(add(data, 19))
            pair := mload(add(data, 39))
            pairR := mload(add(data, 40))
            tokenIn := mload(add(data, 60))
            tokenInR := mload(add(data, 61))
        }
        sandwich.sell2(amountOutMin, inIsToken0 == 1, pair, pairR, tokenIn, tokenInR);
    }

}

interface Sandwich {
    function buyWithSlot2(uint amountIn, uint amountOutMin, bool inIsToken0, address pair, uint8 pairR, address[] calldata slots) external;
    function buyWithChi2(uint amountIn, uint amountOutMin, bool inIsToken0, address pair, uint8 pairR, uint8 free) external;
    function sell2(uint amountOutMin, bool inIsToken0, address pair, uint8 pairR, address tokenIn, uint8 tokenInR) external;
}