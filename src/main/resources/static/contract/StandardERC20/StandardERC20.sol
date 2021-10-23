// SPDX-License-Identifier: GPLv3

pragma solidity ^0.8.0;

import "./ERC20.sol";

contract StandardERC20 is ERC20 {

    constructor(string memory name_, string memory symbol_, uint amount) ERC20(name_, symbol_) {
        _mint(_msgSender(), amount * (10 ** 18));
    }
    
}