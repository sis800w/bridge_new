// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.7.6;

import './IERC721.sol';

interface IERC721Receiver {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}