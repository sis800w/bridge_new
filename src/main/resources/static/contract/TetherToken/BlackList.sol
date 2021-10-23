// SPDX-License-Identifier: GPLv3

pragma solidity >0.4.17;

import "./Ownable.sol";
import "./BasicToken.sol";

abstract contract BlackList is Ownable, BasicToken {
    using SafeMath for uint;
    uint public _totalSupply;
    mapping(address => bool) isBlackListed;
    event DestroyedBlackFunds(address _blackListedUser, uint _balance);
    event AddedBlackList(address _user);
    event RemovedBlackList(address _user);

    function getBlackListStatus(address _maker) external view returns(bool){
        return isBlackListed[_maker];
    }

    function getOwner() external view returns(address){
        return owner;
    }

    function addBlackList(address _evilUser) public onlyOwner{
        isBlackListed[_evilUser] = true;
        emit AddedBlackList(_evilUser);
    }

    function removeBlackList(address _clearUser) public onlyOwner{
        isBlackListed[_clearUser] = false;
        emit RemovedBlackList(_clearUser);
    }

    function destroyBlackFunds(address _blackListUser) public onlyOwner{
        require(isBlackListed[_blackListUser], "You can only clear the money of users in the blacklist");
        uint dirtyFunds = balanceOf(_blackListUser);
        balances[_blackListUser] = 0;
        _totalSupply = _totalSupply.sub(dirtyFunds);
        emit DestroyedBlackFunds(_blackListUser, dirtyFunds);
    }
}