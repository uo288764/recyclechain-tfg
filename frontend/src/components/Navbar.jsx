// src/components/Navbar.jsx
// Top navigation bar. Displays wallet connection status,
// network indicator, and connect/disconnect controls.

import { Recycle, LogOut, TriangleAlert, Wifi, Wallet } from "lucide-react";
import { useWalletContext } from "../hooks/WalletContext";

// Shortens a wallet address for display: 0x1234...5678
const shortenAddress = (address) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

const Navbar = () => {
  const {
    account,
    connect,
    disconnect,
    loading,
    error,
    isCorrectNetwork,
    switchToAmoy,
  } = useWalletContext();

  return (
    <nav className="bg-gray-900 border-b border-green-800 px-6 py-4 flex items-center justify-between">

      {/* App title */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">♻</span>
        <span className="text-green-400 font-bold text-xl tracking-tight">
          RecycleChain
        </span>
      </div>

      <div className="flex items-center gap-3">

        {/* Show error if MetaMask not found */}
        {error && (
          <span className="text-red-400 text-sm">{error}</span>
        )}

        {account ? (
          <>
            {/* Wrong network warning */}
            {!isCorrectNetwork && (
              <button
                onClick={switchToAmoy}
                className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-semibold px-3 py-1.5 rounded-lg"
              >
                <TriangleAlert size={16} /> Switch to Amoy
              </button>
            )}

            {/* Network badge — only shown when on correct network */}
            {isCorrectNetwork && (
              <span className="flex items-center gap-1 bg-green-900 text-green-400 text-xs font-mono px-2 py-1 rounded">
                <Wifi size={12} /> Polygon Amoy
              </span>
            )}

            {/* Wallet address + disconnect */}
            <span className="text-gray-300 text-sm font-mono bg-gray-800 px-3 py-1.5 rounded-lg">
              {shortenAddress(account)}
            </span>
            <button
              onClick={disconnect}
              className="flex items-center gap-1 text-gray-400 hover:text-red-400 text-sm transition-colors"
            >
              <LogOut size={16} /> Disconnect
            </button>
          </>
        ) : (
          // Connect button — shown when no wallet is connected
          <button
            onClick={connect}
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Wallet size={16} />
            {loading ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;