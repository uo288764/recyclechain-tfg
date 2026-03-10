import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "0x398Ad484deda91B436BF5FfA0308908e194f31Af";

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