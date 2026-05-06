// src/hooks/useWallet.js
// Custom hook that manages MetaMask wallet interactions.
// Provides: account address, provider, signer, network info,
// connect/disconnect functions, and automatic network switching.
//
// Uses ethers.js FallbackProvider with multiple RPC endpoints so that
// if one node is saturated or unavailable, the next one is tried automatically.
// All network constants are read from src/config/network.js.

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { AMOY_CHAIN_ID, AMOY_RPC_URLS, BLOCK_EXPLORER_URL } from "../config/network";

// Builds an ethers.js FallbackProvider from the RPC list.
// Each provider is given a decreasing priority so the first URL is preferred.
const buildFallbackProvider = () => {
    const providers = AMOY_RPC_URLS.map((url, index) => ({
        provider: new ethers.JsonRpcProvider(url),
        priority: AMOY_RPC_URLS.length - index,
        stallTimeout: 2000,
    }));
    return new ethers.FallbackProvider(providers, 1);
};

export const useWallet = () => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const connect = async () => {
        if (!window.ethereum) {
            setError("MetaMask not found. Please install it.");
            return;
        }
        try {
            setLoading(true);
            setError(null);

            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await browserProvider.send("eth_requestAccounts", []);
            const _signer = await browserProvider.getSigner();
            const network = await browserProvider.getNetwork();
            const fallbackProvider = buildFallbackProvider();

            setProvider(fallbackProvider);
            setSigner(_signer);
            setAccount(accounts[0]);
            setChainId("0x" + network.chainId.toString(16));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const disconnect = () => {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setChainId(null);
    };

    const switchToAmoy = async () => {
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: AMOY_CHAIN_ID }],
            });
        } catch (err) {
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{
                    chainId: AMOY_CHAIN_ID,
                    chainName: "Polygon Amoy",
                    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
                    rpcUrls: AMOY_RPC_URLS,
                    blockExplorerUrls: [BLOCK_EXPLORER_URL],
                }],
            });
        }
    };

    const isCorrectNetwork = chainId === AMOY_CHAIN_ID;

    useEffect(() => {
        if (!window.ethereum) { return; }

        window.ethereum.on("accountsChanged", (accounts) => {
            if (accounts.length === 0) {
                disconnect();
            } else {
                setAccount(accounts[0]);
            }
        });

        window.ethereum.on("chainChanged", (newChainId) => {
            setChainId(newChainId);
        });
    }, []);

    return { account, provider, signer, chainId, loading, error, connect, disconnect, switchToAmoy, isCorrectNetwork };
};