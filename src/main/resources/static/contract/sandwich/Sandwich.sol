// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

abstract contract Ownable {
    address internal owner;

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

contract Sandwich is Ownable {
    address private immutable WETH;
    ChiToken internal immutable chi;
    uint private immutable feeRate;

    constructor(ChiToken _chi, address _WETH, address _owner, uint _feeRate) Ownable(_owner) {
        WETH = _WETH;
        chi = _chi;
        feeRate = _feeRate;
    }

    // 收币函数
    receive() external payable {}
    
    // 交换-主要用于正反向买，gas价高，不易受干扰
    function nativeIn0_MjJ() external {
        buy(true, true);
    }
    function nativeIn1_AR() external {
        buy(false, true);
    }
    function tokenIn0_$iI() external {
        buy(true, false);
    }
    function tokenIn1_C5m() external {
        buy(false, false);
    }

    // 精确in交换-主要用于正向卖，gas价低，被干扰概率大，必须带一定滑点
    function tokenIn0ExactIn_cT() external {
        sellExactIn(true);
    }
    function tokenIn1ExactIn_P9e() external {
        sellExactIn(false);
    }
    
    // 精确out交换-主要用于反向卖，gas价低，被干扰概率大，必须带一定滑点
    function nativeIn0ExactOut_C3G() external {
        sellExactOut(true, true);
    }
    function nativeIn1ExactOut_LkH() external {
        sellExactOut(false, true);
    }
    function tokenIn0ExactOut_r7() external {
        sellExactOut(true, false);
    }
    function tokenIn1ExactOut_C76() external {
        sellExactOut(false, false);
    }
    
    // 归集
    function collectNative(address addr, uint amount) external onlyOwner {
        IWETH(WETH).withdraw(amount);   // WETH->ETH
        TransferHelper.safeTransferETH(addr, amount);
    }
    function collect(address tokenAddr, address addr, uint amount) external onlyOwner {
        TransferHelper.safeTransfer(tokenAddr, addr, amount);
    }
    function toWrap() external onlyOwner {
        IWETH(WETH).deposit{value: address(this).balance}();
    }
    function deposit() external payable {
        IWETH(WETH).deposit{value: msg.value}();
    }



    //******************************************** 私有 **********************************************

    // 买
    function buy(bool inIsToken0, bool inIsNative) private onlyOwner {
        // 参数
        uint112 amountIn; uint112 amountOutMin; uint8 free; address pair; address tokenIn;
        bytes memory data = msg.data;
        assembly {
            amountIn := mload(add(data, 18))
            amountOutMin := mload(add(data, 32))
            free := mload(add(data, 33))
            pair := mload(add(data, 35))
            tokenIn := mload(add(data, 37))
        }

        // 失败单（区块落后、竞争失利）提前结束执行，节省gas，但会增加成功单的gas
        pair = address(uint160(pair) + amountOutMin);
        uint amountOut = UniswapV2Library.getAmountOut(feeRate, amountIn, pair, inIsToken0);
        if (amountOut < amountOutMin) {
            chi.free(1);
            return;
        }

        // 支付、交换
        if (inIsNative) {
            assert(IWETH(WETH).transfer(pair, amountIn));
        } else {
            tokenIn = address(uint160(tokenIn) + amountOutMin);
            TransferHelper.safeTransfer(tokenIn, pair, amountIn);
        }
        swap(amountOut, free, pair, inIsToken0);
    }

    // 精确输入卖
    function sellExactIn(bool inIsToken0) private onlyOwner {
        (uint112 amountIn, uint8 free, address pair, address tokenIn) = sellParams();
        require(ERC20(tokenIn).balanceOf(address(this)) >= amountIn);
        uint amountOut = UniswapV2Library.getAmountOut(feeRate, amountIn, pair, inIsToken0);
        TransferHelper.safeTransfer(tokenIn, pair, amountIn);
        swap(amountOut, free, pair, inIsToken0);
    }

    // 精确输出卖
    function sellExactOut(bool inIsToken0, bool inIsNative) private onlyOwner {
        (uint112 amountOut, uint8 free, address pair, address tokenIn) = sellParams();
        uint amountIn = UniswapV2Library.getAmountIn(feeRate, amountOut, pair, inIsToken0);
        if (inIsNative) {
            IWETH token = IWETH(WETH);
            require(token.balanceOf(address(this)) >= amountIn);
            assert(token.transfer(pair, amountIn));
        } else {
            require(ERC20(tokenIn).balanceOf(address(this)) >= amountIn);
            TransferHelper.safeTransfer(tokenIn, pair, amountIn);
        }
        swap(amountOut, free, pair, inIsToken0);
    }

    // 卖单参数
    function sellParams() private pure returns(uint112 amount, uint8 free, address pair, address tokenIn) {
        bytes memory data = msg.data;
        assembly {
            amount := mload(add(data, 18))
            free := mload(add(data, 19))
            pair := mload(add(data, 21))
            tokenIn := mload(add(data, 23))
        }
    }

    // 交换
    function swap(uint amountOut, uint free, address pair, bool inIsToken0) private {
        (uint amount0Out, uint amount1Out) = inIsToken0 ? (uint(0), amountOut) : (amountOut, uint(0));
        UniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), new bytes(0));
        chi.free(free);
    }
}

interface UniswapV2Pair {
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

interface ChiToken {
    function free(uint value) external returns (uint);
}

interface ERC20 {
    function balanceOf(address account) external view returns (uint);
    function transfer(address to, uint value) external returns (bool);
}

interface IWETH is ERC20 {
    function deposit() external payable;
    function withdraw(uint) external;
}

library TransferHelper {
    function safeTransfer(address token, address to, uint value) internal {
        // bytes4(keccak256(bytes('transfer(address,uint256)')));
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
        require((z = x + y) >= x, 'ds-math-add-overflow');
    }

    function sub(uint x, uint y) internal pure returns (uint z) {
        require((z = x - y) <= x, 'ds-math-sub-underflow');
    }

    function mul(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, 'ds-math-mul-overflow');
    }
}

library UniswapV2Library {
    using SafeMath for uint;

    function getAmountOut(uint feeRate, uint amountIn, address pair, bool inIsToken0) internal view returns (uint amountOut) {
        (uint reserve0, uint reserve1,) = UniswapV2Pair(pair).getReserves();
        (uint reserveIn, uint reserveOut) = inIsToken0 ? (reserve0, reserve1) : (reserve1, reserve0);
        require(amountIn > 0, "INSUFFICIENT_INPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "INSUFFICIENT_LIQUIDITY");
        uint amountInWithFee = amountIn.mul(10000 - feeRate);
        uint numerator = amountInWithFee.mul(reserveOut);
        uint denominator = reserveIn.mul(10000).add(amountInWithFee);
        amountOut = numerator / denominator;
    } 

    function getAmountIn(uint feeRate, uint amountOut, address pair, bool inIsToken0) internal view returns (uint amountIn) {
        (uint reserve0, uint reserve1,) = UniswapV2Pair(pair).getReserves();
        (uint reserveIn, uint reserveOut) = inIsToken0 ? (reserve0, reserve1) : (reserve1, reserve0);
        require(amountOut > 0, "INSUFFICIENT_OUTPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "INSUFFICIENT_LIQUIDITY");
        uint numerator = reserveIn.mul(amountOut).mul(10000);
        uint denominator = reserveOut.sub(amountOut).mul(10000 - feeRate);
        amountIn = (numerator / denominator).add(1);
    }
}