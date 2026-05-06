// src/hooks/useWallet.js
// Custom hook that manages MetaMask wallet interactions.
// Provides: account address, provider, signer, network info,
// connect/disconnect functions, and automatic network switching.
//
// RPC resilience: iterates AMOY_RPC_URLS in order and uses the first
// endpoint that responds. This avoids the ethers.js v6 FallbackProvider
// quorum issue when only one node responds in time.

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { AMOY_CHAIN_ID, AMOY_RPC_URLS, BLOCK_EXPLORER_URL } from "../config/network";

// Tries each RPC endpoint in order and returns the first JsonRpcProvider
// that responds to a getBlockNumber() call. Throws if all fail.
const buildProvider = async () => {
    for (const url of AMOY_RPC_URLS) {
        try {
            const p = new ethers.JsonRpcProvider(url);
            await p.getBlockNumber();
            return p;
        } catch {
            continue;
        }
    }
    throw new Error("All RPC endpoints unavailable");
};

export const useWallet = () => {
    const [account, setAccount] = useState(null);      // Connected wallet address
    const [provider, setProvider] = useState(null);    // ethers.js JsonRpcProvider
    const [signer, setSigner] = useState(null);        // Signer for sending transactions
    const [chainId, setChainId] = useState(null);      // Current network chain ID
    const [loading, setLoading] = useState(false);     // Loading state during connection
    const [error, setError] = useState(null);          // Error messages

    // Requests wallet access and initialises the provider and signer.
    // The provider used for read-only contract calls is a JsonRpcProvider
    // selected from AMOY_RPC_URLS by trying each one in order.
    // The BrowserProvider (window.ethereum) is only used to obtain the signer.
    const connect = async () => {
        if (!window.ethereum) {
            setError("MetaMask not found. Please install it.");
            return;
        }
        try {
            setLoading(true);
            setError(null);

            // BrowserProvider wraps window.ethereum — used only for signing
            const browserProvider = new ethers.BrowserProvider(window.ethereum);

            // Triggers the MetaMask popup asking the user to connect
            const accounts = await browserProvider.send("eth_requestAccounts", []);

            // Signer is needed to sign and send transactions
            const _signer = await browserProvider.getSigner();

            // Detect which network the user is currently on
            const network = await browserProvider.getNetwork();

            // Select the first available RPC endpoint for read-only calls
            const rpcProvider = await buildProvider();

            setProvider(rpcProvider);
            setSigner(_signer);
            setAccount(accounts[0]);
            setChainId("0x" + network.chainId.toString(16));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Clears all wallet state (does not disconnect MetaMask itself)
    const disconnect = () => {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setChainId(null);
    };

    // Asks MetaMask to switch to Polygon Amoy.
    // If the network is not yet added to MetaMask, it adds it automatically.
    // Multiple RPC URLs are passed so MetaMask can fall back if one fails.
    const switchToAmoy = async () => {
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: AMOY_CHAIN_ID }],
            });
        } catch (err) {
            // Error code 4902 means the chain is not added to MetaMask yet
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

    // True only when the user is connected to Polygon Amoy
    const isCorrectNetwork = chainId === AMOY_CHAIN_ID;

    // Listen for MetaMask events so the UI stays in sync
    // if the user changes account or network outside the app
    useEffect(() => {
        if (!window.ethereum) { return; }

        window.ethereum.on("accountsChanged", (accounts) => {
            if (accounts.length === 0) {
                disconnect(); // User disconnected in MetaMask
            } else {
                setAccount(accounts[0]); // User switched account
            }
        });

        window.ethereum.on("chainChanged", (newChainId) => {
            setChainId(newChainId); // Update network state on chain change
        });
    }, []);

    return {
        account,
        provider,
        signer,
        chainId,
        loading,
        error,
        connect,
        disconnect,
        switchToAmoy,
        isCorrectNetwork,
    };
};