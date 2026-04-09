//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title RWAToken
 * @dev Tokenized Real-World Asset (RWA) with minting, burning, and whitelist restrictions
 * @notice This contract represents a fractionalized investment product with controlled transfer restrictions
 */
contract RWAToken {
    string public name = "RWA Investment Token";
    string public symbol = "RWAT";
    uint8 public decimals = 18;
    uint256 private _totalSupply;

    address public owner;
    bool private _initializing;

    // Token balance mapping
    mapping(address => uint256) private balances;

    // Allowance mapping for approve/transferFrom
    mapping(address => mapping(address => uint256)) private allowances;

    // Whitelist mapping (address -> whitelisted)
    mapping(address => bool) public isWhitelisted;

    // Whitelisted addresses list (for enumeration in frontend)
    address[] private whitelistedList;

    // Index mapping to track whitelisted addresses (value is index+1, so 0 = not in list)
    mapping(address => uint256) private whitelistedIndex;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Burn(address indexed from, uint256 value);
    event Mint(address indexed to, uint256 value);
    event WhitelistAdded(address indexed addr);
    event WhitelistRemoved(address indexed addr);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier notZeroAddress(address _addr) {
        require(_addr != address(0), "Zero address not allowed");
        _;
    }

    constructor() {
        owner = msg.sender;
        // Initial supply: 1 million tokens with 18 decimals
        _totalSupply = 1_000_000 * (10 ** uint256(decimals));
        balances[msg.sender] = _totalSupply;
        
        // Owner is automatically whitelisted
        _setWhitelisted(msg.sender, true);
        
        emit Transfer(address(0), msg.sender, _totalSupply);
    }

    // ==================== View Functions ====================

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function allowance(address _owner, address spender) external view returns (uint256) {
        return allowances[_owner][spender];
    }

    // Whitelist enumeration functions
    function getWhitelistedCount() external view returns (uint256) {
        return whitelistedList.length;
    }

    function getWhitelistedAt(uint256 index) external view returns (address) {
        require(index < whitelistedList.length, "Index out of bounds");
        return whitelistedList[index];
    }

    function getWhitelisted() external view returns (address[] memory) {
        return whitelistedList;
    }

    // ==================== Transfer Functions ====================

    /**
     * @dev Transfer tokens to a recipient (to must be whitelisted)
     */
    function transfer(address to, uint256 amount) external notZeroAddress(to) returns (bool) {
        require(isWhitelisted[to], "Recipient not whitelisted");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        unchecked {
            balances[msg.sender] -= amount;
        }
        balances[to] += amount;

        emit Transfer(msg.sender, to, amount);
        return true;
    }

    /**
     * @dev TransferFrom with allowance (to must be whitelisted)
     */
    function transferFrom(address from, address to, uint256 amount) external notZeroAddress(to) returns (bool) {
        require(isWhitelisted[to], "Recipient not whitelisted");
        require(balances[from] >= amount, "Insufficient balance");
        require(allowances[from][msg.sender] >= amount, "Insufficient allowance");

        unchecked {
            balances[from] -= amount;
            allowances[from][msg.sender] -= amount;
        }
        balances[to] += amount;

        emit Transfer(from, to, amount);
        return true;
    }

    // ==================== Approval Functions ====================

    function approve(address spender, uint256 amount) external notZeroAddress(spender) returns (bool) {
        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    // ==================== Mint/Burn Functions ====================

    /**
     * @dev Mint new tokens (only owner)
     */
    function mint(address to, uint256 amount) external onlyOwner notZeroAddress(to) {
        // When minting to a new address, automatically whitelist if needed (optional)
        // For clarity in demo, we require to be already whitelisted
        require(isWhitelisted[to], "Recipient not whitelisted");

        _totalSupply += amount;
        balances[to] += amount;

        emit Mint(to, amount);
        emit Transfer(address(0), to, amount);
    }

    /**
     * @dev Burn tokens from caller's balance
     */
    function burn(uint256 amount) external returns (bool) {
        require(balances[msg.sender] >= amount, "Insufficient balance to burn");

        unchecked {
            balances[msg.sender] -= amount;
        }
        _totalSupply -= amount;

        emit Burn(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
        return true;
    }

    /**
     * @dev Burn tokens on behalf of another address (using allowance)
     * Useful for demonstrating burn as part of redemption flow with approvals
     */
    function burnFrom(address from, uint256 amount) external returns (bool) {
        require(balances[from] >= amount, "Insufficient balance to burn");
        require(allowances[from][msg.sender] >= amount, "Insufficient allowance to burn");

        unchecked {
            balances[from] -= amount;
            allowances[from][msg.sender] -= amount;
        }
        _totalSupply -= amount;

        emit Burn(from, amount);
        emit Transfer(from, address(0), amount);
        return true;
    }

    // ==================== Whitelist Management ====================

    /**
     * @dev Internal function to add/remove from whitelist with proper enumeration
     */
    function _setWhitelisted(address addr, bool status) internal {
        if (status && !isWhitelisted[addr]) {
            // Add to whitelist
            isWhitelisted[addr] = true;
            whitelistedIndex[addr] = whitelistedList.length + 1; // Store index+1
            whitelistedList.push(addr);
            emit WhitelistAdded(addr);
        } else if (!status && isWhitelisted[addr]) {
            // Remove from whitelist
            isWhitelisted[addr] = false;
            uint256 index = whitelistedIndex[addr] - 1; // Get actual index
            
            // Swap with last element and pop
            if (index < whitelistedList.length - 1) {
                address lastAddr = whitelistedList[whitelistedList.length - 1];
                whitelistedList[index] = lastAddr;
                whitelistedIndex[lastAddr] = index + 1;
            }
            whitelistedList.pop();
            whitelistedIndex[addr] = 0;
            emit WhitelistRemoved(addr);
        }
    }

    /**
     * @dev Set whitelist status for an address (only owner)
     */
    function setWhitelisted(address addr, bool status) external onlyOwner notZeroAddress(addr) {
        _setWhitelisted(addr, status);
    }

    // ==================== Ownership ====================

    function transferOwnership(address newOwner) external onlyOwner notZeroAddress(newOwner) {
        address previousOwner = owner;
        owner = newOwner;
        // Whitelist new owner
        _setWhitelisted(newOwner, true);
        emit OwnershipTransferred(previousOwner, newOwner);
    }
}
