// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./UniswapV2Router.sol";
import "./GasDiscount.sol";
import "./ERC20.sol";
import "./Ownable.sol";

contract SandwichForward is Ownable, GasDiscount {

    /* ******************* 常量/构造函数/收币函数 ****************** */
    
    address public immutable WETH;
    UniswapV2Router public immutable router;

    constructor(ChiToken _chi, UniswapV2Router _router, address _owner) Ownable(_owner) GasDiscount(_chi) {
        router = _router;
        WETH = router.WETH();
    }

    receive() external payable {}



    /* ******************* 写函数-owner ****************** */
    
    // 正向买币（买入X数量杂币，花费主币）
    function buyExactETHForTokens(uint amountIn, uint amountOutMin, address tokenOut) external onlyOwner gasDiscount {
        router.swapExactETHForTokens{value: amountIn}(amountOutMin, toPath(WETH, tokenOut), address(this), block.timestamp);
    }
    function buyExactTokensForTokens(uint amountIn, uint amountOutMin, address tokenIn, address tokenOut) external onlyOwner gasDiscount {
        address thisAddr = address(this);
        UniswapV2Router _router = router;
        approve(thisAddr, address(_router), ERC20(tokenIn), amountIn);
        _router.swapExactTokensForTokens(amountIn, amountOutMin, toPath(tokenIn, tokenOut), thisAddr, block.timestamp);
    }
    
    // 正向卖币（卖出X数量杂币，卖得更多主币）
    function sellExactTokensForETH(address tokenIn) external onlyOwner gasDiscount {
        sellExactIn(tokenIn, WETH, true);
    }
    function sellExactTokensForTokens(address tokenIn, address tokenOut) external onlyOwner gasDiscount {
        sellExactIn(tokenIn, tokenOut, false);
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

    // 精确输入卖出
    function sellExactIn(address tokenIn, address tokenOut, bool toETH) private {
        // 查询余额
        address thisAddr = address(this);
        ERC20 inToken = ERC20(tokenIn);
        uint amountIn = inToken.balanceOf(thisAddr);
        require (amountIn > 0);

        // 授权
        UniswapV2Router _router = router;
        approve(thisAddr, address(_router), inToken, amountIn);
        
        // 查询获得
        address[] memory path = toPath(tokenIn, tokenOut);
        uint amountOutMin = _router.getAmountsOut(amountIn, path)[1];
        
        // 交易
        if (toETH) {
            _router.swapExactTokensForETH(amountIn, amountOutMin, path, thisAddr, block.timestamp);
        } else {
            _router.swapExactTokensForTokens(amountIn, amountOutMin, path, thisAddr, block.timestamp);
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