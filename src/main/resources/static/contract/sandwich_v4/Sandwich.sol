// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

abstract contract Ownable {
    mapping(address => bool) internal owners;

    constructor() {
        owners[msg.sender] = true;
    }

    function setCaller(address addr, bool caller) external onlyOwner {
        require(addr != address(0));
        require(addr != msg.sender);
        owners[addr] = caller;
    }

    modifier onlyOwner() {
        _;
        require(owners[msg.sender], "Ownable: caller is not the owner");
    }
}

contract Sandwich is Ownable {
    using SafeMath for uint;

    ChiToken private immutable chi;
    address private immutable weth;
    uint private immutable feeRate;
    mapping(address => uint) private indexs;
    address[] private addrs;
    uint8 private random;

    constructor(ChiToken _chi, address _weth, uint _feeRate, uint8 _random) {
        chi = _chi;
        weth = _weth;
        feeRate = _feeRate;
        random = _random;
    }

    // 收币函数
    receive() external payable {}

    // 买（用slot）
    function buyWithSlot1(uint amountIn, uint amountOutMin, bool inIsToken0, uint pairIndex, address[] calldata slots) external {
        address pair = addrs[pairIndex];
        buyWithSlot(amountIn, amountOutMin, inIsToken0, pair, slots);
    }
    function buyWithSlot2(uint amountIn, uint amountOutMin, bool inIsToken0, address pair, uint8 pairR, address[] calldata slots) external {
        pair = address(uint160(pair) * random + pairR);
        buyWithSlot(amountIn, amountOutMin, inIsToken0, pair, slots);
    }
    function buyWithSlot3(uint amountIn, uint amountOutMin, bool inIsToken0, address pair, address[] calldata slots) external {
        buyWithSlot(amountIn, amountOutMin, inIsToken0, pair, slots);
    }
    function buyWithSlot(uint amountIn, uint amountOutMin, bool inIsToken0, address pair, address[] calldata slots) private onlyOwner {
        uint amountOut = getAmountOut(amountIn, pair, inIsToken0);
        if (amountOut < amountOutMin) { Destory(slots[0]).destory(); return; }
        assert(IWETH(weth).transfer(pair, amountIn));
        (uint amount0Out, uint amount1Out) = inIsToken0 ? (uint(0), amountOut) : (amountOut, uint(0));
        UniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), new bytes(0));
        for (uint i = 0; i < slots.length; i++) Destory(slots[i]).destory();
    }

    // 买（用chi）
    function buyWithChi1(uint amountIn, uint amountOutMin, bool inIsToken0, uint pairIndex, uint8 free) external {
        address pair = addrs[pairIndex];
        buyWithChi(amountIn, amountOutMin, inIsToken0, pair, free);
    }
    function buyWithChi2(uint amountIn, uint amountOutMin, bool inIsToken0, address pair, uint8 pairR, uint8 free) external {
        pair = address(uint160(pair) * random + pairR);
        buyWithChi(amountIn, amountOutMin, inIsToken0, pair, free);
    }
    function buyWithChi3(uint amountIn, uint amountOutMin, bool inIsToken0, address pair, uint8 free) external {
        buyWithChi(amountIn, amountOutMin, inIsToken0, pair, free);
    }
    function buyWithChi(uint amountIn, uint amountOutMin, bool inIsToken0, address pair, uint8 free) private onlyOwner {
        uint amountOut = getAmountOut(amountIn, pair, inIsToken0);
        require(amountOut >= amountOutMin);
        assert(IWETH(weth).transfer(pair, amountIn));
        (uint amount0Out, uint amount1Out) = inIsToken0 ? (uint(0), amountOut) : (amountOut, uint(0));
        UniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), new bytes(0));
        if (free > 0) chi.free(free);
    }

    // 卖
    function sell1(uint amountOutMin, bool inIsToken0, uint pairIndex, uint tokenInIndex) external {
        address pair = addrs[pairIndex];
        address tokenIn = addrs[tokenInIndex];
        sell(amountOutMin, inIsToken0, pair, tokenIn);
    }
    function sell2(uint amountOutMin, bool inIsToken0, address pair, uint8 pairR, address tokenIn, uint8 tokenInR) external {
        uint8 _random = random;
        pair = address(uint160(pair) * _random + pairR);
        tokenIn = address(uint160(tokenIn) * _random + tokenInR);
        sell(amountOutMin, inIsToken0, pair, tokenIn);
    }
    function sell3(uint amountOutMin, bool inIsToken0, address pair, address tokenIn) external {
        sell(amountOutMin, inIsToken0, pair, tokenIn);
    }
    function sell(uint amountOutMin, bool inIsToken0, address pair, address tokenIn) private onlyOwner {
        uint amountIn = ERC20(tokenIn).balanceOf(address(this));
        require(amountIn > 0);
        uint amountOut = getAmountOut(amountIn, pair, inIsToken0);
        require(amountOut >= amountOutMin);
        TransferHelper.safeTransfer(tokenIn, pair, amountIn);
        (uint amount0Out, uint amount1Out) = inIsToken0 ? (uint(0), amountOut) : (amountOut, uint(0));
        UniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), new bytes(0));
    }
    
    // 转入转出
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

    // 配置
    function setRandom(uint8 _random) external onlyOwner {
        random = _random;
    }
    function addAddr(address addr) external onlyOwner {
        if (addrs.length > 0) require(addrs[indexs[addr]] != addr);
        indexs[addr] = addrs.length;
        addrs.push(addr);
    }
    function removeAddr(address addr) external onlyOwner {
        uint addrIndexLast = addrs.length - 1;
        address addrLast = addrs[addrIndexLast];
        uint addrIndex = indexs[addr];
        addrs[addrIndex] = addrLast;
        indexs[addrLast] = addrIndex;
        delete indexs[addr];
        addrs.pop();
    }
    function getAddr(uint index) external onlyOwner view returns(address) {
        return addrs[index];
    }
    function getIndex(address addr) external onlyOwner view returns(uint) {
        return indexs[addr];
    }
    function getRandom() external onlyOwner view returns(uint) {
        return random;
    }
    function getConfig(address addr1, address addr2) external onlyOwner view returns(uint, uint, uint) {
        return (indexs[addr1], indexs[addr2], random);
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

interface Destory {    
    function destory() external;
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