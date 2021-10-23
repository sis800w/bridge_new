// SPDX-License-Identifier: GPLv3

pragma solidity >0.4.17;

interface ERC20Basic {
     function totalSupply() external view returns(uint);
     function balanceOf(address who) external view returns(uint);
     function transfer(address to, uint value) external;
     event Transfer(address indexed from, address indexed to, uint value);
}