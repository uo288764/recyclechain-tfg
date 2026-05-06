// src/components/Dashboard.jsx
//
// Main user dashboard. Combines on-chain data (token balance via ethers.js)
// with off-chain data (stats, history, tiers) from the Spring Boot backend.

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWalletContext } from "../hooks/WalletContext";
import { useAuthContext } from "../hooks/AuthContext";
import { getContract } from "../utils/contract";
import { recyclingService } from "../services/recyclingService";
import { Scale, Coins, Wallet, Calendar, Trophy, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
    const { account, provider, isCorrectNetwork } = useWalletContext();
    const { user } = useAuthContext();
    const { t } = useTranslation();

    const [chainStats, setChainStats] = useState({
        balance: 0,
        totalKg: 0,
        totalRewards: 0,
        lastTime: null,
    });

    const [backendStats, setBackendStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingChain, setLoadingChain] = useState(false);
    const [loadingBackend, setLoadingBackend] = useState(false);
    const [error, setError] = useState(null);

    const fetchChainStats = async () => {
        if (!account || !provider || !isCorrectNetwork) { return; }

        try {
            setLoadingChain(true);
            const contract = getContract(provider);
            const result = await contract.getUserStats(account);

            setChainStats({
                totalKg: Number(result[0]),
                totalRewards: parseFloat(ethers.formatUnits(result[1], 18)).toFixed(2),
                lastTime: Number(result[2]) > 0
                    ? new Date(Number(result[2]) * 1000).toLocaleDateString()
                    : t("dashboard.never"),
                balance: parseFloat(ethers.formatUnits(result[3], 18)).toFixed(2),
            });
        } catch (err) {
            setError("Error reading from contract: " + err.message);
        } finally {
            setLoadingChain(false);
        }
    };

    const fetchBackendData = async () => {
        try {
            setLoadingBackend(true);
            const [stats, historyData] = await Promise.all([
                recyclingService.getStats(),
                recyclingService.getHistory(),
            ]);
            setBackendStats(stats);
            setHistory(historyData);
        } catch (err) {
            setError("Error fetching backend data: " + err.message);
        } finally {
            setLoadingBackend(false);
        }
    };

    const handleRefresh = () => {
        fetchChainStats();
        fetchBackendData();
    };

    useEffect(() => {
        fetchBackendData();
    }, []);

    // provider is included so the effect re-runs when it becomes available,
    // preventing a race condition where account is set before provider is ready.
    useEffect(() => {
        fetchChainStats();
    }, [account, provider, isCorrectNetwork]);

    const loading = loadingChain || loadingBackend;

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">

            <h1 className="text-3xl font-bold text-green-400 mb-1">
                {t("dashboard.welcomeBack")}, {user?.name}
            </h1>
            {account && (
                <p className="text-gray-500 text-sm font-mono mb-8">{account}</p>
            )}

            {loading && (
                <p className="text-gray-400 text-sm mb-4">{t("dashboard.loadingData")}</p>
            )}
            {error && (
                <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            {/* Main stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <StatCard
                    icon={<Scale size={28} />}
                    label={t("dashboard.totalRecycled")}
                    value={`${backendStats?.totalKg ?? chainStats.totalKg} kg`}
                    color="green"
                />
                <StatCard
                    icon={<Coins size={28} />}
                    label={t("dashboard.rctEarned")}
                    value={`${backendStats?.totalTokensEarned ?? chainStats.totalRewards} RCT`}
                    color="yellow"
                />
                <StatCard
                    icon={<Wallet size={28} />}
                    label={t("dashboard.walletBalance")}
                    value={account ? `${chainStats.balance} RCT` : "—"}
                    color="blue"
                />
                <StatCard
                    icon={<Calendar size={28} />}
                    label={t("dashboard.totalEvents")}
                    value={backendStats?.totalEvents ?? "—"}
                    color="purple"
                />
                <StatCard
                    icon={<Zap size={28} />}
                    label={t("dashboard.eventBonus")}
                    value={backendStats ? `x${backendStats.eventMultiplier}` : "—"}
                    color="yellow"
                />
                <StatCard
                    icon={<Trophy size={28} />}
                    label={t("dashboard.eventTier")}
                    value={backendStats?.eventTier ?? "—"}
                    color="green"
                />
            </div>

            {/* Recycling history table */}
            {history.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-300 mb-3">
                        {t("dashboard.recyclingHistory")}
                    </h2>
                    <div className="overflow-x-auto rounded-xl border border-gray-800">
                        <table className="w-full text-sm text-gray-300">
                            <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 text-left">{t("dashboard.station")}</th>
                                    <th className="px-4 py-3 text-left">{t("dashboard.material")}</th>
                                    <th className="px-4 py-3 text-left">{t("dashboard.weight")}</th>
                                    <th className="px-4 py-3 text-left">{t("dashboard.tokens")}</th>
                                    <th className="px-4 py-3 text-left">{t("dashboard.date")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((event, index) => (
                                    <tr
                                        key={event.id}
                                        className={index % 2 === 0 ? "bg-gray-900" : "bg-gray-950"}
                                    >
                                        <td className="px-4 py-3">{event.stationName}</td>
                                        <td className="px-4 py-3 capitalize">{event.materialType}</td>
                                        <td className="px-4 py-3">{event.weight} kg</td>
                                        <td className="px-4 py-3 text-yellow-400">{event.tokensEarned} RCT</td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {new Date(event.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {history.length === 0 && !loading && (
                <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl text-gray-600">
                    {t("dashboard.noEvents")}
                </div>
            )}

            <button
                onClick={handleRefresh}
                className="bg-green-700 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
                ↻ {t("dashboard.refresh")}
            </button>
        </div>
    );
};

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
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">{label}</div>
            <div className="text-xl font-bold">{value}</div>
        </div>
    );
};

export default Dashboard;