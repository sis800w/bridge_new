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

// 地址列表版
contract SandwichWrap01 is Ownable {
    Sandwich private immutable sandwich;

    constructor(Sandwich _sandwich) {
        sandwich = _sandwich;
    }

    function ve_Jc2() external onlyOwner {
        // 基本参数
        bytes memory data = msg.data;
        uint112 amountIn; uint112 amountOutMin; uint8 inIsToken0; uint16 pairIndex;
        assembly {
            amountIn := mload(add(data, 18))
            amountOutMin := mload(add(data, 32))
            inIsToken0 := mload(add(data, 33))
            pairIndex := mload(add(data, 35))
        }

        // slot地址
        uint start = 35;
        uint size = (data.length - start) / 20;
        address[] memory slots = new address[](size);
        address slot;
        for (uint i = 0; i < size; i++) {
            start += 20;
            assembly { slot := mload(add(data, start)) }
            slots[i] = slot;
        }
        sandwich.buyWithSlot1(amountIn, amountOutMin, inIsToken0 == 1, pairIndex, slots);
    }

    function bf_T2C() external onlyOwner {
        bytes memory data = msg.data;
        uint112 amountIn; uint112 amountOutMin; uint8 inIsToken0; uint16 pairIndex; uint8 free;
        assembly {
            amountIn := mload(add(data, 18))
            amountOutMin := mload(add(data, 32))
            inIsToken0 := mload(add(data, 33))
            pairIndex := mload(add(data, 35))
            free := mload(add(data, 36))
        }
        sandwich.buyWithChi1(amountIn, amountOutMin, inIsToken0 == 1, pairIndex, free);
    }

    function zc_Kcd() external onlyOwner {
        bytes memory data = msg.data;
        uint112 amountOutMin; uint8 inIsToken0; uint16 pairIndex; uint16 tokenInIndex;
        assembly {
            amountOutMin := mload(add(data, 18))
            inIsToken0 := mload(add(data, 19))
            pairIndex := mload(add(data, 21))
            tokenInIndex := mload(add(data, 23))
        }
        sandwich.sell1(amountOutMin, inIsToken0 == 1, pairIndex, tokenInIndex);
    }
    
}

interface Sandwich {
    function buyWithSlot1(uint amountIn, uint amountOutMin, bool inIsToken0, uint pairIndex, address[] calldata slots) external;
    function buyWithChi1(uint amountIn, uint amountOutMin, bool inIsToken0, uint pairIndex, uint8 free) external;
    function sell1(uint amountOutMin, bool inIsToken0, uint pairIndex, uint tokenInIndex) external;
}