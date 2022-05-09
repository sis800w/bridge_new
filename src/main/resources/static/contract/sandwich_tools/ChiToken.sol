// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

interface ChiToken {
    function freeFromUpTo(address from, uint256 value) external;
}