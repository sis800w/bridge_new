// SPDX-License-Identifier: GPLv3

pragma solidity >0.4.17;

import "./Pausable.sol";
import "./BlackList.sol";
import "./UpgradedStandardToken.sol";


contract TetherToken is Pausable, StandardToken, BlackList {
    using SafeMath for uint;
    string public name;
    string public symbol;
    uint public decimals;
    address public upgradedAddress;
    bool public deprecated;

    constructor(
        uint _initialSupply,
        string memory _name,
        string memory _symbol,
        uint _decimals
    ) {
        _totalSupply = _initialSupply;
        balances[owner] = _initialSupply;
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        deprecated = false;
    }

    event Issue(uint amount);
    event Redeem(uint amount);
    event Deprecate(address newAddress);
    event Params(uint feeBasisPoints, uint maxFee);

    function transfer(address _to, uint _value) public override whenNotPaused{
        require(!isBlackListed[msg.sender], "The account you applied for is on the blacklist and cannot be transferred");
        if (deprecated) {
            return UpgradedStandardToken(upgradedAddress).transferByLegacy(msg.sender, _to, _value);
        } else {
            return super.transfer(_to, _value);
        }
    }

    function transferFrom(address _from, address _to, uint _value) public override whenNotPaused{
        require(!isBlackListed[_from], "The account you applied for is on the blacklist and cannot be transferred");
        if(deprecated){
            return UpgradedStandardToken(upgradedAddress).transferFromByLegacy(msg.sender, _from, _to, _value);
        }else{
            return super.transferFrom(_from, _to, _value);
        }
    }

    function balanceOf(address who) public override view returns(uint){
        if(deprecated){
            return UpgradedStandardToken(upgradedAddress).balanceOf(who);
        }else{
            return super.balanceOf(who);
        }
    }

    function approve(address _spender, uint _value) public override whenNotPaused{
        if(deprecated){
            return UpgradedStandardToken(upgradedAddress).approveByLegacy(msg.sender, _spender, _value);
        }else{
            return super.approve(_spender, _value);
        }

    }

    function allowance(address _owner, address _spender) public override view returns(uint){
        if(deprecated){
            return UpgradedStandardToken(upgradedAddress).allowance(_owner, _spender);
        }else{
            return super.allowance(_owner, _spender);
        }
    }

    function deprecate(address _upgradedAddress) public onlyOwner{
        deprecated = true;
        upgradedAddress = _upgradedAddress;
        emit Deprecate(_upgradedAddress);
    }

    function totalSupply() public view override returns(uint){
        if (deprecated) {
            return UpgradedStandardToken(upgradedAddress).totalSupply();
        } else{
            return _totalSupply;
        }
    }

    function issue(uint _amount) public onlyOwner{
        balances[owner] = balances[owner].add(_amount);
        _totalSupply = _totalSupply.add(_amount);
        emit Issue(_amount);
    }

    function setParams(uint newBasisPoints, uint newMaxFee) public onlyOwner{
        require(newBasisPoints < 20, "The new BasisPoints cannot exceed 20"); //0.002
        require(newMaxFee < 50, "The new MaxFee cannot exceed 50"); //5*10**(decimals+1)
        basisPointsRate = newBasisPoints;
        maximunFee = newMaxFee.mul(10**decimals);
        emit Params(newBasisPoints, newMaxFee);
    }
}