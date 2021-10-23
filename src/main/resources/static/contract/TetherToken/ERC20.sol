// SPDX-License-Identifier: GPLv3

pragma solidity >0.4.17;

import "./ERC20Basic.sol";

interface ERC20 is ERC20Basic {
    function allowance(address owner, address spender) external view returns(uint);
    function transferFrom(address from, address to, uint value) external;
    function approve(address spender, uint value) external;
    event Approval(address indexed owner, address indexed spender, uint value);
}