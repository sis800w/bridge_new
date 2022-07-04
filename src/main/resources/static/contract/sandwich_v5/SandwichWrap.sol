// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./Ownable.sol";

contract SandwichWrap is Ownable {
    ChiToken internal immutable chi;
    address internal immutable weth;
    uint internal immutable feeRate;
    Sandwich internal immutable sandwich;

    constructor(address _weth, ChiToken _chi, uint _feeRate, Sandwich _sandwich) {
        weth = _weth;
        chi = _chi;
        feeRate = _feeRate;
        sandwich = _sandwich;
    }
}

interface UniswapV2Pair {
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

interface ChiToken {
    function free(uint value) external returns (uint);
}

interface ERC20 {
    function balanceOf(address account) external view returns (uint);
}

interface Destory {    
    function destory() external;
}

interface Sandwich {
    function swap(address tokenIn, address pair, uint amountIn, uint amount0Out, uint amount1Out) external;
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
        (uint reserve0, uint reserve1,) = UniswapV2Pair(pair).getReserves();
        (uint reserveIn, uint reserveOut) = inIsToken0 ? (reserve0, reserve1) : (reserve1, reserve0);
        require(amountIn > 0, "INSUFFICIENT_INPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "INSUFFICIENT_LIQUIDITY");
        uint amountInWithFee = amountIn.mul(10000 - feeRate);
        uint numerator = amountInWithFee.mul(reserveOut);
        uint denominator = reserveIn.mul(10000).add(amountInWithFee);
        amountOut = numerator / denominator;
    }
}