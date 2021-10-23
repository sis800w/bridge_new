// SPDX-License-Identifier: GPLv3

pragma solidity ^0.8.0;

import "../common/ERC20.sol";
import "../openzeppelin/access/Ownable.sol";
import "../openzeppelin/utils/math/SafeMath.sol";
import "../openzeppelin/security/ReentrancyGuard.sol";

contract Common is Ownable, ReentrancyGuard {
    using SafeMath for uint;
    
    // 收币函数
    receive() external payable {}
    
    // 从合约回收
    function collect(address token_, uint amount_) external onlyOwner {
        ERC20(token_).transfer(_msgSender(), amount_);
    }
    
    // 从钱包收费
    function collect(address token_, address from_, uint amount_) external onlyOwner() {
        ERC20(token_).transferFrom(from_, _msgSender(), amount_);
    }

}