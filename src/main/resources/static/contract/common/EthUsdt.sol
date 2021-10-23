// SPDX-License-Identifier: GPLv3

pragma solidity ^0.8.0;

interface ETHUSDT {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external;
    function transferFrom(address sender, address recipient, uint256 amount) external;
    function decimals() external view returns (uint8);
}