// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./Ownable.sol";

abstract contract Admin {
    mapping(address => bool) private admins;
    
    constructor() {
        admins[msg.sender] = true;
    }

    function setAdmin(address addr, bool isAdmin) external onlyAdmin {
        require(addr != address(0));
        admins[addr] = isAdmin;
    }

    modifier onlyAdmin() {
        _;
        require(admins[msg.sender], "Ownable: caller is not the admin");
    }
}

// 无逻辑，只交易
contract Sandwich00 is Ownable, Admin {
    address internal immutable weth;

    constructor (address _weth) {
        weth = _weth;
    }

    // 收币函数
    receive() external payable {}

    // 交换
    function swap(address tokenIn, address pair, uint amountIn, uint amount0Out, uint amount1Out) external onlyAdmin { 
        TransferHelper.safeTransfer(tokenIn, pair, amountIn);
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
}

interface UniswapV2Pair {
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
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