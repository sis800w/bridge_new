// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

abstract contract Ownable {
    address internal immutable owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }
}

contract Swap is Ownable {
    using SafeMath for uint;

    address internal immutable weth;
    uint private immutable feeRate;

    constructor(address _weth, uint _feeRate) {
        weth = _weth;
        feeRate = _feeRate;
    }

    // 收币函数
    receive() external payable {}

    // 买
    function buy_p5Y(uint amountIn, bool inIsToken0, address pair) external onlyOwner {
        uint amountOut = getAmountOut(amountIn, pair, inIsToken0);
        TransferHelper.safeTransfer(weth, pair, amountIn);
        (uint amount0Out, uint amount1Out) = inIsToken0 ? (uint(0), amountOut) : (amountOut, uint(0));
        UniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), new bytes(0));
    }

    // 卖
    function sell(uint amountIn, bool inIsToken0, address pair, address tokenIn) external onlyOwner {
        uint amountOut = getAmountOut(amountIn, pair, inIsToken0);
        TransferHelper.safeTransfer(tokenIn, pair, amountIn);
        (uint amount0Out, uint amount1Out) = inIsToken0 ? (uint(0), amountOut) : (amountOut, uint(0));
        UniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), new bytes(0));
    }
    
    
    // 归集
    function collectNative() external onlyOwner {
        uint amount = ERC20(weth).balanceOf(address(this));
        IWETH(weth).withdraw(amount);       // WETH->ETH
        TransferHelper.safeTransferETH(msg.sender, amount);
    }
    function collect(address tokenAddr) external onlyOwner {
        uint amount = ERC20(tokenAddr).balanceOf(address(this));
        TransferHelper.safeTransfer(tokenAddr, msg.sender, amount);
    }
    function toWrap() external onlyOwner {  // ETH->WETH
        IWETH(weth).deposit{value: address(this).balance}();
    }



    //******************************************** 私有 **********************************************

    // 计算获得量
    function getAmountOut(uint amountIn, address pair, bool inIsToken0) internal view returns (uint amountOut) {
        (uint reserve0, uint reserve1,) = UniswapV2Pair(pair).getReserves();
        (uint reserveIn, uint reserveOut) = inIsToken0 ? (reserve0, reserve1) : (reserve1, reserve0);
        require(amountIn > 0, "INSUFFICIENT_INPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "INSUFFICIENT_LIQUIDITY");
        uint amountInWithFee = amountIn.mul(10000 - feeRate);
        uint numerator = amountInWithFee.mul(reserveOut);
        uint denominator = reserveIn.mul(10000).add(amountInWithFee);
        amountOut = numerator / denominator;
    }
}

interface UniswapV2Pair {
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

interface ERC20 {
    function balanceOf(address account) external view returns (uint);
}

interface IWETH {
    function deposit() external payable;
    function withdraw(uint) external;
}

library TransferHelper {
    function safeTransfer(address token, address to, uint value) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xa9059cbb, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "TRANSFER_FAILED");
    }
    function safeTransferETH(address to, uint value) internal {
        (bool success,) = to.call{value:value}(new bytes(0));
        require(success, "ETH_TRANSFER_FAILED");
    }
}

library SafeMath {
    function add(uint x, uint y) internal pure returns (uint z) {
        require((z = x + y) >= x, "ds-math-add-overflow");
    }
    function mul(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, "ds-math-mul-overflow");
    }
}