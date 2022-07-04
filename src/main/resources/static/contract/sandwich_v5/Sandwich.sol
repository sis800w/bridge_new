// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./Sandwich00.sol";

contract Sandwich is Sandwich00 {
    ChiToken internal immutable chi;
    uint internal immutable feeRate;

    constructor(address _weth, ChiToken _chi, uint _feeRate) Sandwich00(_weth) {
        chi = _chi;
        feeRate = _feeRate;
    }
}

interface UniV2Pair {
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

interface ChiToken {
    function free(uint value) external returns (uint);
}

interface ERC20 {
    function balanceOf(address account) external view returns (uint);
    function transfer(address to, uint value) external returns (bool);
}

interface Destory {    
    function destory() external;
}

library SafeMath {
    function add(uint x, uint y) internal pure returns (uint z) {
        require((z = x + y) >= x, "ds-math-add-overflow");
    }
    function mul(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, "ds-math-mul-overflow");
    }
}

library UniswapV2Library {
    using SafeMath for uint;
    
    function getAmountOut(uint amountIn, address pair, bool inIsToken0, uint feeRate) internal view returns (uint amountOut) {
        (uint reserve0, uint reserve1,) = UniV2Pair(pair).getReserves();
        (uint reserveIn, uint reserveOut) = inIsToken0 ? (reserve0, reserve1) : (reserve1, reserve0);
        require(amountIn > 0, "INSUFFICIENT_INPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "INSUFFICIENT_LIQUIDITY");
        uint amountInWithFee = amountIn.mul(10000 - feeRate);
        uint numerator = amountInWithFee.mul(reserveOut);
        uint denominator = reserveIn.mul(10000).add(amountInWithFee);
        amountOut = numerator / denominator;
    }
}