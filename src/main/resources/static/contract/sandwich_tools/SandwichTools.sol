// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./UniswapV2Factory.sol";
import "./UniswapV2Pair.sol";

contract SandwichTools {
    UniswapV2Factory public factory;

    // 构造函数
    constructor(UniswapV2Factory _factory) {
        factory = _factory;
    }

    // 查询资金池
    function getReserves(address tokenA, address tokenB) external view returns(uint reserveA, uint reserveB) {
        address pairAddr = factory.getPair(tokenA, tokenB);
        UniswapV2Pair pair = UniswapV2Pair(pairAddr);
        (uint reserve0, uint reserve1, ) = pair.getReserves();
        address token0 = pair.token0();
        if (token0 == tokenA) {
            return (reserve0, reserve1);
        } else {
            return (reserve1, reserve0);
        }
    }

}