// SPDX-License-Identifier: GPLv3

pragma solidity >0.4.17;

import "./Ownable.sol";

contract Pausable is Ownable {
    event Pause();
    event Unpause();

    bool public paused = false;

    modifier whenNotPaused(){
        require(!paused, "Must be used without pausing");
        _;
    }

    modifier whenPaused(){
        require(paused, "Must be used under pause");
        _;
    }

    function pause() public onlyOwner whenNotPaused {
        paused = true;
        emit Pause();
    }

    function unpause() public onlyOwner whenPaused{
        paused = false;
        emit Unpause();
    }
}