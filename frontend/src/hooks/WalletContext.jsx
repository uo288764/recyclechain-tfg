// src/hooks/WalletContext.jsx
//
// React Context that makes wallet state available to any component
// in the tree without passing props manually at every level.
// This pattern is recommended for global state such as authentication
// or, in a dApp, wallet connection (Meta Open Source, 2024).

import { createContext, useContext } from "react";
import { useWallet } from "./useWallet";

// Create the context with a null default value
export const WalletContext = createContext(null);

// Provider component — wraps the app and exposes wallet state
export const WalletProvider = ({ children }) => {
  // All wallet logic lives in the useWallet hook
  const wallet = useWallet();

  return (
    <WalletContext.Provider value={wallet}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to consume the wallet context from any component
// Usage: const { account, connect } = useWalletContext();
export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used inside WalletProvider");
  }
  return context;
};