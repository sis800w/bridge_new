// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./ChiToken.sol";

contract GasDiscount {

    ChiToken public immutable chi;

    constructor(ChiToken _chi) {
        chi = _chi;
    }

    // gas折扣
    modifier gasDiscount {
        uint256 gasStart = gasleft();
        _;
        uint256 gasSpent = 21000 + gasStart - gasleft() + 16 * msg.data.length;
        chi.freeFromUpTo(msg.sender, (gasSpent + 14154) / 41947);
    }

}