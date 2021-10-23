// SPDX-License-Identifier: GPLv3

pragma solidity >0.4.17;

import "./BasicToken.sol";
import "./ERC20.sol";

abstract contract StandardToken is BasicToken, ERC20 {
    using SafeMath for uint;
    mapping(address => mapping(address => uint)) public allowed;
    uint public constant MAX_UINT = 2**256-1;
    
    function transferFrom(address _from, address _to, uint _value) public virtual override onlyPayloadSize(2 * 32){
        uint _allowance = allowed[_from][msg.sender];
        uint fee = _value.mul(basisPointsRate).div(10000);
        if (fee > maximunFee) fee = maximunFee;
        if (_allowance < MAX_UINT){
            allowed[_from][msg.sender] = _allowance.sub(_value);
        }
        balances[_from] = balances[_from].sub(_value);
        uint sendAmount = _value.sub(fee);
        balances[_to] = balances[_to].add(sendAmount);
        if (fee > 0){
            balances[owner] = balances[owner].add(fee);
            emit Transfer(_from, owner, fee);
        }
        emit Transfer(_from, _to, sendAmount);
    }

    function approve(address _spender, uint _value) public virtual override onlyPayloadSize(2 * 32){
        require(!(_value != 0 && allowed[msg.sender][_spender] != 0), "You have only one chance to approve , you can only change it to 0 later");
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
    }

    function allowance(address _owner, address _spender) public virtual override view returns(uint remaining){
        return allowed[_owner][_spender];
    }
}