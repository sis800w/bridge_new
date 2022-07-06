// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./Ownable.sol";

contract Sandwich01Admin is Ownable {
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
    function setRandom(uint8 random) external onlyOwner {
        sandwich.setRandom(random);
    }
    function setRandom(Sandwich _sandwich, uint8 random) external onlyOwner {
        _sandwich.setRandom(random);
    }
}

interface Sandwich {
    function setRandom(uint8 _random) external;
    function setAdmin(address addr, bool isAdmin) external;
}