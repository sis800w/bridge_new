// SPDX-License-Identifier: GPLv3

pragma solidity >0.4.17;

contract Ownable {
    address public owner;
    constructor() {
        owner = msg.sender;
    }
    modifier onlyOwner(){
        require(msg.sender == owner, "only owner");
        _;
    }
    function transferOwnership(address newOwner) public onlyOwner{
        require(newOwner != address(0));
        owner = newOwner;
    }
}