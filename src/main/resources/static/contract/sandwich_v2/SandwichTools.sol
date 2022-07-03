// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

contract SandwichTools {
    
    /* ******************* 常量/构造函数/事件 ****************** */

    address public immutable weth;
    UniswapV2Factory public immutable factory;
    ERC20 public immutable chi;

    constructor(address _weth, UniswapV2Factory _factory, ERC20 _chi) {
        weth = _weth;
        factory = _factory;
        chi = _chi;
    }



    /* ******************* 函数 ****************** */

    // 查询资金池
    function getReservesAndNativeReserves(address tokenIn, address tokenOut) external view returns(uint reserveIn, uint reserveOut, 
            uint nativePairReserveIn, uint nativePairReserveNative) {
        (reserveIn, reserveOut) = getReserves(tokenIn, tokenOut);
        address _weth = weth;
        if (tokenIn == _weth) {          // 原生币->ERC20，tokenIn价格为1
            nativePairReserveIn = reserveIn;
            nativePairReserveNative = reserveIn;
        } else if (tokenOut == _weth) {  // ERC20->原生币，tokenIn价格为reserveOut/reserveIn
            nativePairReserveIn = reserveIn;
            nativePairReserveNative = reserveOut;
        } else {                         // ERC20->ERC20，需要查【tokenIn/原生币】交易对的资金池，价格为ethPairReserveETH/ethPairReserveIn
            (nativePairReserveIn, nativePairReserveNative) = getReserves(tokenIn, _weth);
        }
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

    // 查询余额
    function getBalance(address contractAddress, address tokenAddress) external view returns(uint walletBalance, uint contractBalance, 
            uint chiBalance) {
        walletBalance = address(msg.sender).balance;
        contractBalance = ERC20(tokenAddress).balanceOf(contractAddress);
        chiBalance = chi.balanceOf(contractAddress);
    }
}

interface UniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

interface UniswapV2Pair {
    function token0() external view returns (address);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

interface ERC20 {
    function balanceOf(address account) external view returns (uint);
}