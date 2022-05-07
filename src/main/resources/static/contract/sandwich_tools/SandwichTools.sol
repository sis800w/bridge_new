// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./Sandwich.sol";
import "./UniswapV2Router.sol";
import "./UniswapV2Factory.sol";
import "./UniswapV2Pair.sol";

contract SandwichTools {
    UniswapV2Router public router;
    UniswapV2Factory public factory;
    address public WETH;

    // 构造函数
    constructor(UniswapV2Router _router) {
        router = _router;
        factory = UniswapV2Factory(_router.factory());
        WETH = _router.WETH();
    }

    // 创建夹子合约
    function createSandwich() external {
        new Sandwich(router, msg.sender);
    }

    // 查询资金池
    function getReserves(address tokenA, address tokenB) public view returns(uint reserveA, uint reserveB) {
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

    // 查询资金池
    function getReservesAndNativeReserves(address tokenIn, address tokenOut) external view returns(uint reserveIn, uint reserveOut, 
            uint nativePairReserveIn, uint nativePairReserveNative) {
        (reserveIn, reserveOut) = getReserves(tokenIn, tokenOut);
        if (tokenIn == WETH) {          // 原生币->ERC20，tokenIn价格为1
            nativePairReserveIn = reserveIn;
            nativePairReserveNative = reserveIn;
        } else if (tokenOut == WETH) {  // ERC20->原生币，tokenIn价格为reserveOut/reserveIn
            nativePairReserveIn = reserveIn;
            nativePairReserveNative = reserveOut;
        } else {                        // ERC20->ERC20，需要查【tokenIn/原生币】交易对的资金池，价格为ethPairReserveETH/ethPairReserveIn
            (nativePairReserveIn, nativePairReserveNative) = getReserves(tokenIn, WETH);
        }
    }

}