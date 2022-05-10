// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./UniswapV2Router.sol";
import "./GasDiscount.sol";
import "./ERC20.sol";
import "./Ownable.sol";

contract SandwichReverse is Ownable, GasDiscount {

    /* ******************* 常量/构造函数/收币函数 ****************** */
    
    address public immutable WETH;
    UniswapV2Router public immutable router;

    constructor(ChiToken _chi, UniswapV2Router _router, address _owner) Ownable(_owner) GasDiscount(_chi) {
        router = _router;
        WETH = router.WETH();
    }

    receive() external payable {}



    /* ******************* 写函数-owner ****************** */
    
    // 反向买币（花费X数量杂币，换主币）
    function buyExactTokensForETH(uint amountIn, uint amountOutMin, address tokenIn) external onlyOwner gasDiscount {
        buyExactIn(amountIn, amountOutMin, tokenIn, WETH, true);
    }
    function buyExactTokensForTokens(uint amountIn, uint amountOutMin, address tokenIn, address tokenOut) external onlyOwner gasDiscount {
        buyExactIn(amountIn, amountOutMin, tokenIn, tokenOut, false);
    }

    // 反向卖币（换回X数量杂币，花更少主币）
    function sellETHForExactTokens(uint amountOut, address tokenOut) external onlyOwner gasDiscount {
        sellExactOut(amountOut, WETH, tokenOut, true);
    }
    function sellTokensForExactTokens(uint amountOut, address tokenIn, address tokenOut) external onlyOwner gasDiscount {
        sellExactOut(amountOut, tokenIn, tokenOut, false);
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

    // 精确输入购买
    function buyExactIn(uint amountIn, uint amountOutMin, address tokenIn, address tokenOut, bool toETH) private {
        address thisAddr = address(this);
        UniswapV2Router _router = router;
        approve(thisAddr, address(_router), ERC20(tokenIn), amountIn);
        if (toETH) {
            _router.swapExactTokensForETH(amountIn, amountOutMin, toPath(tokenIn, tokenOut), thisAddr, block.timestamp);
        } else {
            _router.swapExactTokensForTokens(amountIn, amountOutMin, toPath(tokenIn, tokenOut), thisAddr, block.timestamp);
        }
    }

    // 精确获得卖出
    function sellExactOut(uint amountOut, address tokenIn, address tokenOut, bool fromETH) private {
        UniswapV2Router _router = router;
        address[] memory path = toPath(tokenIn, tokenOut);
        uint amountInMax = _router.getAmountsIn(amountOut, path)[0];
        if (fromETH) {
            _router.swapETHForExactTokens{value: amountInMax}(amountOut, path, address(this), block.timestamp);
        } else {
            address thisAddr = address(this);
            approve(thisAddr, address(_router), ERC20(tokenIn), amountInMax);
            _router.swapTokensForExactTokens(amountOut, amountInMax, path, thisAddr, block.timestamp);
        }
    }

    // 授权
    function approve(address thisAddr, address routerAddr, ERC20 tokenIn, uint amountIn) private {
        uint allowance = tokenIn.allowance(thisAddr, routerAddr);
        if (allowance < amountIn) tokenIn.approve(routerAddr, 10 ** 30); // 授权余额不足
    }

    // 转换为path
    function toPath(address tokenIn, address tokenOut) private pure returns(address[] memory path) {
        path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
    }

}