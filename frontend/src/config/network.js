// src/config/network.js
//
// Single source of truth for all blockchain network configuration.
// Values are read from Vite environment variables (VITE_ prefix) so that
// they can be changed per deployment without modifying source code.
// The actual values live in frontend/.env which is never committed to the repo.

const required = (key) => {
    const value = import.meta.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};

// Deployed RecyclingRewards ERC-20 contract address on Polygon Amoy testnet
export const CONTRACT_ADDRESS = required("VITE_CONTRACT_ADDRESS");

// Operator wallet address authorised to call registerRecycling on the contract
export const OPERATOR_ADDRESS = required("VITE_OPERATOR_ADDRESS");

// Polygon Amoy testnet chain ID in hexadecimal (80002 decimal)
export const AMOY_CHAIN_ID = required("VITE_AMOY_CHAIN_ID");

// RPC endpoints in priority order for ethers.js FallbackProvider.
// If the primary node is saturated or unavailable the next one is tried automatically.
export const AMOY_RPC_URLS = [
    required("VITE_RPC_PRIMARY"),
    required("VITE_RPC_SECONDARY"),
    required("VITE_RPC_FALLBACK"),
];

// Polygon Amoy block explorer base URL
export const BLOCK_EXPLORER_URL = "https://amoy.polygonscan.com";