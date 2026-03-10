// src/components/Dashboard.jsx
//
// Main user dashboard. Reads recycling statistics directly from
// the RecyclingRewards smart contract using ethers.js view calls.
//
// Note: In a dApp, there is no backend — data is read
// directly from the blockchain state (Antonopoulos & Wood, 2018).
// View functions do not require gas as they do not modify state
// (Ethereum Foundation, 2024).

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWalletContext } from "../hooks/WalletContext";
import { getContract } from "../utils/contract";
import { Scale, Coins, Wallet, Calendar } from "lucide-react";

const Dashboard = () => {
    const { 
        account, 
        provider, 
        isCorrectNetwork
    } = useWalletContext();
    // State for the user's on-chain recycling statistics
    const [stats, setStats] = useState({
        totalKg: 0,
        totalRewards: 0,
        lastTime: null,
        balance: 0,
    });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user stats from the smart contract.
  // Called on mount and whenever the connected account changes.
  // Uses a read-only provider since we are only querying state,
  // not sending a transaction (Ricmoo, 2024).
  const fetchStats = async () => {
    if (!account || !provider || !isCorrectNetwork) return;

    try {
      setLoading(true);
      setError(null);

      // Instantiate the contract with a provider (read-only)
      const contract = getContract(provider);

      // getUserStats returns a tuple: [totalKg, totalRewards, lastTime, balance]
      const result = await contract.getUserStats(account);

      setStats({
        // Convert from BigInt to readable number
        totalKg: Number(result[0]),

        // Convert from wei (18 decimals) to RCT tokens using formatUnits
        // e.g. 50000000000000000000 → "50.0" (Ricmoo, 2024)
        totalRewards: parseFloat(ethers.formatUnits(result[1], 18)).toFixed(2),

        // Convert Unix timestamp to readable date
        // Returns 0 if user has never recycled
        lastTime: Number(result[2]) > 0
          ? new Date(Number(result[2]) * 1000).toLocaleDateString()
          : "Never",

        // Current RCT token balance
        balance: parseFloat(ethers.formatUnits(result[3], 18)).toFixed(2),
      });
    } catch (err) {
      setError("Error fetching stats from contract: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever the connected account changes (useEffect dependency array)
  // This ensures the dashboard always shows data for the current wallet
  // (Meta Open Source, 2024)
  useEffect(() => {
    fetchStats();
  }, [account, isCorrectNetwork]);

  // Guard: prompt user to connect wallet
  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="text-6xl mb-4">♻</span>
        <h2 className="text-2xl font-bold text-green-400 mb-2">
          Welcome to RecycleChain
        </h2>
        <p className="text-gray-400 max-w-md">
          Connect your MetaMask wallet to view your recycling stats
          and token rewards.
        </p>
      </div>
    );
  }

  // Guard: prompt user to switch network
  if (!isCorrectNetwork) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="text-5xl mb-4">⚠</span>
        <h2 className="text-xl font-bold text-yellow-400 mb-2">
          Wrong Network
        </h2>
        <p className="text-gray-400">
          Please switch to Polygon Amoy using the button in the navbar.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* Page title */}
      <h1 className="text-3xl font-bold text-green-400 mb-2">
        Your Recycling Dashboard
      </h1>
      <p className="text-gray-400 text-sm mb-8 font-mono">
        {account}
      </p>

      {loading && (
        <p className="text-gray-400 text-sm mb-4">Loading on-chain data...</p>
      )}

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {/* Stats grid — 4 cards showing key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          icon={<Scale size={28} />}
          label="Total Recycled"
          value={`${stats.totalKg} kg`}
          color="green"
        />
        <StatCard
          icon={<Coins size={28} />}
          label="RCT Earned"
          value={`${stats.totalRewards} RCT`}
          color="yellow"
        />
        <StatCard
          icon={<Wallet size={28} />}
          label="Current Balance"
          value={`${stats.balance} RCT`}
          color="blue"
        />
        <StatCard
          icon={<Calendar size={28} />}
          label="Last Recycling"
          value={stats.lastTime}
          color="purple"
        />
      </div>

      {/* Refresh button */}
      <button
        onClick={fetchStats}
        className="bg-green-700 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
      >
        ↻ Refresh Stats
      </button>
    </div>
  );
};

// Reusable stat card component
// Accepts icon, label, value and a colour variant
const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    green:  "border-green-700 bg-green-900/20 text-green-400",
    yellow: "border-yellow-700 bg-yellow-900/20 text-yellow-400",
    blue:   "border-blue-700 bg-blue-900/20 text-blue-400",
    purple: "border-purple-700 bg-purple-900/20 text-purple-400",
  };

  return (
    <div className={`border rounded-xl p-5 ${colors[color]}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">
        {label}
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
};

export default Dashboard;