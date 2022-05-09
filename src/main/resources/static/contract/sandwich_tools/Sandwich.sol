// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./UniswapV2Router.sol";
import "./GasDiscount.sol";
import "./ERC20.sol";
import "./Ownable.sol";

contract Sandwich is Ownable, GasDiscount {

    /* ******************* 常量/构造函数/收币函数 ****************** */
    
    address public immutable WETH;
    UniswapV2Router public immutable router;

    constructor(ChiToken _chi, UniswapV2Router _router, address _owner) Ownable(_owner) GasDiscount(_chi) {
        router = _router;
        WETH = router.WETH();
    }

    receive() external payable {}



    /* ******************* 写函数-owner ****************** */
    
    // 买单：精确from换币
    function swapExactETHForTokens(uint amountIn, uint amountOutMin, address tokenOut) external onlyOwner gasDiscount {
        router.swapExactETHForTokens{value: amountIn}(amountOutMin, toPath(WETH, tokenOut), address(this), block.timestamp);
    }
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address tokenIn) external onlyOwner gasDiscount {
        approve(tokenIn, amountIn);
        router.swapExactTokensForETH(amountIn, amountOutMin, toPath(tokenIn, WETH), address(this), block.timestamp);
    }
    function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address tokenIn, address tokenOut) external onlyOwner gasDiscount {
        approve(tokenIn, amountIn);
        router.swapExactTokensForTokens(amountIn, amountOutMin, toPath(tokenIn, tokenOut), address(this), block.timestamp);
    }
    
    // 买单：精确to换币
    function swapETHForExactTokens(uint amountInMax, uint amountOut, address tokenOut) external onlyOwner gasDiscount {
        router.swapETHForExactTokens{value: amountInMax}(amountOut, toPath(WETH, tokenOut), address(this), block.timestamp);
    }
    function swapTokensForExactETH(uint amountInMax, uint amountOut, address tokenIn) external onlyOwner gasDiscount {
        approve(tokenIn, amountInMax);
        router.swapTokensForExactETH(amountOut, amountInMax, toPath(tokenIn, WETH), address(this), block.timestamp);
    }
    function swapTokensForExactTokens(uint amountInMax, uint amountOut, address tokenIn, address tokenOut) external onlyOwner gasDiscount {
        approve(tokenIn, amountInMax);
        router.swapTokensForExactTokens(amountOut, amountInMax, toPath(tokenIn, tokenOut), address(this), block.timestamp);
    }

    // 归集
    function collectNative(address addr, uint amount) external onlyOwner {
        payable(addr).transfer(amount);
    }
    function collect(address addr, address tokenAddr) external onlyOwner {
        ERC20 token = ERC20(tokenAddr);
        token.transfer(addr, token.balanceOf(address(this)));
    }



    /* ************************************** 私有 ************************************* */

    // 授权
    function approve(address tokenIn, uint amountIn) private {
        ERC20 token = ERC20(tokenIn);
        uint allowance = token.allowance(address(this), address(router));
        if (allowance < amountIn) token.approve(address(router), 10 ** 30); // 授权余额不足
    }

    // 转换为path
    function toPath(address tokenIn, address tokenOut) private pure returns(address[] memory path) {
        path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
    }

}