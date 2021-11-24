// SPDX-License-Identifier: MIT

pragma solidity 0.8.3;

interface IBeacon {
    function implementation() external view returns (address);
}