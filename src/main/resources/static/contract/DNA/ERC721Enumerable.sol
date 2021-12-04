// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC721.sol";
import "./IERC721Enumerable.sol";

abstract contract ERC721Enumerable is ERC721, IERC721Enumerable {
    // wallet => index1 => tokenId 查余额，遍历用户的每一个NFT
    mapping(address => mapping(uint256 => uint256)) private _ownedTokens;
    // tokenId => index1 查tokenId在_ownedTokens中的index
    mapping(uint256 => uint256) private _ownedTokensIndex;
    // index2 => tokenId 查发行总量，遍历每一个NFT
    uint256[] private _allTokens;
    // tokenId => index2
    mapping(uint256 => uint256) private _allTokensIndex;

    function tokenOfOwnerByIndex(address owner, uint256 index) public view virtual override returns (uint256) {
        require(index < ERC721.balanceOf(owner), "ERC721Enumerable: owner index out of bounds");
        return _ownedTokens[owner][index];
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _allTokens.length;
    }

    function tokenByIndex(uint256 index) public view virtual override returns (uint256) {
        require(index < ERC721Enumerable.totalSupply(), "ERC721Enumerable: global index out of bounds");
        return _allTokens[index];
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        if (from == address(0)) {   // 铸造
            _addTokenToAllTokensEnumeration(tokenId);
        } else if (from != to) {    // 销毁或转账
            _removeTokenFromOwnerEnumeration(from, tokenId);
        }
        if (to == address(0)) {     // 销毁
            _removeTokenFromAllTokensEnumeration(tokenId);
        } else if (to != from) {    // 铸造或转账
            _addTokenToOwnerEnumeration(to, tokenId);
        }
    }

    // 铸造或转账
    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) private {
        uint256 length = ERC721.balanceOf(to);
        _ownedTokens[to][length] = tokenId;
        _ownedTokensIndex[tokenId] = length;
    }

    // 铸造
    function _addTokenToAllTokensEnumeration(uint256 tokenId) private {
        _allTokensIndex[tokenId] = _allTokens.length;
        _allTokens.push(tokenId);
    }

    // 销毁或转账
    function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId) private {
        uint256 lastTokenIndex = ERC721.balanceOf(from) - 1;
        uint256 tokenIndex = _ownedTokensIndex[tokenId];
        if (tokenIndex != lastTokenIndex) {     // 要转走的NFT不是我的最后一个NFT，则将最后一个NFT移动到当前位置（填位，确保index的连续性）
            uint256 lastTokenId = _ownedTokens[from][lastTokenIndex];
            _ownedTokens[from][tokenIndex] = lastTokenId;
            _ownedTokensIndex[lastTokenId] = tokenIndex;
        }
        delete _ownedTokensIndex[tokenId];      // 删除最后一个
        delete _ownedTokens[from][lastTokenIndex];
    }

    // 销毁
    function _removeTokenFromAllTokensEnumeration(uint256 tokenId) private {
        uint256 lastTokenIndex = _allTokens.length - 1;
        uint256 tokenIndex = _allTokensIndex[tokenId];
        uint256 lastTokenId = _allTokens[lastTokenIndex];
        _allTokens[tokenIndex] = lastTokenId;
        _allTokensIndex[lastTokenId] = tokenIndex;
        delete _allTokensIndex[tokenId];
        _allTokens.pop();
    }
}