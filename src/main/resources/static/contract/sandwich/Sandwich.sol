// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

abstract contract Ownable {
    address private owner;

    constructor(address _owner) {
        owner = _owner;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        owner = newOwner;
    }
}

contract GasDiscount {
    ChiToken private immutable chi;

    constructor(ChiToken _chi) {
        chi = _chi;
    }

    modifier gasDiscount {
        uint256 gasStart = gasleft();
        _;
        uint256 gasSpent = 21000 + gasStart - gasleft() + 16 * msg.data.length;
        chi.freeUpTo((gasSpent + 14154) / 41947);
    }
}

contract Sandwich is Ownable, GasDiscount {
    using SafeMath for uint;

    address private immutable WETH;
    uint private immutable feeRate;

    constructor(ChiToken _chi, address _WETH, address _owner, uint _feeRate) Ownable(_owner) GasDiscount(_chi) {
        WETH = _WETH;
        feeRate = _feeRate;
    }

    // 收币函数
    receive() external payable {}
    
    // 交换-主要用于正反向买，gas价高，不易受干扰
    function buyETHForTokensIn0(uint amountIn, uint amountOut, address pair) external onlyOwner gasDiscount {
        assert(IWETH(WETH).transfer(pair, amountIn));
        swap(amountOut, pair, true);
    }
    function buyETHForTokensIn1(uint amountIn, uint amountOut, address pair) external onlyOwner gasDiscount {
        assert(IWETH(WETH).transfer(pair, amountIn));
        swap(amountOut, pair, false);
    }
    function buyTokensForTokensIn0(uint amountIn, uint amountOut, address pair, address tokenIn) external onlyOwner gasDiscount {
        safeTransfer(tokenIn, pair, amountIn);
        swap(amountOut, pair, true);
    }
    function buyTokensForTokensIn1(uint amountIn, uint amountOut, address pair, address tokenIn) external onlyOwner gasDiscount {
        safeTransfer(tokenIn, pair, amountIn);
        swap(amountOut, pair, false);
    }
    

    // 精确in交换-主要用于正向卖，gas价低，被干扰概率大，必须带一定滑点
    function sellExactTokensForTokensIn0(uint amountIn, address pair, address tokenIn) external onlyOwner gasDiscount {
        uint amountOut = getAmountOut(amountIn, pair, true);
        safeTransfer(tokenIn, pair, amountIn);
        swap(amountOut, pair, true);
    }
    function sellExactTokensForTokensIn1(uint amountIn, address pair, address tokenIn) external onlyOwner gasDiscount {
        uint amountOut = getAmountOut(amountIn, pair, false);
        safeTransfer(tokenIn, pair, amountIn);
        swap(amountOut, pair, false);
    }

    // 精确out交换-主要用于反向卖，gas价低，被干扰概率大，必须带一定滑点
    function sellETHForExactTokensIn0(uint amountOut, address pair) external onlyOwner gasDiscount {
        uint amountIn = getAmountIn(amountOut, pair, true);
        assert(IWETH(WETH).transfer(pair, amountIn));
        swap(amountOut, pair, true);
    }
    function sellETHForExactTokensIn1(uint amountOut, address pair) external onlyOwner gasDiscount {
        uint amountIn = getAmountIn(amountOut, pair, false);
        assert(IWETH(WETH).transfer(pair, amountIn));
        swap(amountOut, pair, false);
    }
    function sellTokensForExactTokensIn0(uint amountOut, address pair, address tokenIn) external onlyOwner gasDiscount {
        uint amountIn = getAmountIn(amountOut, pair, true);
        safeTransfer(tokenIn, pair, amountIn);
        swap(amountOut, pair, true);
    }
    function sellTokensForExactTokensIn1(uint amountOut, address pair, address tokenIn) external onlyOwner gasDiscount {
        uint amountIn = getAmountIn(amountOut, pair, false);
        safeTransfer(tokenIn, pair, amountIn);
        swap(amountOut, pair, false);
    }
    
    // 归集
    function collectNative(address addr, uint amount) external onlyOwner {
        IWETH(WETH).withdraw(amount);   // WETH->ETH
        safeTransferETH(addr, amount);
    }
    function collect(address tokenAddr, address addr, uint amount) external onlyOwner {
        safeTransfer(tokenAddr, addr, amount);
    }
    function toWrap() external onlyOwner {
        IWETH(WETH).deposit{value: address(this).balance}();
    }
    function deposit() external payable {
        IWETH(WETH).deposit{value: msg.value}();
    }

    // 交换
    function swap(uint amountOut, address pair, bool inIsToken0) private {
        (uint amount0Out, uint amount1Out) = inIsToken0 ? (uint(0), amountOut) : (amountOut, uint(0));
        UniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), new bytes(0));
    }

    // 安全转账
    function safeTransfer(address token, address to, uint value) private {
        // bytes4(keccak256(bytes('transfer(address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xa9059cbb, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "TRANSFER_FAILED");
    }
    function safeTransferETH(address to, uint value) private {
        (bool success,) = to.call{value:value}(new bytes(0));
        require(success, "ETH_TRANSFER_FAILED");
    }

    // 计算
    function getAmountOut(uint amountIn, address pair, bool inIsToken0) private view returns (uint amountOut) {
        (uint reserve0, uint reserve1,) = UniswapV2Pair(pair).getReserves();
        (uint reserveIn, uint reserveOut) = inIsToken0 ? (reserve0, reserve1) : (reserve1, reserve0);
        require(amountIn > 0, "INSUFFICIENT_INPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "INSUFFICIENT_LIQUIDITY");
        uint amountInWithFee = amountIn.mul(10000 - feeRate);
        uint numerator = amountInWithFee.mul(reserveOut);
        uint denominator = reserveIn.mul(10000).add(amountInWithFee);
        amountOut = numerator / denominator;
    }
    function getAmountIn(uint amountOut, address pair, bool inIsToken0) private view returns (uint amountIn) {
        (uint reserve0, uint reserve1,) = UniswapV2Pair(pair).getReserves();
        (uint reserveIn, uint reserveOut) = inIsToken0 ? (reserve0, reserve1) : (reserve1, reserve0);
        require(amountOut > 0, "INSUFFICIENT_OUTPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "INSUFFICIENT_LIQUIDITY");
        uint numerator = reserveIn.mul(amountOut).mul(10000);
        uint denominator = reserveOut.sub(amountOut).mul(10000 - feeRate);
        amountIn = (numerator / denominator).add(1);
    }
}

interface IWETH {
    function deposit() external payable;
    function transfer(address to, uint value) external returns (bool);
    function withdraw(uint) external;
}

interface ChiToken {
    function freeUpTo(uint256 value) external returns (uint256);
}

interface UniswapV2Pair {
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

library SafeMath {
    function add(uint x, uint y) internal pure returns (uint z) {
        require((z = x + y) >= x, 'ds-math-add-overflow');
    }

    function sub(uint x, uint y) internal pure returns (uint z) {
        require((z = x - y) <= x, 'ds-math-sub-underflow');
    }

    function mul(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, 'ds-math-mul-overflow');
    }
}