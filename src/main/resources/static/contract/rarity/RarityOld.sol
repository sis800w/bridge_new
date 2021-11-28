// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./ERC721.sol";
import "./libraries/Base64.sol";
import "./libraries/Strings.sol";

contract RarityOld is ERC721 {
    using Strings for uint256;
    
    // 下一个召唤师id
    uint public next_summoner;
    // 每天经验
    uint constant xp_per_day = 250e18;
    // 天数
    uint constant DAY = 1 days;
    
    string constant public name = "Rarity Manifested";
    string constant public symbol = "RM";
    
    // 经验
    mapping(uint => uint) public xp;
    // 冒险家日志(token id=>下一次可冒险时间戳)
    mapping(uint => uint) public adventurers_log;
    // 职业(token id=>职业:1-11)
    mapping(uint => uint) public class;
    // 等级
    mapping(uint => uint) public level;
    
    event summoned(address indexed owner, uint class, uint summoner);
    event leveled(address indexed owner, uint level, uint summoner);

    // 召唤
    function summon(uint _class) external {
        require(1 <= _class && _class <= 11);
        uint _next_summoner = next_summoner;
        class[_next_summoner] = _class;
        level[_next_summoner] = 1;
        _safeMint(msg.sender, _next_summoner);
        emit summoned(msg.sender, _class, _next_summoner);
        next_summoner++;
    }

    // 冒险
    function adventure(uint _summoner) external {
        require(_isApprovedOrOwner(msg.sender, _summoner));
        require(block.timestamp > adventurers_log[_summoner]);
        adventurers_log[_summoner] = block.timestamp + DAY;
        xp[_summoner] += xp_per_day;
    }
    
    // 花费经验
    function spend_xp(uint _summoner, uint _xp) external {
        require(_isApprovedOrOwner(msg.sender, _summoner));
        xp[_summoner] -= _xp;
    }
    
    // 升级
    function level_up(uint _summoner) external {
        require(_isApprovedOrOwner(msg.sender, _summoner));
        uint _level = level[_summoner];
        uint _xp_required = xp_required(_level);
        xp[_summoner] -= _xp_required;
        level[_summoner] = _level+1;
        emit leveled(msg.sender, _level, _summoner);
    }
    
    
    
    // 升级必须经验
    function xp_required(uint curent_level) public pure returns (uint xp_to_next_level) {
        xp_to_next_level = curent_level * 1000e18;
        for (uint i = 1; i < curent_level; i++) {
            xp_to_next_level += i * 1000e18;
        }
    }
    
    // 质押描述
    function classes(uint id) public pure returns (string memory description) {
        if (id == 1) {
            return "Barbarian";
        } else if (id == 2) {
            return "Bard";
        } else if (id == 3) {
            return "Cleric";
        } else if (id == 4) {
            return "Druid";
        } else if (id == 5) {
            return "Fighter";
        } else if (id == 6) {
            return "Monk";
        } else if (id == 7) {
            return "Paladin";
        } else if (id == 8) {
            return "Ranger";
        } else if (id == 9) {
            return "Rogue";
        } else if (id == 10) {
            return "Sorcerer";
        } else if (id == 11) {
            return "Wizard";
        }
    }
    
    // 召唤师查询
    function summoner(uint _summoner) external view returns (uint _xp, uint _log, uint _class, uint _level) {
        _xp = xp[_summoner];
        _log = adventurers_log[_summoner];
        _class = class[_summoner];
        _level = level[_summoner];
    }
    
    // tokenURI
    function tokenURI(uint256 _summoner) public view returns (string memory) {
        string[7] memory parts;
        parts[0] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: white; font-family: serif; font-size: 14px; }</style><rect width="100%" height="100%" fill="black" /><text x="10" y="20" class="base">';
        parts[1] = string(abi.encodePacked("class", " ", classes(class[_summoner])));
        parts[2] = '</text><text x="10" y="40" class="base">';
        parts[3] = string(abi.encodePacked("level", " ", Strings.toString(level[_summoner])));
        parts[4] = '</text><text x="10" y="60" class="base">';
        parts[5] = string(abi.encodePacked("xp", " ", Strings.toString(xp[_summoner]/1e18)));
        parts[6] = '</text></svg>';
        string memory output = string(abi.encodePacked(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6]));
        string memory json = Base64.encode(bytes(string(abi.encodePacked('{"name": "summoner #', Strings.toString(_summoner), '", "description": "Rarity is achieved via an active economy, summoners must level, gain feats, learn spells, to be able to craft gear. This allows for market driven rarity while allowing an ever growing economy. Feats, spells, and summoner gear is ommitted as part of further expansions.", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(output)), '"}'))));
        output = string(abi.encodePacked('data:application/json;base64,', json));
        return output;
    }
    
}