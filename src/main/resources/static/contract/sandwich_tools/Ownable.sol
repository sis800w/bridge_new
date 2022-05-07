// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

abstract contract Ownable {
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }

}