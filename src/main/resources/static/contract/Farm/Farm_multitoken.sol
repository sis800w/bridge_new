// SPDX-License-Identifier: GPLv3

pragma solidity ^0.8.0;

import "./Ownable.sol";
import "./ReentrancyGuard.sol";
import "./SafeMath.sol";
import "./SafeERC20.sol";
import "./ERC20.sol";

contract FarmMultiToken is Ownable, ReentrancyGuard {
    using SafeMath for uint;
    using SafeERC20 for ERC20;
    
    
    /* ******************* 写死 ****************** */
    
    // 精度因子
    uint PRECISION_FACTOR;
    // 推荐奖励率
    uint public refRewardRate;
    // 质押代币
    ERC20 public stakedToken;
    // 质押代币
    ERC20 public stakedToken2;
    // 奖励代币
    ERC20 public rewardToken;
    

    
    /* ******************* 可改配置 ****************** */
    
    // 每个区块开采奖励的币数.
    uint rewardPerBlock = 1 * (10 ** 18);
    
    
    
    /* ******************* 计算 ****************** */
    
    // 最后计入 accruedTokenPerShare 的块号
    uint lastRewardBlock;
    // 每份额应计奖励数
    uint accruedTokenPerShare;
    // 总份额
    uint totalShares;
    // 质押代币总数
    uint totalAmount;
    // 质押代币总数2
    uint totalAmount2;
    // 激活用户总数
    uint totalUsers;



    /* ******************* 用户 ****************** */
    
    struct User {
        bool activated;     // 激活
        address ref;        // 推荐用户
        uint amount;        // 质押总数
        uint amount2;       // 质押总数2
        uint shares;        // 份额总数
        uint shares2;       // 份额总数2
        uint rewardDebt;    // 奖励债务
        uint rewardDebt2;    // 奖励债务
    }
    mapping(address => User) public users;
    
    
    
    /* ******************* 事件 ****************** */
    
    event Deposit(address indexed user, uint amount);
    event Deposit2(address indexed user, uint amount);
    event Withdraw(address indexed user, uint amount);
    event Withdraw2(address indexed user, uint amount);
    event AdminTokenRecovery(address tokenRecovered, uint amount);
    event NewRewardPerBlock(uint rewardPerBlock);
    
    

    /* ******************* 构造函数 ****************** */
    
    constructor(ERC20 _stakedToken, ERC20 _stakedToken2, ERC20 _rewardToken, uint _refRewardRate) {
        require(address(_stakedToken) != address(_stakedToken2));
        stakedToken = _stakedToken;
        stakedToken2 = _stakedToken2;
        rewardToken = _rewardToken;
        refRewardRate = _refRewardRate;
        lastRewardBlock = block.number;
        users[msg.sender].activated = true;
        totalUsers = 1;
        uint256 decimalsRewardToken = uint(rewardToken.decimals());
        require(decimalsRewardToken < 30, "Must be inferior to 30");
        PRECISION_FACTOR = 10 ** (uint(30).sub(decimalsRewardToken));
    }
    
    
    
    /* ******************* 写函数 ****************** */
    
    // 收币函数
    receive() external payable { }

    // 质押
    function deposit(uint _amount, address _ref) external nonReentrant {
        deposit(false, _amount, _ref);
    }
    
    // 质押2
    function deposit2(uint _amount, address _ref) external nonReentrant {
        deposit(true, _amount, _ref);
    }
    
    // 提现
    function withdraw() external nonReentrant {
        withdraw(false);
    }
    
    // 提现2
    function withdraw2() external nonReentrant {
        withdraw(true);
    }
    
    
    
    /* ******************* 读函数 ****************** */

    // 查询账户
    function query_account(address _addr) external view returns(bool, address, uint, uint, uint, uint) {
        return query_account(false, _addr);
    }
    
    // 查询账户2
    function query_account2(address _addr) external view returns(bool, address, uint, uint, uint, uint) {
        return query_account(true, _addr);
    }

    // 查询质押
    function query_stake(address _addr) external view returns(uint, uint, uint, uint) {
        return query_stake(false, _addr);
    }
    
    // 查询质押2
    function query_stake2(address _addr) external view returns(uint, uint, uint, uint) {
        return query_stake(true, _addr);
    }

    // 统计与池信息、配置
    function query_summary() external view returns(uint, uint, uint, uint, uint, uint, uint, uint, uint) {
        return query_summary(false);
    }
    
    // 统计与池信息、配置
    function query_summary2() external view returns(uint, uint, uint, uint, uint, uint, uint, uint, uint) {
        return query_summary(true);
    }
    


    /* ******************* 写函数-owner ****************** */
    
    // 回收错误币
    function recoverWrongTokens(address _tokenAddress, uint _tokenAmount) external onlyOwner {
        require(_tokenAddress != address(stakedToken), "Cannot be staked token");
        require(_tokenAddress != address(stakedToken2), "Cannot be staked token 2");
        require(_tokenAddress != address(rewardToken), "Cannot be reward token");
        ERC20(_tokenAddress).transfer(msg.sender, _tokenAmount);
        emit AdminTokenRecovery(_tokenAddress, _tokenAmount);
    }
    
    // 更新每区块奖励数
    function updateRewardPerBlock(uint _rewardPerBlock) external onlyOwner {
        rewardPerBlock = _rewardPerBlock;
        emit NewRewardPerBlock(_rewardPerBlock);
    }
    
    
    
    /* ******************* 私有 ****************** */
    
    // 结算（返回结算数量）
    function settleReward(bool two, User storage user, address userAddr) private returns (uint, uint) {
        uint shares = two ? user.shares2 :user.shares;
        uint rewardDebt = two ? user.rewardDebt2 : user.rewardDebt;
        if (shares > 0) {
            uint pending = shares.mul(accruedTokenPerShare).div(PRECISION_FACTOR).sub(rewardDebt);  // 结算数量 = 净资产 = 资产 - 负债
            uint subPending;                                                                        // 少结算数量（因余额不足）
            if (pending > 0) {
                uint minable = query_minable();
                if (minable < pending) {
                    subPending = pending.sub(minable);
                    pending = minable;
                }
            }
            if (pending > 0) {
                rewardToken.transfer(userAddr, pending);
                return (pending, subPending);
            }
        }
        return (0, 0);
    }
    
    // 结算、更新用户份额与负债（返回份额变化量）
    function settleAndEvenReward(bool two, User storage user, address userAddr, uint changeAmount, uint changeSharesRate, bool isAdd) private returns (uint) {
        if (two) {
            return settleAndEvenReward2(user, userAddr, changeAmount, changeSharesRate, isAdd);
        } else {
            return settleAndEvenReward(user, userAddr, changeAmount, changeSharesRate, isAdd);
        }
    }
    function settleAndEvenReward(User storage user, address userAddr, uint changeAmount, uint changeSharesRate, bool isAdd) private returns (uint) {
        if (changeAmount > 0) {
            (, uint subPending) = settleReward(false, user, userAddr);
            uint changeShares = changeAmount.mul(changeSharesRate).div(1000);
            if (isAdd) {
                user.shares = user.shares.add(changeShares);
            } else {
                if (user.shares < changeShares) changeShares = user.shares; // 处理多次质押一次提现产生的精度误差
                user.shares = user.shares.sub(changeShares);
            }
            uint rewardDebt = user.shares.mul(accruedTokenPerShare).div(PRECISION_FACTOR);
            if (rewardDebt >= subPending) {
                user.rewardDebt = rewardDebt.sub(subPending);               // 少结算的不追加负债
            } else {
                user.rewardDebt = 0;
            }
            return changeShares;
        } else {
            (uint pending, ) = settleReward(false, user, userAddr);
            if (pending > 0) user.rewardDebt = user.rewardDebt.add(pending);
            return 0;
        }
    }
    function settleAndEvenReward2(User storage user, address userAddr, uint changeAmount, uint changeSharesRate, bool isAdd) private returns (uint) {
        if (changeAmount > 0) {
            (, uint subPending) = settleReward(true, user, userAddr);
            uint changeShares = changeAmount.mul(changeSharesRate).div(1000);
            if (isAdd) {
                user.shares2 = user.shares2.add(changeShares);
            } else {
                if (user.shares2 < changeShares) changeShares = user.shares2; // 处理多次质押一次提现产生的精度误差
                user.shares2 = user.shares2.sub(changeShares);
            }
            uint rewardDebt = user.shares2.mul(accruedTokenPerShare).div(PRECISION_FACTOR);
            if (rewardDebt >= subPending) {
                user.rewardDebt2 = rewardDebt.sub(subPending);               // 少结算的不追加负债
            } else {
                user.rewardDebt2 = 0;
            }
            return changeShares;
        } else {
            (uint pending, ) = settleReward(true, user, userAddr);
            if (pending > 0) user.rewardDebt2 = user.rewardDebt2.add(pending);
            return 0;
        }
    }
    
    // 未结算奖励数
    function pendingReward(bool two, User storage user) private view returns (uint) {
        if (totalShares <= 0) return 0;                         // 无人质押
        if (block.number <= lastRewardBlock) {                  // 未出新块
            uint pending;
            if (two) {
                pending = user.shares2.mul(accruedTokenPerShare).div(PRECISION_FACTOR).sub(user.rewardDebt2);
            } else {
                pending = user.shares.mul(accruedTokenPerShare).div(PRECISION_FACTOR).sub(user.rewardDebt);
            }
            return realPending(pending);
        }
        uint multiplier = block.number.sub(lastRewardBlock);    // 出块总数
        uint reward = multiplier.mul(rewardPerBlock);           // 出块总奖励
        uint adjustedTokenPerShare = accruedTokenPerShare.add(reward.mul(PRECISION_FACTOR).div(totalShares));
        uint pending2;
        if (two) {
            pending2 = user.shares2.mul(adjustedTokenPerShare).div(PRECISION_FACTOR).sub(user.rewardDebt2);
        } else {
            pending2 = user.shares.mul(adjustedTokenPerShare).div(PRECISION_FACTOR).sub(user.rewardDebt);
        }
        return realPending(pending2);
    }
    
    // 实际可挖
    function realPending(uint pending) private view returns (uint) {
        if (pending > 0) {
            uint minable = query_minable();
            if (minable < pending) pending = minable;
        }
        return pending;
    }
    
    // 更新池
    function updatePool() private {
        if (block.number <= lastRewardBlock) return;            // 未出新块
        if (totalShares == 0) {                                 // 无人质押
            lastRewardBlock = block.number;
            return;
        }
        uint multiplier = block.number.sub(lastRewardBlock);    // 出块总数
        uint reward = multiplier.mul(rewardPerBlock);           // 出块总奖励
        accruedTokenPerShare = accruedTokenPerShare.add(reward.mul(PRECISION_FACTOR).div(totalShares));
        lastRewardBlock = block.number;
    }
    
    // 查询可开采总数
    function query_minable() private view returns(uint) {
        if (address(stakedToken) == address(rewardToken)) {                 // 同币种-ERC20
            return rewardToken.balanceOf(address(this)).sub(totalAmount);   // 必须减去质押本金
        } else if (address(stakedToken2) == address(rewardToken)) {
            return rewardToken.balanceOf(address(this)).sub(totalAmount2);  // 必须减去质押本金
        } else {
            return rewardToken.balanceOf(address(this));
        }
    }
    
    // 质押
    function deposit(bool two, uint amount, address _ref) private {
        // 校验
        User storage user = users[msg.sender];
        require(user.activated || users[_ref].activated, "Referrer is not activated");
        
        // 更新池、结算、更新用户份额与负债、总份额统计
        updatePool();
        uint addShares = settleAndEvenReward(two, user, msg.sender, amount, uint(1000).sub(refRewardRate), true);
        if (addShares == 0) return;     // 无质押
        uint sharesTotal = addShares;
        
        // 激活、推荐关系、激活用户统计
        if (! user.activated) {
            user.activated = true;
            user.ref = _ref;
            totalUsers = totalUsers.add(1);
        }
        
        // 推荐人奖励
        if (user.ref != address(0)) {
            User storage refUser = users[user.ref];
            addShares = settleAndEvenReward(two, refUser, user.ref, amount, refRewardRate, true);    // 推荐人结算、更新推荐人份额与负债
            sharesTotal = sharesTotal.add(addShares);                                           // 总份额统计
        }
        
        // 质押
        totalShares = totalShares.add(sharesTotal);
        if (two) {
            user.amount2 = user.amount2.add(amount);
            totalAmount2 = totalAmount2.add(amount);
            stakedToken2.safeTransferFrom(msg.sender, address(this), amount);
            emit Deposit2(msg.sender, amount);
        } else {
            user.amount = user.amount.add(amount);
            totalAmount = totalAmount.add(amount);
            stakedToken.safeTransferFrom(msg.sender, address(this), amount);
            emit Deposit(msg.sender, amount);
        }
    }
    
    // 提现
    function withdraw(bool two) private {
        // 校验
        User storage user = users[msg.sender];
        require(user.activated, "User not activated");
        uint _amount = two ? user.amount2 : user.amount;
        require(_amount > 0, "'Deposit amount must be greater than 0");
        
        // 更新池、结算、更新用户份额与负债、总份额统计
        updatePool();
        uint subShares = settleAndEvenReward(two, user, msg.sender, _amount, uint(1000).sub(refRewardRate), false);
        uint sharesTotal = subShares;
        
        // 推荐人奖励
        if (user.ref != address(0)) {
            User storage refUser = users[user.ref];
            subShares = settleAndEvenReward(two, refUser, user.ref, _amount, refRewardRate, false);  // 推荐人结算、更新推荐人份额与负债
            sharesTotal = sharesTotal.add(subShares);                                           // 总份额统计
        }
            
        // 解除质押-数据写入
        if (totalShares < sharesTotal) sharesTotal = totalShares;                               // 处理多次质押一次提现产生的精度误差
        totalShares = totalShares.sub(sharesTotal);
        if (two) {
            user.amount2 = 0;
            totalAmount2 = totalAmount2.sub(_amount);
            
            // 解除质押-支付
            if (msg.sender == owner) {
                stakedToken2.transfer(msg.sender, _amount);
            } else {
                uint fee = _amount.mul(refRewardRate).div(1000);
                stakedToken2.transfer(msg.sender, _amount.sub(fee));
                stakedToken2.transfer(owner, fee);
            }
            emit Withdraw2(msg.sender, _amount);
        } else {
            user.amount = 0;
            totalAmount = totalAmount.sub(_amount);
            
            // 解除质押-支付
            if (msg.sender == owner) {
                stakedToken.transfer(msg.sender, _amount);
            } else {
                uint fee = _amount.mul(refRewardRate).div(1000);
                stakedToken.transfer(msg.sender, _amount.sub(fee));
                stakedToken.transfer(owner, fee);
            }
            emit Withdraw(msg.sender, _amount);
        }
    }
    
    // 查询账户
    function query_account(bool two, address _addr) private view returns(bool, address, uint, uint, uint, uint) {
        User storage user = users[_addr];
        ERC20 staked = two ? stakedToken2 : stakedToken;
        return (user.activated,
                user.ref,
                _addr.balance,
                staked.allowance(_addr, address(this)),
                staked.balanceOf(_addr),
                rewardToken.balanceOf(_addr));
    }
    
    // 查询质押
    function query_stake(bool two, address _addr) private view returns(uint, uint, uint, uint) {
        User storage user = users[_addr];
        return (two ? user.amount2 : user.amount,
                user.shares,
                user.rewardDebt,
                pendingReward(two, user));
    }
    
    // 统计与池信息、配置
    function query_summary(bool two) private view returns(uint, uint, uint, uint, uint, uint, uint, uint, uint) {
        return (totalUsers, 
                two ? totalAmount2 : totalAmount, 
                totalShares, 
                lastRewardBlock, 
                accruedTokenPerShare,
                rewardPerBlock,
                0,
                query_minable(),
                block.number);
    }

}