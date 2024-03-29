// SPDX-License-Identifier: MIT

pragma solidity 0.8.3;

import "./TransparentUpgradeableProxy.sol";

// 角色市场代理
contract SummonerMarketProxy is TransparentUpgradeableProxy {
    constructor (
        address _logic,
        address admin_,
        bytes memory _data
    ) payable TransparentUpgradeableProxy(_logic, admin_, _data) {}
}