// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./Ownable.sol";
import "./ERC20.sol";
import "./UniswapV2Router.sol";

contract Sandwich is Ownable {

    /* ******************* 写死 ****************** */

    UniswapV2Router public router;
    address public WETH;



    /* ******************* 构造函数 ****************** */
    
    // 构造函数
    constructor(UniswapV2Router _router, address owner) Ownable(owner) {
        router = _router;
        WETH = router.WETH();
    }



    /* ******************* 写函数-owner ****************** */

    // 收币函数
    receive() external payable {}
    
    // 买币
    function swapETHForToken(uint amountIn, uint amountOut, address tokenOut, uint lastBlockNumber) external onlyOwner {
        swapTokenForToken(amountIn, amountOut, WETH, tokenOut, lastBlockNumber);
    }
    function swapTokenForETH(uint amountIn, uint amountOut, address tokenIn, uint lastBlockNumber) external onlyOwner {
        swapTokenForToken(amountIn, amountOut, tokenIn, WETH, lastBlockNumber);
    }
    function swapTokenForToken(uint amountIn, uint amountOut, address tokenIn, address tokenOut, uint lastBlockNumber) public onlyOwner {
        require(block.number <= lastBlockNumber, "block delay");
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        if (tokenIn == WETH) {
            router.swapETHForExactTokens{value: amountIn}(amountOut, path, address(this), block.timestamp);
        } else if (tokenOut == WETH) {
            approve(tokenIn, amountIn);
            router.swapTokensForExactETH(amountOut, amountIn, path, address(this), block.timestamp);
        } else {
            approve(tokenIn, amountIn);
            router.swapTokensForExactTokens(amountOut, amountIn, path, address(this), block.timestamp);
        }
    }

    // 卖币
    function swapAllTokenForETH(address tokenIn) external onlyOwner {
        uint amountIn = ERC20(tokenIn).balanceOf(address(this));
        swapPartTokenForToken(tokenIn, WETH, amountIn);
    }
    function swapAllETHForToken(address tokenOut) external onlyOwner {
        uint amountIn = address(this).balance;
        swapPartTokenForToken(WETH, tokenOut, amountIn);
    }
    function swapAllTokenForToken(address tokenIn, address tokenOut) external onlyOwner {
        uint amountIn = ERC20(tokenIn).balanceOf(address(this));
        swapPartTokenForToken(tokenIn, tokenOut, amountIn);
    }
    function swapPartTokenForETH(address tokenIn, uint amountIn) external onlyOwner {
        swapPartTokenForToken(tokenIn, WETH, amountIn);
    }
    function swapPartETHForToken(address tokenOut, uint amountIn) external onlyOwner {
        swapPartTokenForToken(WETH, tokenOut, amountIn);
    }
    function swapPartTokenForToken(address tokenIn, address tokenOut, uint amountIn) public onlyOwner {
        require(amountIn > 0, "amountIn=0");
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        uint amountOut = router.getAmountsOut(amountIn, path)[1];
        if (tokenIn == WETH) {
            router.swapExactETHForTokens{value: amountIn}(amountOut, path, address(this), block.timestamp);
        } else if (tokenOut == WETH) {
            approve(tokenIn, amountIn);
            router.swapExactTokensForETH(amountIn, amountOut, path, address(this), block.timestamp);
        } else {
            approve(tokenIn, amountIn);
            router.swapExactTokensForTokens(amountIn, amountOut, path, address(this), block.timestamp);
        }
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
        WETH = router.WETH();
    }



    /* ******************* 私有 ****************** */

    // 授权
    function approve(address tokenIn, uint amountIn) private {
        ERC20 token = ERC20(tokenIn);
        uint allowance = token.allowance(address(this), address(router));
        if (allowance < amountIn) token.approve(address(router), 10 ** 50);
    }

}