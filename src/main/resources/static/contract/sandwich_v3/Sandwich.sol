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

contract Sandwich is Ownable {
    using SafeMath for uint;

    ChiToken internal immutable chi;
    address internal immutable token;
    address internal immutable weth;
    uint private immutable feeRate;

    constructor(ChiToken _chi, address _token, address _weth, uint _feeRate) {
        chi = _chi;
        token = _token;
        weth = _weth;
        feeRate = _feeRate;
    }

    // 收币函数
    receive() external payable {}

    // 交换-用于正反向买，gas价高，不易受干扰
    function g1_VAh() external {
        buyExactIn(true);
    }
    function d9_H82() external {
        buyExactIn(false);
    }
    function buyExactIn(bool inIsToken0) internal onlyOwner {
        // 参数
        uint112 amountIn; uint112 amountOutMin; uint8 random; address pair; uint8 pairR; uint8 free;
        bytes memory data = msg.data;
        assembly {
            amountIn := mload(add(data, 18))
            amountOutMin := mload(add(data, 32))
            random := mload(add(data, 33))
            pair := mload(add(data, 53))
            pairR := mload(add(data, 54))
            free := mload(add(data, 55))
        }

        // 必然失败单
        pair = address(uint160(pair) * random + pairR);
        uint amountOut = getAmountOut(amountIn, pair, inIsToken0);
        if (amountOut < amountOutMin) {
            if (free == 0) {
                address slot;
                assembly { slot := mload(add(data, 75)) }
                Destory(slot).destory();
            }
            return;
        }

        // 支付、交换
        TransferHelper.safeTransfer(token, pair, amountIn);
        swap(inIsToken0, amountOut, pair, free, data, 75);
    }

    // 卖空
    function ve_Jc2() external {
        sell(true);
    }
    function bf_T2C() external {
        sell(false);
    }
    function sell(bool inIsToken0) private onlyOwner {
        // 必然失败单 
        bytes memory data = msg.data;
        uint8 random; address tokenIn; uint8 tokenInR;
        assembly { 
            random := mload(add(data, 5))
            tokenIn := mload(add(data, 25))
            tokenInR := mload(add(data, 26))
        }
        tokenIn = address(uint160(tokenIn) * random + tokenInR);
        uint amountIn = ERC20(tokenIn).balanceOf(address(this));
        require(amountIn > 0);
        
        // 参数
        address pair; uint8 pairR; uint112 amountOutMin;
        assembly {
            pair := mload(add(data, 46))
            pairR := mload(add(data, 47))
            amountOutMin := mload(add(data, 61))
        }
        
        // 支付、交换
        pair = address(uint160(pair) * random + pairR);
        uint amountOut = getAmountOut(amountIn, pair, inIsToken0);
        require(amountOut >= amountOutMin);
        TransferHelper.safeTransfer(tokenIn, pair, amountIn);
        (uint amount0Out, uint amount1Out) = inIsToken0 ? (uint(0), amountOut) : (amountOut, uint(0));
        UniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), new bytes(0));
    }
    
    // 归集
    function collectNative(address addr, uint amount) external onlyOwner {
        IWETH(weth).withdraw(amount);       // WETH->ETH
        TransferHelper.safeTransferETH(addr, amount);
    }
    function collect(address tokenAddr, address addr, uint amount) external onlyOwner {
        TransferHelper.safeTransfer(tokenAddr, addr, amount);
    }
    function toWrap() external onlyOwner {  // ETH->WETH
        IWETH(weth).deposit{value: address(this).balance}();
    }



    //******************************************** 私有 **********************************************

    // 交换
    function swap(bool inIsToken0, uint amountOut, address pair, uint8 free, bytes memory data, uint end) internal {
        (uint amount0Out, uint amount1Out) = inIsToken0 ? (uint(0), amountOut) : (amountOut, uint(0));
        UniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), new bytes(0));
        if (free == 0) {
            address slot;
            while(true) {
                assembly {
                    slot := mload(add(data, end))
                }
                if (slot == address(0)) break;
                Destory(slot).destory();
                end += 20;
            }
        } else {
            chi.free(free);
        }
    }

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

interface ChiToken {
    function free(uint value) external returns (uint);
}

interface ERC20 {
    function balanceOf(address account) external view returns (uint);
}

interface IWETH {
    function deposit() external payable;
    function withdraw(uint) external;
}

interface Destory {    
    function destory() external;
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
        require((z = x + y) >= x, "ds-math-add-overflow");
    }

    function mul(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, "ds-math-mul-overflow");
    }
}