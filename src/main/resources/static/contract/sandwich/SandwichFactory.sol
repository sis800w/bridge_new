// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./Sandwich.sol";

contract SandwichFactory {
    
    /* ******************* 常量/构造函数/事件 ****************** */

    ChiToken public immutable chi;
    IWETH public immutable weth;
    UniswapV2Factory public immutable factory;
    uint public immutable feeRate;

    constructor(ChiToken _chi, IWETH _weth, UniswapV2Factory _factory, uint _feeRate) {
        chi = _chi;
        weth = _weth;
        factory = _factory;
        feeRate = _feeRate;
    }

    event NewSandwich(address indexed addr);



    /* ******************* 函数 ****************** */

    // 创建夹子合约
    function createSandwich() external {
        Sandwich sandwich = new Sandwich(chi, weth, msg.sender, feeRate);
        emit NewSandwich(address(sandwich));
    }

    // 查询资金池
    function getReservesAndNativeReserves(address tokenIn, address tokenOut) external view returns(uint reserveIn, uint reserveOut, 
            uint nativePairReserveIn, uint nativePairReserveNative) {
        (reserveIn, reserveOut) = getReserves(tokenIn, tokenOut);
        address _weth = address(weth);
        if (tokenIn == _weth) {          // 原生币->ERC20，tokenIn价格为1
            nativePairReserveIn = reserveIn;
            nativePairReserveNative = reserveIn;
        } else if (tokenOut == _weth) {  // ERC20->原生币，tokenIn价格为reserveOut/reserveIn
            nativePairReserveIn = reserveIn;
            nativePairReserveNative = reserveOut;
        } else {                        // ERC20->ERC20，需要查【tokenIn/原生币】交易对的资金池，价格为ethPairReserveETH/ethPairReserveIn
            (nativePairReserveIn, nativePairReserveNative) = getReserves(tokenIn, _weth);
        }
    }

    // 查询资金池
    function getReserves(address tokenA, address tokenB) public view returns(uint reserveA, uint reserveB) {
        address pairAddr = factory.getPair(tokenA, tokenB);
        UniV2Pair pair = UniV2Pair(pairAddr);
        (uint reserve0, uint reserve1, ) = pair.getReserves();
        address token0 = pair.token0();
        if (token0 == tokenA) {
            return (reserve0, reserve1);
        } else {
            return (reserve1, reserve0);
        }
    }
}

interface UniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

interface UniV2Pair is UniswapV2Pair {
    function token0() external view returns (address);
}