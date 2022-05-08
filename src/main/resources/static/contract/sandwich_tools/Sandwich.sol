// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./UniswapV2Router.sol";

contract Sandwich {

    /* ******************* 写死 ****************** */
    
    address public immutable WETH;
    address public immutable owner;
    ChiToken public immutable chi;
    UniswapV2Router public immutable router;



    /* ******************* 构造收币函数 ****************** */
    
    // 构造函数
    constructor(address _chi, UniswapV2Router _router, address _owner) {
        owner = _owner;
        chi = ChiToken(_chi);
        router = _router;
        WETH = router.WETH();
    }

    // 收币函数
    receive() external payable {}



    /* ******************* 写函数-owner ****************** */
    
    // 买单：精确from换币
    function buyExactETHForTokens(uint amountIn, uint amountOutMin, address tokenOut) external onlyOwner gasDiscount {
        router.swapExactETHForTokens{value: amountIn}(amountOutMin, toPath(WETH, tokenOut), address(this), block.timestamp);
    }
    function buyExactTokensForETH(uint amountIn, uint amountOutMin, address tokenIn) external onlyOwner gasDiscount {
        approve(tokenIn, amountIn);
        router.swapExactTokensForETH(amountIn, amountOutMin, toPath(tokenIn, WETH), address(this), block.timestamp);
    }
    function buyExactTokensForTokens(uint amountIn, uint amountOutMin, address tokenIn, address tokenOut) external onlyOwner gasDiscount {
        approve(tokenIn, amountIn);
        router.swapExactTokensForTokens(amountIn, amountOutMin, toPath(tokenIn, tokenOut), address(this), block.timestamp);
    }
    
    // 买单：精确to换币
    function buyETHForExactTokens(uint amountInMax, uint amountOut, address tokenOut) external onlyOwner gasDiscount {
        router.swapETHForExactTokens{value: amountInMax}(amountOut, toPath(WETH, tokenOut), address(this), block.timestamp);
    }
    function buyTokensForExactETH(uint amountInMax, uint amountOut, address tokenIn) external onlyOwner gasDiscount {
        approve(tokenIn, amountInMax);
        router.swapTokensForExactETH(amountOut, amountInMax, toPath(tokenIn, WETH), address(this), block.timestamp);
    }
    function buyTokensForExactTokens(uint amountInMax, uint amountOut, address tokenIn, address tokenOut) external onlyOwner gasDiscount {
        approve(tokenIn, amountInMax);
        router.swapTokensForExactTokens(amountOut, amountInMax, toPath(tokenIn, tokenOut), address(this), block.timestamp);
    }

    // 卖单：精确from换币
    function sellExactETHForTokens(uint amountIn, address tokenOut) external onlyOwner {
        address[] memory path = toPath(WETH, tokenOut);
        uint amountOutMin = router.getAmountsOut(amountIn, path)[1];
        router.swapExactETHForTokens{value: amountIn}(amountOutMin, path, address(this), block.timestamp);
    }
    function sellExactTokensForETH(uint amountIn, address tokenIn) external onlyOwner {
        approve(tokenIn, amountIn);
        address[] memory path = toPath(tokenIn, WETH);
        uint amountOutMin = router.getAmountsOut(amountIn, path)[1];
        router.swapExactTokensForETH(amountIn, amountOutMin, path, address(this), block.timestamp);
    }
    function sellExactTokensForTokens(uint amountIn, address tokenIn, address tokenOut) external onlyOwner {
        approve(tokenIn, amountIn);
        address[] memory path = toPath(tokenIn, tokenOut);
        uint amountOutMin = router.getAmountsOut(amountIn, path)[1];
        router.swapExactTokensForTokens(amountIn, amountOutMin, path, address(this), block.timestamp);
    }

    // 卖单：精确to换币
    function sellETHForExactTokens(uint amountOut, address tokenOut) external onlyOwner {
        address[] memory path = toPath(WETH, tokenOut);
        uint amountInMax = router.getAmountsIn(amountOut, path)[1];
        router.swapETHForExactTokens{value: amountInMax}(amountOut, path, address(this), block.timestamp);
    }
    function sellTokensForExactETH(uint amountOut, address tokenIn) external onlyOwner {
        address[] memory path = toPath(tokenIn, WETH);
        uint amountInMax = router.getAmountsIn(amountOut, path)[1];
        approve(tokenIn, amountInMax);
        router.swapTokensForExactETH(amountOut, amountInMax, path, address(this), block.timestamp);
    }
    function sellTokensForExactTokens(uint amountOut, address tokenIn, address tokenOut) external onlyOwner {
        address[] memory path = toPath(tokenIn, tokenOut);
        uint amountInMax = router.getAmountsIn(amountOut, path)[1];
        approve(tokenIn, amountInMax);
        router.swapTokensForExactTokens(amountOut, amountInMax, path, address(this), block.timestamp);
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



    /* ************************************** 修饰符 ************************************* */

    modifier gasDiscount {
        uint256 gasStart = gasleft();
        _;
        uint256 gasSpent = 21000 + gasStart - gasleft() + 16 * msg.data.length;
        chi.freeFromUpTo(msg.sender, (gasSpent + 14154) / 41947);
    }
    modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }
}

pragma solidity ^0.8.13;
interface ChiToken {
    function freeFromUpTo(address from, uint256 value) external;
}

pragma solidity ^0.8.13;
interface ERC20 {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}