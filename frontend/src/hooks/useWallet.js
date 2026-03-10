// src/hooks/useWallet.js
// Custom hook that manages MetaMask wallet interactions.
// Provides: account address, provider, signer, network info,
// connect/disconnect functions, and automatic network switching.

import { useState, useEffect } from "react";
import { ethers } from "ethers";

export const useWallet = () => {
  const [account, setAccount] = useState(null);      // Connected wallet address
  const [provider, setProvider] = useState(null);    // ethers.js BrowserProvider
  const [signer, setSigner] = useState(null);        // Signer for sending transactions
  const [chainId, setChainId] = useState(null);      // Current network chain ID
  const [loading, setLoading] = useState(false);     // Loading state during connection
  const [error, setError] = useState(null);          // Error messages

  // Polygon Amoy testnet chain ID in hexadecimal (80002 decimal)
  const AMOY_CHAIN_ID = "0x13882";

  // Requests wallet access and initialises the provider and signer
  const connect = async () => {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      setError("MetaMask not found. Please install it.");
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // BrowserProvider wraps window.ethereum into an ethers.js provider
      const _provider = new ethers.BrowserProvider(window.ethereum);

      // Triggers the MetaMask popup asking the user to connect
      const accounts = await _provider.send("eth_requestAccounts", []);

      // Signer is needed to sign and send transactions
      const _signer = await _provider.getSigner();

      // Detect which network the user is currently on
      const network = await _provider.getNetwork();

      setProvider(_provider);
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
          rpcUrls: ["https://rpc-amoy.polygon.technology"],
          blockExplorerUrls: ["https://amoy.polygonscan.com"],
        }],
      });
    }
  };

  // True only when the user is connected to Polygon Amoy
  const isCorrectNetwork = chainId === AMOY_CHAIN_ID;

  // Listen for MetaMask events so the UI stays in sync
  // if the user changes account or network outside the app
  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) disconnect(); // User disconnected in MetaMask
      else setAccount(accounts[0]);            // User switched account
    });

    window.ethereum.on("chainChanged", (chainId) => {
      setChainId(chainId); // Update network state on chain change
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