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

contract ConfigWrap02 is Ownable {
    function setCaller(Sandwich sandwich, address addr, bool caller) external onlyOwner {
        sandwich.setCaller(addr, caller);
    }
    function setRandom(Sandwich sandwich, uint8 random) external onlyOwner {
        sandwich.setRandom(random);
    }
    function addAddr(Sandwich sandwich, address addr) external onlyOwner {
        sandwich.addAddr(addr);
    }
    function removeAddr(Sandwich sandwich, address addr) external onlyOwner {
        sandwich.removeAddr(addr);
    }
}

interface Sandwich {
    function setCaller(address addr, bool caller) external;
    function setRandom(uint8 _random) external;
    function addAddr(address addr) external;
    function removeAddr(address addr) external;    
}