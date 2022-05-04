// SPDX-License-Identifier: GPLv3

pragma solidity ^0.8.0;

import "./Ownable.sol";
import "./ERC20.sol";
import "./UniswapV2Factory.sol";
import "./UniswapV2Router.sol";
import "./UniswapV2Pair.sol";

contract Sandwich is Ownable {

    /* ******************* 写死 ****************** */

    UniswapV2Router public router;
    UniswapV2Factory public factory;
    address public WETH;



    /* ******************* 可改配置 ****************** */

    // 交易金额占资金池量最低比例（万倍）
    uint8 private amountReserveScaleMin = 30;
    // 最低买入量（换算成原生币）
    uint private amountInBuyMin = 10 ** 17;



    /* ******************* 构造函数 ****************** */
    
    // 构造函数
    constructor(UniswapV2Router _router) {
        reset(_router);
    }



    /* ******************* 写函数 ****************** */

    // 收币函数
    receive() external payable {}

    // 精确数量币换币
    function swapExactETHForTokens(uint amountIn, uint amountOutMin, address tokenOut, uint deadline) external {
        swapExactIn(amountIn, amountOutMin, WETH, tokenOut, deadline);
    }
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address tokenIn, uint deadline) external {
        swapExactIn(amountIn, amountOutMin, tokenIn, WETH, deadline);
    }
    function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address tokenIn, address tokenOut, uint deadline) external {
        swapExactIn(amountIn, amountOutMin, tokenIn, tokenOut, deadline);
    }
    function swapExactIn(uint amountIn, uint amountOutMin, address tokenIn, address tokenOut, uint deadline) private {
        // 验参
        require(amountIn > 0, "amountIn=0");
        require(amountOutMin > 0, "amountOutMin=0");
        require(block.timestamp <= deadline, "timeout");                                        // 打包超时即失败
        
        // 计算抢单支付量获得量
        (uint reserveIn, uint reserveOut) = getReserves(tokenIn, tokenOut);                     // 查询资金池
        require(amountIn >= reserveIn * amountReserveScaleMin / 10000, "amountIn too little");  // 买入太少
        uint amountOut = router.getAmountOut(amountIn, reserveIn, reserveOut);                  // 对手正常获得量
        require(amountOut > amountOutMin, "no slippage");                                       // 没有滑点
        uint amountInBuy = reserveIn * (amountOut - amountOutMin) / amountOut / 2;              // 抢单支付量
        limitBuy(amountInBuy, tokenIn);                                                         // 限制抢单买入量
        uint amountOutBuy = router.getAmountOut(amountInBuy, reserveIn, reserveOut);            // 抢单获得量
        
        // 确保对手获得量不低于下限（此步可省）
        uint reserveInNew = reserveIn + amountInBuy * 9975 / 10000;
        uint reserveOutNew = reserveOut - amountOutBuy;
        uint amountOutNew = router.getAmountOut(amountIn, reserveInNew, reserveOutNew);         // 对手夹后输出量
        require(amountOutNew >= amountOutMin, "amountOut too little");

        // 下单
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        if (tokenIn == WETH) {
            router.swapExactETHForTokens{value: amountInBuy}(amountOutBuy, path, address(this), block.timestamp);
        } else if (tokenOut == WETH) {
            approve(tokenIn, amountInBuy);
            router.swapExactTokensForETH(amountInBuy, amountOutBuy, path, address(this), block.timestamp);
        } else {
            approve(tokenIn, amountInBuy);
            router.swapExactTokensForTokens(amountInBuy, amountOutBuy, path, address(this), block.timestamp);
        }
    }

    // 币换精确数量币
    function swapETHForExactTokens(uint amountOut, uint amountInMax, address tokenOut, uint deadline) external {
        swapExactOut(amountOut, amountInMax, WETH, tokenOut, deadline);
    }
    function swapTokensForExactETH(uint amountOut, uint amountInMax, address tokenIn, uint deadline) external {
        swapExactOut(amountOut, amountInMax, tokenIn, WETH, deadline);
    }
    function swapTokensForExactTokens(uint amountOut, uint amountInMax, address tokenIn, address tokenOut, uint deadline) external {
        swapExactOut(amountOut, amountInMax, tokenIn, tokenOut, deadline);
    }
    function swapExactOut(uint amountOut, uint amountInMax, address tokenIn, address tokenOut, uint deadline) private {
        // 验参
        require(amountOut > 0, "amountOut=0");
        require(amountInMax > 0, "amountInMax=0");
        require(block.timestamp <= deadline, "timeout");                                        // 打包超时即失败

         // 计算抢单支付量获得量
        (uint reserveIn, uint reserveOut) = getReserves(tokenIn, tokenOut);                     // 查询资金池
        require(amountOut >= reserveOut * amountReserveScaleMin / 10000, "amountIn too little");// 买入太少
        uint amountIn = router.getAmountIn(amountOut, reserveIn, reserveOut);                   // 对手正常支付量
        require(amountInMax > amountIn, "no slippage");                                         // 没有滑点
        uint amountOutBuy = reserveOut * (amountInMax - amountIn) / amountInMax / 2;            // 抢单支付量
        uint amountInBuy = router.getAmountIn(amountOutBuy, reserveIn, reserveOut);             // 抢单获得量
        limitBuy(amountInBuy, tokenIn);                                                         // 限制抢单买入量

        // 确保对手获得量不低于下限（此步可省）
        uint reserveInNew = reserveIn + amountInBuy * 9975 / 10000;
        uint reserveOutNew = reserveOut - amountOutBuy;
        uint amountInNew = router.getAmountIn(amountOut, reserveInNew, reserveOutNew);          // 对手夹后输出量
        require(amountInNew <= amountInMax, "amountIn too much");

        // 下单
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        if (tokenIn == WETH) {
            router.swapETHForExactTokens{value: amountInBuy}(amountOutBuy, path, address(this), block.timestamp);
        } else if (tokenOut == WETH) {
            approve(tokenIn, amountInBuy);
            router.swapTokensForExactETH(amountOutBuy, amountInBuy, path, address(this), block.timestamp);
        } else {
            approve(tokenIn, amountInBuy);
            router.swapTokensForExactTokens(amountOutBuy, amountInBuy, path, address(this), block.timestamp);
        }
    }

    // 全部余额换币（卖出）
    function swapAllTokensForETH(address tokenIn) external {
        swapAll(tokenIn, WETH);
    }
    function swapAllETHForTokens(address tokenOut) external {
        swapAll(WETH, tokenOut);
    }
    function swapTokensETHForTokens(address tokenIn, address tokenOut) external {
        swapAll(tokenIn, tokenOut);
    }
    function swapAll(address tokenIn, address tokenOut) private {
        address _this = address(this);
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        uint amountIn = tokenIn == WETH ? _this.balance : ERC20(tokenIn).balanceOf(_this);
        require(amountIn > 0, "amountIn=0");
        uint amountOut = router.getAmountsOut(amountIn, path)[1];
        if (tokenIn == WETH) {
            router.swapExactETHForTokens{value: amountIn}(amountOut, path, _this, block.timestamp);
        } else if (tokenOut == WETH) {
            approve(tokenIn, amountIn);
            router.swapExactTokensForETH(amountIn, amountOut, path, _this, block.timestamp);
        } else {
            approve(tokenIn, amountIn);
            router.swapExactTokensForTokens(amountIn, amountOut, path, _this, block.timestamp);
        }
    }


    
    /* ******************* 读函数 ****************** */

    // 查询账户
    function querySummary() external view returns(uint8, uint, uint) {
        return (amountReserveScaleMin,
                amountInBuyMin,
                address(this).balance);
    }
    


    /* ******************* 写函数-owner ****************** */

    // 修改交易金额占资金池量最低比例（万倍）
    function updateAmountReserveScaleMin(uint8 _amountReserveScaleMin) external onlyOwner {
        require(_amountReserveScaleMin > 25, "_amountReserveScaleMin must be > 25");
        require(_amountReserveScaleMin <= 500, "_amountReserveScaleMin must be <= 500");
        amountReserveScaleMin = _amountReserveScaleMin;
    }

    // 修改最低买入量（换算成原生币）
    function updateAmountInBuyMin(uint8 _amountInBuyMin) external onlyOwner {
        require(_amountInBuyMin >= 10 ** 17, "_amountInBuyMin must be >= 0.1 ether");
        amountInBuyMin = _amountInBuyMin;
    }

    // 归集原生币（指定数量）
    function collectNative(address addr, uint amount) external onlyOwner {
        payable(addr).transfer(amount);
    }

    // 归集ERC20币（全部）
    function collect(address addr, address tokenAddr) external onlyOwner {
        ERC20 token = ERC20(tokenAddr);
        token.transfer(addr, token.balanceOf(address(this)));
    }

    // 重置
    function reset(UniswapV2Router _router) public onlyOwner {
        router = _router;
        factory = UniswapV2Factory(router.factory());
        WETH = router.WETH();
    }



    /* ******************* 私有 ****************** */

    // 授权
    function approve(address tokenIn, uint amountIn) private {
        ERC20 token = ERC20(tokenIn);
        uint allowance = token.allowance(address(this), address(router));
        if (allowance < amountIn) token.approve(address(router), 10 ** 50);
    }

    // 获取资金池
    function getReserves(address tokenIn, address tokenOut) private view returns (uint reserveIn, uint reserveOut) {
        UniswapV2Pair pair = UniswapV2Pair(factory.getPair(tokenIn, tokenOut));
        (uint reserve0, uint reserve1, ) = pair.getReserves();
        return pair.token0() == tokenIn ? (reserve0, reserve1) : (reserve1, reserve0);
    }

    // 限制买入量
    function limitBuy(uint amountInBuy, address tokenIn) private view {
        if (tokenIn == WETH) {
            require(amountInBuy >= amountInBuyMin, "amountInBuy too little");
        } else {
            address[] memory path = new address[](2);
            path[0] = tokenIn;
            path[1] = WETH;
            uint[] memory amounts = router.getAmountsIn(amountInBuy, path);     // 折算成原生币
            require(amounts[1] >= amountInBuyMin, "amountInBuy too little");
        }
    }
}