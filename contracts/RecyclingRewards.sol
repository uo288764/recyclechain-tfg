pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RecyclingRewards
 * @notice TFG — Blockchain-based recycling rewards system
 * @dev Sprint 1: ERC20 token + recycling registration by stations
 */
contract RecyclingRewards is ERC20, Ownable {

    // 10 tokens per recycled kg 
    uint256 public constant REWARD_PER_KG = 10 * 10**18;

    struct RecyclingRecord {
        uint256 totalKg;
        uint256 totalRewards;
        uint256 lastRecyclingTime;
    }

    mapping(address => RecyclingRecord) public recyclingRecords;
    mapping(address => bool) public authorizedStations;

    event RecyclingRegistered(address indexed user, uint256 kg, uint256 reward, uint256 timestamp);
    event StationAuthorized(address indexed station, bool authorized);

    constructor() ERC20("RecycleToken", "RCT") Ownable(msg.sender) {
        // 1 millón de tokens para recompensas
        _mint(address(this), 1_000_000 * 10**18);
    }

    modifier onlyStation() {
        require(authorizedStations[msg.sender], "Not an authorized station");
        _;
    }

    function authorizeStation(address station, bool status) external onlyOwner {
        authorizedStations[station] = status;
        emit StationAuthorized(station, status);
    }

    function registerRecycling(address user, uint256 kilograms) external onlyStation {
        require(kilograms > 0, "Must recycle at least 1 kg");

        uint256 reward = kilograms * REWARD_PER_KG;
        recyclingRecords[user].totalKg += kilograms;
        recyclingRecords[user].totalRewards += reward;
        recyclingRecords[user].lastRecyclingTime = block.timestamp;

        _transfer(address(this), user, reward);
        emit RecyclingRegistered(user, kilograms, reward, block.timestamp);
    }

    function getUserStats(address user) external view returns (
        uint256 totalKg,
        uint256 totalRewards,
        uint256 lastTime,
        uint256 currentBalance
    ) {
        RecyclingRecord memory r = recyclingRecords[user];
        return (r.totalKg, r.totalRewards, r.lastRecyclingTime, balanceOf(user));
    }
}