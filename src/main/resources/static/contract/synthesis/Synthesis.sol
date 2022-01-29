// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./Ownable.sol";
import "./ReentrancyGuard.sol";
import "./ERC20.sol";
import "./SafeERC20.sol";
import "./SafeMath.sol";

contract Synthesis is Ownable, ReentrancyGuard {
    using SafeERC20 for ERC20;
    using SafeERC20 for ERC20;

    struct Parts {
        ERC20 token;
        uint num;
    }

    // 部件配置
    mapping(ERC20 => Parts[]) public equipmentParts;
    // 部件index
    mapping(address => uint) public indexs;
    // 成品地址
    address[] public equipments;

    
    
    /* ******************* 写函数 ****************** */

    // 合成
    function synthesis(ERC20 token) external nonReentrant {
        Parts[] storage parts = equipmentParts[token];
        for (uint i; i < parts.length; i++) {
            parts[i].token.safeTransferFrom(msg.sender, address(this), parts[i].num);
        }
        token.transfer(msg.sender, 1);
    }



    /* ******************* 读函数 ****************** */

    // 查询部件
    function queryEquipmentParts(ERC20 token) external view returns (Parts[] memory)  {
        return equipmentParts[token];
    }

    // 查询配置数
    function queryEquipmentSize() external view returns (uint) {
        return equipments.length;
    }



    /* ******************* 写函数-owner ****************** */

    // 添加1个部件
    function addParts(ERC20 token, ERC20 part, uint num) public onlyOwner {
        equipmentParts[token].push(Parts(part, num));
        if (equipmentParts[token].length == 1) {
            indexs[address(token)] = equipments.length;
            equipments.push(address(token));
        }
    }

    // 添加2个部件
    function addParts(ERC20 token, ERC20 partA, uint aNum, ERC20 partB, uint bNum) external onlyOwner {
        addParts(token, partA, aNum);
        addParts(token, partB, bNum);
    }

    // 添加3个部件
    function addParts(ERC20 token, ERC20 partA, uint aNum, ERC20 partB, uint bNum, ERC20 partC, uint cNum) external onlyOwner {
        addParts(token, partA, aNum);
        addParts(token, partB, bNum);
        addParts(token, partC, cNum);
    }

    // 删除配置
    function delEquipment(ERC20 token) external onlyOwner {
        delete equipmentParts[token];
        uint lastIndex = equipments.length - 1;
        uint currIndex = indexs[address(token)];
        address lastAddr = equipments[lastIndex];
        equipments[currIndex] = lastAddr;
        indexs[lastAddr] = currIndex;
        delete indexs[address(token)];
        equipments.pop();
    }

    // 归集
    function collect(ERC20 token) external onlyOwner {
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

}