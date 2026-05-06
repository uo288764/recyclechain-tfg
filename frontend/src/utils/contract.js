// src/utils/contract.js
//
// Provides the ethers.js Contract instance for RecyclingRewards.
// The contract address and ABI are the only things that belong here —
// all network configuration lives in src/config/network.js.

import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "../config/network";

export { CONTRACT_ADDRESS };

export const CONTRACT_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function getUserStats(address user) view returns (uint256 totalKg, uint256 totalRewards, uint256 lastTime, uint256 currentBalance)",
    "function authorizeStation(address station, bool status) external",
    "function registerRecycling(address user, uint256 kilograms) external",
    "function authorizedStations(address) view returns (bool)",
    "event RecyclingRegistered(address indexed user, uint256 kg, uint256 reward, uint256 timestamp)",
];

export const getContract = (signerOrProvider) => {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
};