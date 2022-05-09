// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./ChiToken.sol";
import "./Sandwich.sol";
import "./UniswapV2Router.sol";
import "./UniswapV2Factory.sol";
import "./UniswapV2Pair.sol";

contract SandwichTools is GasDiscount {
    
    /* ******************* 常量/构造函数/事件 ****************** */

    UniswapV2Router public immutable router;
    UniswapV2Factory public immutable factory;
    
    constructor(ChiToken _chi, UniswapV2Router _router, UniswapV2Factory _factory) GasDiscount(_chi) {
        router = _router;
        factory = _factory;
    }

    event NewSandwich(address indexed addr);



    /* ******************* 函数 ****************** */

    // 创建夹子合约
    function createSandwich() external gasDiscount {
        Sandwich sandwich = new Sandwich(chi, router, msg.sender);
        emit NewSandwich(address(sandwich));
    }

    // 查询资金池
    function getReservesAndNativeReserves(address tokenIn, address tokenOut) external view returns(uint reserveIn, uint reserveOut, 
            uint nativePairReserveIn, uint nativePairReserveNative) {
        (reserveIn, reserveOut) = getReserves(tokenIn, tokenOut);
        address WETH = router.WETH();
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

    // 查询资金池
    function getReserves(address tokenA, address tokenB) private view returns(uint reserveA, uint reserveB) {
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