// src/components/Dashboard.jsx
//
// Main user dashboard. Combines on-chain data (token balance via ethers.js)
// with off-chain data (stats, history, tiers) from the Spring Boot backend.
//
// Sprint 8: QR scan button now opens ContainerQRScanner (Step 1 of dual QR flow).
// A compact active campaign banner is shown with a link to the full campaign page.
// QR scan button and campaign banner are hidden for ROLE_ADMIN users.

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import { useWalletContext } from "../hooks/WalletContext";
import { useAuthContext } from "../hooks/AuthContext";
import { getContract } from "../utils/contract";
import { recyclingService } from "../services/recyclingService";
import apiClient from "../services/apiClient";
import {
    Scale, Coins, Wallet, Calendar, Trophy, Zap,
    QrCode, Package, ChevronRight
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ContainerQRScanner from "./ContainerQRScanner";

const Dashboard = () => {
    const { account, provider, isCorrectNetwork } = useWalletContext();
    const { user } = useAuthContext();
    const { t } = useTranslation();

    const isAdmin = user?.role === "ROLE_ADMIN";

    const [chainStats, setChainStats] = useState({
        balance: 0,
        totalKg: 0,
        totalRewards: 0,
        lastTime: null,
    });

    const [backendStats, setBackendStats]         = useState(null);
    const [history, setHistory]                   = useState([]);
    const [activeCampaign, setActiveCampaign]     = useState(null);
    const [loadingChain, setLoadingChain]         = useState(false);
    const [loadingBackend, setLoadingBackend]     = useState(false);
    const [error, setError]                       = useState(null);
    const [showScanner, setShowScanner]           = useState(false);
    const [successMessage, setSuccessMessage]     = useState(null);

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

    const fetchActiveCampaign = async () => {
        try {
            const response = await apiClient.get("/campaigns/active");
            setActiveCampaign(response.data);
        } catch (err) {
            // 404 means no active campaign — not an error, just hide the banner
            setActiveCampaign(null);
        }
    };

    const handleRefresh = () => {
        fetchChainStats();
        fetchBackendData();
        fetchActiveCampaign();
    };

    /**
     * Called by ContainerQRScanner on successful container registration.
     * Shows a success message and redirects the user to MyContainersPage.
     */
    const handleContainerScanned = (container) => {
        setShowScanner(false);
        setSuccessMessage(
            `✓ ${container.brand} (${container.materialType}) registered. Go to My Containers to deposit it.`
        );
        setTimeout(() => setSuccessMessage(null), 6000);
    };

    useEffect(() => {
        fetchBackendData();
        fetchActiveCampaign();
    }, []);

    useEffect(() => {
        fetchChainStats();
    }, [account, provider, isCorrectNetwork]);

    const loading = loadingChain || loadingBackend;

    const daysRemaining = activeCampaign
        ? Math.max(0, Math.ceil(
            (new Date(activeCampaign.endDate) - new Date()) / (1000 * 60 * 60 * 24)
          ))
        : null;

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-green-400 mb-1">
                        {t("dashboard.welcomeBack")}, {user?.name}
                    </h1>
                    {account && (
                        <p className="text-gray-500 text-sm font-mono">{account}</p>
                    )}
                </div>

                {/* Action buttons — only for ROLE_USER */}
                {!isAdmin && (
                    <div className="flex gap-2">
                        <Link
                            to="/my-containers"
                            className="flex items-center gap-2 border border-gray-700 hover:border-green-600 text-gray-300 hover:text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                            <Package size={16} />
                            {t("dashboard.myContainers")}
                        </Link>
                        <button
                            onClick={() => setShowScanner(true)}
                            className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                            <QrCode size={16} />
                            {t("dashboard.scanContainer")}
                        </button>
                    </div>
                )}
            </div>

            {/* Active campaign banner */}
            {!isAdmin && activeCampaign && (
                <Link
                    to="/campaigns"
                    className="flex items-center justify-between bg-green-900/20 border border-green-800 rounded-xl px-5 py-4 mb-6 hover:border-green-600 transition-colors group"
                >
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">
                            {t("dashboard.activeCampaign")}
                        </p>
                        <p className="text-white font-semibold">{activeCampaign.name}</p>
                        <p className="text-green-400 text-sm">
                            {daysRemaining} {daysRemaining === 1
                                ? t("campaign.daysRemaining", { count: daysRemaining })
                                : t("campaign.daysRemaining_other", { count: daysRemaining })}
                            {activeCampaign.prizePoolEth && (
                                <span className="text-yellow-400 ml-2">
                                    · {activeCampaign.prizePoolEth} MATIC prize pool
                                </span>
                            )}
                        </p>
                    </div>
                    <ChevronRight
                        size={20}
                        className="text-gray-600 group-hover:text-green-400 transition-colors"
                    />
                </Link>
            )}

            {loading && (
                <p className="text-gray-400 text-sm mb-4">{t("dashboard.loadingData")}</p>
            )}
            {error && (
                <p className="text-red-400 text-sm mb-4">{error}</p>
            )}
            {successMessage && (
                <div className="bg-green-900/30 border border-green-700 text-green-400 text-sm rounded-lg px-4 py-3 mb-4">
                    {successMessage}
                </div>
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
                    value={`${backendStats?.totalTokensEarned ?? chainStats.totalRewards} RCYC`}
                    color="yellow"
                />
                <StatCard
                    icon={<Wallet size={28} />}
                    label={t("dashboard.walletBalance")}
                    value={account ? `${chainStats.balance} RCYC` : "—"}
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
                                        <td className="px-4 py-3 text-yellow-400">{event.tokensEarned} RCYC</td>
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

            {showScanner && !isAdmin && (
                <ContainerQRScanner
                    onSuccess={handleContainerScanned}
                    onClose={() => setShowScanner(false)}
                />
            )}
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