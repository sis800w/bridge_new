// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./Ownable.sol";
import "./interfaces/ERC721.sol";
import "./interfaces/ERC20.sol";
import "./libraries/SafeERC20.sol";

contract MarketNFT is Ownable {
    using SafeERC20 for ERC20;

    /* ******************* 写死配置 ****************** */
    
    ERC721 public erc721;
    ERC20 public erc20;

    
    /* ******************* 可改配置 ****************** */

    // 手续费率 * 100
    uint256 private fee;
    // 最低价格
    uint256 private minPrice;



    /* ******************* 业务数据 ****************** */

    // 列表计数
    uint256 private listingCount;
    // 列表id
    uint256[] public listedIds;
    // listId ==> Item
    mapping(uint256 => Goods) private listings;



    /* ********************* 定义 ******************** */

    // 状态
    enum Status {
        LISTED,         // 上市的
        UNLISTED,       // 未上市的
        SOLD            // 售出
    }

    // 商品
    struct Goods {
        uint256 listId;
        uint256 tokenId;
        address owner;  // 拥有者
        address buyer;  // 购买者
        uint256 price;  // 价格
        uint256 payout; // 支出 = 价格 - 手续费
        Status status;
    }

    // 事件
    event Bought(uint256 listId);               // 购买
    event Listed(uint256 listId);               // 上架
    event Unlisted(uint256 listId);             // 下架
    event FeeChanged(uint256 fee);              // 修改手续费率
    event MinPriceChanged(uint256 minPrice);    // 修改最低价格



    /* ********************* 写函数 ******************** */

    // 构造
    constructor(ERC721 erc721_, ERC20 erc20_, uint8 fee_, uint256 minPrice_) {
        erc721 = erc721_;
        erc20 = erc20_;
        fee = fee_;
        minPrice = minPrice_;
    }

    // 挂卖
    function list(uint tokenId, uint price) external {
        require(erc721.ownerOf(tokenId) == msg.sender, "Summoner is not yours");
        uint payout = price - ((price * fee) / 100);
        require(price >= minPrice, "Price too low");

        // 随机-确保公平排序
        uint256 listId = uint256(
            keccak256(
                abi.encodePacked(
                    tokenId,
                    msg.sender,
                    price,
                    block.timestamp,
                    block.difficulty
                )
            )
        );

        // 保存商品信息
        listings[listId] = Goods({
            listId: listId,
            tokenId: tokenId,
            owner: msg.sender,
            buyer: address(0),
            price: price,
            payout: payout,
            status: Status.LISTED
        });
        listedIds.push(listId);
        listingCount++;

        // 转账
        erc721.safeTransferFrom(msg.sender, address(this), tokenId);
        emit Listed(listId);
    }

    // 买
    function buy(uint listId) external {
        Goods memory item = listings[listId];
        require(item.status == Status.LISTED, "summoner not listed");
        
        // 修改商品信息及平台收益
        item.status = Status.SOLD;
        item.buyer = msg.sender;
        listings[listId] = item;
        listingCount--;

        // 转账
        erc721.safeTransferFrom(address(this), msg.sender, item.tokenId);
        erc20.safeTransferFrom(msg.sender, address(this), item.price);
        erc20.transfer(item.owner, item.payout);
        emit Bought(listId);
    }

    // 下架
    function unlist(uint256 listId) external {
        Goods memory item = listings[listId];
        require(msg.sender == item.owner);
        require(item.status == Status.LISTED);
        
        // 修改商品信息
        item.status = Status.UNLISTED;
        listings[listId] = item;
        listingCount--;

        // 转账
        erc721.safeTransferFrom(address(this), item.owner, item.tokenId);
        emit Unlisted(listId);
    }



    /* ********************** 读函数 ********************* */

    // 获取商品
    function getGoods(uint listId) public view returns (Goods memory) {
        Goods memory token = listings[listId];
        require(token.owner != address(0), "No summoner for that id");
        return token;
    }

    // 获取卖单(范围)
    function getGoodsRange(uint startIdx, uint endIdx) public view returns (Goods[] memory result) {
        result = new Goods[](endIdx - startIdx);
        for (uint i = startIdx; i < endIdx; i++) {
            result[i - startIdx] = getGoods(listedIds[i]);
        }
    }

    // 获取卖单(所有)
    function getGoodsAll() public view returns (Goods[] memory) {
        return getGoodsRange(0, listedIds.length);
    }

    // 获取卖单(分页)
    function getGoodsPage(uint pageIdx, uint pageSize) public view returns (Goods[] memory) {
        uint startIdx = pageIdx * pageSize;
        require(startIdx <= listedIds.length, "Page number too high");
        uint pageEnd = startIdx + pageSize;
        uint endIdx = pageEnd <= listedIds.length ? pageEnd : listedIds.length;
        return getGoodsRange(startIdx, endIdx);
    }

    // 获取卖单数量(根据地址)
    function getGoodsSizeByOwner(address owner) public view returns (uint) {
        uint size = 0;
        for (uint i = 0; i < listedIds.length; i++) {
            if (getGoods(listedIds[i]).owner == owner) {
                size++;
            }
        }
        return size;
    }

    // 获取卖单(根据地址)
    function getGoodsByOwner(address owner) public view returns (Goods[] memory result) {
        result = new Goods[](getGoodsSizeByOwner(owner));
        uint index = 0;
        Goods memory goods;
        for (uint i = 0; i < listedIds.length; i++) {
            goods = getGoods(listedIds[i]);
            if (goods.owner == owner) {
                result[index] = goods;
                index++;
            }
        }
    }

    // 公共数据查询
    function query_summary() external view returns (uint, uint, uint, uint) {
        return (fee, minPrice, listingCount, listedIds.length);
    }



    /* ******************* 写函数-owner ****************** */

    // 归集收益
    function collectFees() external onlyOwner {
        erc20.transfer(owner, erc20.balanceOf(address(this)));
    }

    // 设置手续费率 * 100
    function setFee(uint fee_) external onlyOwner {
        require(fee <= 20, "don't be greater than 20%!");
        fee = fee_;
        emit FeeChanged(fee);
    }

    // 设置最低价格
    function setMinPrice(uint minPrice_) external onlyOwner {
        minPrice = minPrice_;
        emit MinPriceChanged(minPrice);
    }

}