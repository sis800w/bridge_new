// SPDX-License-Identifier: GPLv3

pragma solidity ^0.8.0;

import "./Ownable.sol";

contract Ref is Ownable {
    // 激活用户总数
    uint public totalUsers;
    
    // 项目
    struct Project {
        bool activated;                     // 激活
        uint totalUsers;                    // 项目用户总数
    }
    mapping(address => Project) public projects;
    
    // 用户
    struct User {
        bool activated;                     // 激活
        address ref;                        // 推荐用户
        mapping(address => bool) activateds;// 项目-激活
    }
    mapping(address => User) public users;
    
    
    
    /* ******************* 特殊函数 ****************** */
    
    // 构造函数
    constructor() {
        totalUsers = 1;
        users[msg.sender].activated = true;
    }
    
    
    
    /* ******************* 写函数 ****************** */
    
    // 设置项目
    function setProject(address projectAddr_, bool activated_) external onlyOwner {
        projects[projectAddr_].activated = activated_;
    }
    
    // 激活
    function activate(address userAddr_, address ref_) external {
        require(userAddr_ != address(0), "'userAddr_' is zero address");
        address projectAddr = _msgSender();
        require(projects[projectAddr].activated, "Caller is not activated");
        User storage user = users[userAddr_];
        require(user.activated || users[ref_].activated, "Referrer is not activated");
        if (! user.activated) {
            user.activated = true;
            user.ref = ref_;
            totalUsers = totalUsers + 1;
        }
        if (! user.activateds[projectAddr]) {
            user.activateds[projectAddr] = true;
            Project storage project = projects[projectAddr];
            project.totalUsers = project.totalUsers + 1;
        }
    }
    
    
    
    /* ******************* 读函数 ****************** */

    // 查询
    function queryAll(address userAddr_, address projectAddr_) external view returns(bool, address, bool, bool, uint, uint) {
        User storage user = users[userAddr_];
        Project storage project = projects[projectAddr_];
        return (user.activated,
                user.ref,
                user.activateds[projectAddr_],
                project.activated,
                project.totalUsers,
                totalUsers);
    }
    
}