// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./Ownable.sol";

contract Sandwich02Admin is Ownable {
    Sandwich private immutable sandwich;

    constructor(Sandwich _sandwich) {
        sandwich = _sandwich;
    }

    function setAdmin(address addr, bool isAdmin) external onlyOwner {
        sandwich.setAdmin(addr, isAdmin);
    }
    function setAdmin(Sandwich _sandwich, address addr, bool isAdmin) external onlyOwner {
        _sandwich.setAdmin(addr, isAdmin);
    }
    function addAddrs() external onlyOwner {
        sandwich.addAddrs(msg.data);
    }
    function addAddrs(Sandwich _sandwich) external onlyOwner {
        _sandwich.addAddrs(msg.data);
    }
    function addAddr(uint16 key, address addr) external onlyOwner {
        sandwich.addAddr(key, addr);
    }
    function addAddr(Sandwich _sandwich, uint16 key, address addr) external onlyOwner {
        _sandwich.addAddr(key, addr);
    }
    function removeAddr(address addr) external onlyOwner {
        sandwich.removeAddr(addr);
    }
    function removeAddr(Sandwich _sandwich, address addr) external onlyOwner {
        _sandwich.removeAddr(addr);
    }
}

interface Sandwich {
    function addAddrs(bytes memory data) external;
    function addAddr(uint16 key, address addr) external;
    function removeAddr(address addr) external;
    function setAdmin(address addr, bool isAdmin) external;
}