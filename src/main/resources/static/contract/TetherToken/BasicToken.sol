// SPDX-License-Identifier: GPLv3

pragma solidity >0.4.17;

import "./Ownable.sol";
import "./ERC20Basic.sol";
import "./SafeMath.sol";

abstract contract BasicToken is Ownable, ERC20Basic {
    using SafeMath for uint;
    mapping(address => uint) public balances;
    uint public basisPointsRate = 0;
    uint public maximunFee = 0;

    modifier onlyPayloadSize(uint size){
        require(!(msg.data.length < size+4), "Invalid short address");
        _;
    }

    function transfer(address _to, uint _value) public virtual override onlyPayloadSize(2 * 32){
        uint fee = (_value.mul(basisPointsRate)).div(10000);
        if (fee > maximunFee) fee = maximunFee;
        uint sendAmount = _value.sub(fee);
        balances[msg.sender] = balances[msg.sender].sub(sendAmount);
        balances[_to] = balances[_to].add(sendAmount);
        if (fee > 0){
            balances[owner] = balances[owner].add(fee);
            emit Transfer(msg.sender, owner, fee);
        }
        emit Transfer(msg.sender, _to, sendAmount);
    }

    function balanceOf(address _owner) public virtual override view returns(uint balance){
        return balances[_owner];
    }

}