// SPDX-License-Identifier: GPLv3

pragma solidity >0.4.17;

import "./StandardToken.sol";

abstract contract UpgradedStandardToken is StandardToken {
    function transferByLegacy(address from, address to, uint value) external virtual;
    function transferFromByLegacy(address sender, address from, address spender, uint value) external virtual;
    function approveByLegacy(address from, address spender, uint value) external virtual;
}