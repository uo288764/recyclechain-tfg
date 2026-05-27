// src/pages/AdminPage.jsx
//
// Administration panel for managing recycling stations.
// Only accessible to users with ROLE_ADMIN — protected at route level.

import { useState, useEffect } from "react";
import { Loader, Plus, X, CheckCircle, XCircle, Recycle, Weight, Coins, Users, MapPin } from "lucide-react";
import { adminService } from "../services/adminService";
import { useTranslation } from "react-i18next";

const AdminPage = () => {
    const [stations, setStations] = useState([]);
    const [stats, setStats] = useState(null);
    const [loadingStations, setLoadingStations] = useState(true);
    const [loadingStats, setLoadingStats] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const { t } = useTranslation();

    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            const data = await adminService.getGlobalStats();
            setStats(data);
        } catch (err) {
            setError(t("admin.stats.errorLoad"));
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchStations = async () => {
        try {
            setLoadingStations(true);
            const data = await adminService.getAllStations();
            setStations(data);
        } catch (err) {
            setError(t("admin.stations.errorLoad"));
        } finally {
            setLoadingStations(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchStations();
    }, []);

    const handleToggle = async (station) => {
        try {
            if (station.isActive) {
                await adminService.deactivateStation(station.id);
            } else {
                await adminService.activateStation(station.id);
            }
            await fetchStations();
            await fetchStats();
        } catch (err) {
            setError(t("admin.stations.errorToggle"));
        }
    };

    const handleCreated = async () => {
        setShowForm(false);
        await fetchStations();
        await fetchStats();
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold text-green-400 mb-8">
                {t("admin.title")}
            </h1>

            {/* Global stats section */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                    {t("admin.stats.title")}
                </h2>
                {loadingStats ? (
                    <div className="flex items-center gap-2 text-gray-400 py-4">
                        <Loader size={18} className="animate-spin" />
                    </div>
                ) : (
                    stats && <GlobalStatsGrid stats={stats} t={t} />
                )}
            </div>

            {/* Station management section */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">
                        {t("admin.stations.title")}
                    </h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        {showForm ? <X size={16} /> : <Plus size={16} />}
                        {showForm ? t("admin.stations.cancel") : t("admin.stations.new")}
                    </button>
                </div>

                {showForm && (
                    <CreateStationForm
                        onCreated={handleCreated}
                        onCancel={() => setShowForm(false)}
                        t={t}
                    />
                )}

                {error && (
                    <div className="text-red-400 text-sm mb-4">{error}</div>
                )}

                {loadingStations ? (
                    <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
                        <Loader size={18} className="animate-spin" />
                    </div>
                ) : (
                    <StationsTable
                        stations={stations}
                        onToggle={handleToggle}
                        t={t}
                    />
                )}
            </div>
        </div>
    );
};

const GlobalStatsGrid = ({ stats, t }) => {
    const cards = [
        {
            label: t("admin.stats.totalEvents"),
            value: stats.totalEvents,
            icon: <Recycle size={20} />,
            color: "text-green-400",
            bg: "bg-green-900/20 border-green-900",
        },
        {
            label: t("admin.stats.totalWeightKg"),
            value: `${Number(stats.totalWeightKg).toFixed(2)} kg`,
            icon: <Weight size={20} />,
            color: "text-yellow-400",
            bg: "bg-yellow-900/20 border-yellow-900",
        },
        {
            label: t("admin.stats.totalTokens"),
            value: `${Number(stats.totalTokens).toFixed(2)} RCYC`,
            icon: <Coins size={20} />,
            color: "text-purple-400",
            bg: "bg-purple-900/20 border-purple-900",
        },
        {
            label: t("admin.stats.activeUsers"),
            value: stats.activeUsers,
            icon: <Users size={20} />,
            color: "text-blue-400",
            bg: "bg-blue-900/20 border-blue-900",
        },
        {
            label: t("admin.stats.activeStations"),
            value: `${stats.activeStations} / ${stats.totalStations}`,
            icon: <MapPin size={20} />,
            color: "text-orange-400",
            bg: "bg-orange-900/20 border-orange-900",
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={`border rounded-xl p-4 ${card.bg}`}
                >
                    <div className={`mb-2 ${card.color}`}>{card.icon}</div>
                    <p className="text-gray-400 text-xs mb-1">{card.label}</p>
                    <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                </div>
            ))}
        </div>
    );
};

const CreateStationForm = ({ onCreated, onCancel, t }) => {
    const [form, setForm] = useState({
        name: "",
        address: "",
        latitude: "",
        longitude: "",
        walletAddress: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setError(null);
            await adminService.createStation({
                name: form.name,
                address: form.address,
                latitude: parseFloat(form.latitude),
                longitude: parseFloat(form.longitude),
                walletAddress: form.walletAddress || null,
            });
            onCreated();
        } catch (err) {
            setError(t("admin.stations.errorCreate"));
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-600";
    const labelClass = "block text-gray-400 text-xs mb-1";

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className={labelClass}>{t("admin.stations.name")}</label>
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Punto Limpio Oviedo"
                    />
                </div>
                <div>
                    <label className={labelClass}>{t("admin.stations.address")}</label>
                    <input
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Calle Mayor, 1, Oviedo"
                    />
                </div>
                <div>
                    <label className={labelClass}>{t("admin.stations.latitude")}</label>
                    <input
                        name="latitude"
                        value={form.latitude}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="43.3614"
                        type="number"
                        step="any"
                    />
                </div>
                <div>
                    <label className={labelClass}>{t("admin.stations.longitude")}</label>
                    <input
                        name="longitude"
                        value={form.longitude}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="-5.8593"
                        type="number"
                        step="any"
                    />
                </div>
                <div className="sm:col-span-2">
                    <label className={labelClass}>{t("admin.stations.walletAddress")}</label>
                    <input
                        name="walletAddress"
                        value={form.walletAddress}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="0x..."
                    />
                </div>
            </div>

            {error && (
                <div className="text-red-400 text-sm mb-3">{error}</div>
            )}

            <div className="flex gap-3">
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    {submitting && <Loader size={14} className="animate-spin" />}
                    {t("admin.stations.create")}
                </button>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    {t("admin.stations.cancel")}
                </button>
            </div>
        </div>
    );
};

const StationsTable = ({ stations, onToggle, t }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                        <th className="text-left pb-3 pr-4">ID</th>
                        <th className="text-left pb-3 pr-4">{t("admin.stations.name")}</th>
                        <th className="text-left pb-3 pr-4">{t("admin.stations.address")}</th>
                        <th className="text-left pb-3 pr-4">{t("admin.stations.latitude")}</th>
                        <th className="text-left pb-3 pr-4">{t("admin.stations.longitude")}</th>
                        <th className="text-left pb-3 pr-4">{t("admin.stations.created")}</th>
                        <th className="text-left pb-3"></th>
                    </tr>
                </thead>
                <tbody>
                    {stations.map((station) => (
                        <StationRow
                            key={station.id}
                            station={station}
                            onToggle={onToggle}
                            t={t}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const StationRow = ({ station, onToggle, t }) => {
    const [toggling, setToggling] = useState(false);

    const handleToggle = async () => {
        try {
            setToggling(true);
            await onToggle(station);
        } finally {
            setToggling(false);
        }
    };

    return (
        <tr className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
            <td className="py-3 pr-4 text-gray-500">{station.id}</td>
            <td className="py-3 pr-4 text-white font-medium">{station.name}</td>
            <td className="py-3 pr-4 text-gray-400">{station.address}</td>
            <td className="py-3 pr-4 text-gray-400 font-mono">{station.latitude}</td>
            <td className="py-3 pr-4 text-gray-400 font-mono">{station.longitude}</td>
            <td className="py-3 pr-4 text-gray-500 text-xs">
                {new Date(station.createdAt).toLocaleDateString()}
            </td>
            <td className="py-3">
                <button
                    onClick={handleToggle}
                    disabled={toggling}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                        station.isActive
                            ? "bg-red-900/40 hover:bg-red-900/70 text-red-400"
                            : "bg-green-900/40 hover:bg-green-900/70 text-green-400"
                    }`}
                >
                    {toggling ? (
                        <Loader size={12} className="animate-spin" />
                    ) : station.isActive ? (
                        <XCircle size={12} />
                    ) : (
                        <CheckCircle size={12} />
                    )}
                    {station.isActive
                        ? t("admin.stations.deactivate")
                        : t("admin.stations.activate")}
                </button>
            </td>
        </tr>
    );
};

export default AdminPage;