// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.7.6;

import './IERC721.sol';

interface IERC721Enumerable is IERC721 {
    function totalSupply() external view returns (uint256);
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256 tokenId);
    function tokenByIndex(uint256 index) external view returns (uint256);
}