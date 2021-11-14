contract rarity is ERC721 {
    uint public next_summoner;
    uint constant xp_per_day = 250e18;
    uint constant DAY = 1 days;
    
    string constant public name = "Rarity Manifested";
    string constant public symbol = "RM";
    
    mapping(uint => uint) public xp;
    mapping(uint => uint) public adventurers_log;
    mapping(uint => string) public summonerName;
    mapping(uint => uint) public class;
    mapping(uint => uint) public level;
    mapping (uint => address) public summonerToOwner;
    mapping (address => uint) public ownerSummonerCount;
    mapping (uint => address) public referrerOf;
    mapping (address => uint) public invitedCount;
    
    event summoned(address indexed owner, uint class, uint summoner);
    event leveled(address indexed owner, uint level, uint summoner);

    function adventure(uint _summoner) external {
        require(_isApprovedOrOwner(msg.sender, _summoner));
        require(block.timestamp > adventurers_log[_summoner]);
        adventurers_log[_summoner] = block.timestamp + DAY;
        xp[_summoner] += xp_per_day;
    }
    
    function spend_xp(uint _summoner, uint _xp) external {
        require(_isApprovedOrOwner(msg.sender, _summoner));
        xp[_summoner] -= _xp;
    }
    
    function level_up(uint _summoner) external {
        require(_isApprovedOrOwner(msg.sender, _summoner));
        uint _level = level[_summoner];
        uint _xp_required = xp_required(_level);
        xp[_summoner] -= _xp_required;
        level[_summoner] = _level+1;
        emit leveled(msg.sender, _level, _summoner);
    }
    
    function summoner(uint _summoner) external view returns (uint _xp, uint _log, uint _class, uint _level) {
        _xp = xp[_summoner];
        _log = adventurers_log[_summoner];
        _race = race[_summoner];
        _class = class[_summoner];
        _level = level[_summoner];
        _gender = gender[_summoner];
    }
    
    function summon(string memory _name,uint _race,uint _class,uint _gender,address _referrer) external {
        require(1 <= _race && _race <= 8);
        require(isClassAvailable(_race,_class));
        require(0 <= _gender && _gender <= 1);
        require(ownerSummonerCount[_referer]>0||next_summoner<5,"Referrer Required");
        uint _next_summoner = next_summoner;
        race[_next_summoner]  = _race;
        class[_next_summoner] = _class;
        gender[_next_summoner] = _gender;
        level[_next_summoner] = 1;
        ownerSummonerCount[msg.sender] = ownerSummonerCount[msg.sender].add(1);
        referrerOf[msg.sender] = _referrer;
        invitedCount[_referrer] = invitedCount[_referrer].add(1);
        _safeMint(msg.sender, _next_summoner);
        emit summoned(msg.sender,_race, _class, _next_summoner);
        next_summoner++;
    }

    function isClassAvailable(race,class){
        if(race == 1){
            if (class == 1) return true;
            if (class == 2) return true;
            if (class == 4) return true;
            if (class == 5) return true;
            if (class == 8) return true;
            if (class == 9) return true;
        }
        if(race == 2){
            if (class == 3) return true;
            if (class == 2) return true;
            if (class == 5) return true;
            if (class == 4) return true;
            if (class == 1) return true;
        }
        if(race == 3){
            if (class == 11) return true;
            if (class == 3) return true;
            if (class == 5) return true;
            if (class == 4) return true;
            if (class == 1) return true;
        }
        if(race == 4){
            if (class == 8) return true;
            if (class == 4) return true;
            if (class == 9) return true;
            if (class == 1) return true;
        if(race == 5){
            if (class == 3) return true;
            if (class == 4) return true;
            if (class == 7) return true;
            if (class == 9) return true;
            if (class == 1) return true;
        if(race == 6){
            if (class == 8) return true;
            if (class == 5) return true;
            if (class == 4) return true;
            if (class == 9) return true;
            if (class == 1) return true;
        if(race == 7){
            if (class == 11) return true;
            if (class == 3) return true;
            if (class == 7) return true;
            if (class == 1) return true;
        if(race == 8){
            if (class == 3) return true;
            if (class == 8) return true;
            if (class == 5) return true;
            if (class == 4) return true;
            if (class == 7) return true;
            if (class == 1) return true;
        }
    }
    
    function xp_required(uint curent_level) public pure returns (uint xp_to_next_level) {
        xp_to_next_level = curent_level * 1000e18;
        for (uint i = 1; i < curent_level; i++) {
            xp_to_next_level += i * 1000e18;
        }
    }
    
    function tokenURI(uint256 _summoner) public view returns (string memory) {
        string[7] memory parts;
        parts[0] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: white; font-family: serif; font-size: 14px; }</style><rect width="100%" height="100%" fill="black" /><text x="10" y="20" class="base">';

        parts[1] = string(abi.encodePacked("class", " ", classes(class[_summoner])));

        parts[2] = '</text><text x="10" y="40" class="base">';

        parts[3] = string(abi.encodePacked("level", " ", toString(level[_summoner])));

        parts[4] = '</text><text x="10" y="60" class="base">';

        parts[5] = string(abi.encodePacked("xp", " ", toString(xp[_summoner]/1e18)));

        parts[6] = '</text></svg>';

        string memory output = string(abi.encodePacked(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6]));
        
        string memory json = Base64.encode(bytes(string(abi.encodePacked('{"name": "summoner #', toString(_summoner), '", "description": "Rarity is achieved via an active economy, summoners must level, gain feats, learn spells, to be able to craft gear. This allows for market driven rarity while allowing an ever growing economy. Feats, spells, and summoner gear is ommitted as part of further expansions.", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(output)), '"}'))));
        output = string(abi.encodePacked('data:application/json;base64,', json));

        return output;
    }

    function races(uint id) public pure returns (string memory description) {
        if (id == 1) {
            return "Human";
        } else if (id == 2) {
            return "Dwarf";
        } else if (id == 3) {
            return "Night Elf";
        } else if (id == 4) {
            return "Gnome";
        } else if (id == 5) {
            return "Orc";
        } else if (id == 6) {
            return "Undead";
        } else if (id == 7) {
            return "Tauren";
        } else if (id == 8) {
            return "Troll";
        }
    }     
    function classes(uint id) public pure returns (string memory description) {
        if (id == 1) {
            return "Warrior";
        } else if (id == 2) {
            return "Paladin";
        } else if (id == 3) {
            return "Hunter";
        } else if (id == 4) {
            return "Rogue";
        } else if (id == 5) {
            return "Priest";
        } else if (id == 6) {
            return "Shaman";
        } else if (id == 7) {
            return "Mage";
        } else if (id == 8) {
            return "Warlock";
        } else if (id == 9) {
            return "Druid";
        }
    }
    
    function toString(uint256 value) internal pure returns (string memory) {
    // Inspired by OraclizeAPI's implementation - MIT license
    // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}