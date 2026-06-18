// src/pages/AdminPage.jsx
//
// Administration panel. Manages stations, campaigns and container batches.
// Only accessible to users with ROLE_ADMIN — protected at route level.
//
// Sprint 8: added campaign lifecycle management (DRAFT→ACTIVE→CLOSED)
// and container batch creation with UUID generation for QR printing.

import { useState, useEffect } from "react";
import {
    Loader, Plus, X, CheckCircle, XCircle,
    Recycle, Weight, Coins, Users, MapPin,
    ChevronDown, ChevronUp, Package
} from "lucide-react";
import { adminService } from "../services/adminService";
import { useTranslation } from "react-i18next";


// Main page

const AdminPage = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("stations");

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold text-green-400 mb-6">
                {t("admin.title")}
            </h1>

            {/* Tab navigation */}
            <div className="flex gap-2 mb-8 border-b border-gray-800 pb-0">
                {["stations", "campaigns"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                            activeTab === tab
                                ? "bg-gray-900 text-green-400 border border-b-0 border-gray-800"
                                : "text-gray-500 hover:text-white"
                        }`}
                    >
                        {tab === "stations"
                            ? t("admin.stations.title")
                            : t("admin.campaigns.title")}
                    </button>
                ))}
            </div>

            {activeTab === "stations" && <StationsTab t={t} />}
            {activeTab === "campaigns" && <CampaignsTab t={t} />}
        </div>
    );
};


// Stations tab

const StationsTab = ({ t }) => {
    const [stations, setStations]           = useState([]);
    const [stats, setStats]                 = useState(null);
    const [loadingStations, setLoadingStations] = useState(true);
    const [loadingStats, setLoadingStats]   = useState(true);
    const [error, setError]                 = useState(null);
    const [showForm, setShowForm]           = useState(false);

    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            setStats(await adminService.getGlobalStats());
        } catch {
            setError(t("admin.stats.errorLoad"));
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchStations = async () => {
        try {
            setLoadingStations(true);
            setStations(await adminService.getAllStations());
        } catch {
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
        } catch {
            setError(t("admin.stations.errorToggle"));
        }
    };

    return (
        <>
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
                        onCreated={async () => {
                            setShowForm(false);
                            await fetchStations();
                            await fetchStats();
                        }}
                        onCancel={() => setShowForm(false)}
                        t={t}
                    />
                )}

                {error && <div className="text-red-400 text-sm mb-4">{error}</div>}

                {loadingStations ? (
                    <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
                        <Loader size={18} className="animate-spin" />
                    </div>
                ) : (
                    <StationsTable stations={stations} onToggle={handleToggle} t={t} />
                )}
            </div>
        </>
    );
};


// Campaigns tab

const CampaignsTab = ({ t }) => {
    const [campaigns, setCampaigns]     = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [showForm, setShowForm]       = useState(false);
    const [expandedId, setExpandedId]   = useState(null);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            setCampaigns(await adminService.getAllCampaigns());
        } catch {
            setError(t("admin.campaigns.errorLoad"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleActivate = async (id) => {
        if (!window.confirm(t("admin.campaigns.confirmActivate"))) { return; }
        try {
            await adminService.activateCampaign(id);
            await fetchCampaigns();
        } catch (err) {
            const msg = err.response?.data?.message ?? t("admin.campaigns.errorActivate");
            setError(msg);
        }
    };

    const handleClose = async (id) => {
        if (!window.confirm(t("admin.campaigns.confirmClose"))) { return; }
        try {
            await adminService.closeCampaign(id);
            await fetchCampaigns();
        } catch (err) {
            setError(t("admin.campaigns.errorClose"));
        }
    };

    const STATUS_COLORS = {
        DRAFT:  "bg-gray-700 text-gray-300",
        ACTIVE: "bg-green-900/50 text-green-400",
        CLOSED: "bg-red-900/30 text-red-400",
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">
                    {t("admin.campaigns.title")}
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                    {showForm ? t("admin.campaigns.cancel") : t("admin.campaigns.new")}
                </button>
            </div>

            {showForm && (
                <CreateCampaignForm
                    onCreated={async () => {
                        setShowForm(false);
                        await fetchCampaigns();
                    }}
                    onCancel={() => setShowForm(false)}
                    t={t}
                />
            )}

            {error && <div className="text-red-400 text-sm">{error}</div>}

            {loading ? (
                <div className="flex items-center gap-2 text-gray-400 py-8">
                    <Loader size={18} className="animate-spin" />
                </div>
            ) : campaigns.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl text-gray-600">
                    No campaigns yet.
                </div>
            ) : (
                campaigns.map((campaign) => (
                    <div
                        key={campaign.id}
                        className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
                    >
                        {/* Campaign header row */}
                        <div className="flex items-center justify-between px-5 py-4">
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[campaign.status]}`}>
                                    {t(`admin.campaigns.${campaign.status.toLowerCase()}`)}
                                </span>
                                <div>
                                    <p className="text-white font-semibold">{campaign.name}</p>
                                    <p className="text-gray-500 text-xs">
                                        {campaign.startDate} → {campaign.endDate}
                                        {campaign.prizePoolEth && (
                                            <span className="text-yellow-500 ml-2">
                                                · {campaign.prizePoolEth} MATIC
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {campaign.status === "DRAFT" && (
                                    <button
                                        onClick={() => handleActivate(campaign.id)}
                                        className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors"
                                    >
                                        {t("admin.campaigns.activate")}
                                    </button>
                                )}
                                {campaign.status === "ACTIVE" && (
                                    <button
                                        onClick={() => handleClose(campaign.id)}
                                        className="px-3 py-1.5 bg-red-900/50 hover:bg-red-900 text-red-400 text-xs font-medium rounded-lg transition-colors"
                                    >
                                        {t("admin.campaigns.close")}
                                    </button>
                                )}
                                <button
                                    onClick={() => setExpandedId(
                                        expandedId === campaign.id ? null : campaign.id
                                    )}
                                    className="text-gray-500 hover:text-white transition-colors"
                                >
                                    {expandedId === campaign.id
                                        ? <ChevronUp size={18} />
                                        : <ChevronDown size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Expanded: multipliers + batches */}
                        {expandedId === campaign.id && (
                            <div className="border-t border-gray-800 px-5 py-4 space-y-4">
                                {/* Material multipliers */}
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                                        {t("admin.campaigns.multipliers")}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {["plastic", "metal", "glass", "paper", "organic"].map((mat) => {
                                            const key = `multiplier${mat.charAt(0).toUpperCase() + mat.slice(1)}`;
                                            return (
                                                <span
                                                    key={mat}
                                                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-xs text-gray-300"
                                                >
                                                    {mat} · <span className="text-green-400">{campaign[key]}×</span>
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Container batches */}
                                <BatchesSection campaignId={campaign.id} t={t} />
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};


// Batches section (inside expanded campaign)


const BatchesSection = ({ campaignId, t }) => {
    const [batches, setBatches]     = useState([]);
    const [loading, setLoading]     = useState(true);
    const [showForm, setShowForm]   = useState(false);
    const [error, setError]         = useState(null);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            setBatches(await adminService.getBatchesByCampaign(campaignId));
        } catch {
            setError(t("admin.batches.errorLoad"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, [campaignId]);

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 uppercase tracking-widest">
                    {t("admin.batches.title")}
                </p>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
                >
                    {showForm ? <X size={12} /> : <Plus size={12} />}
                    {showForm ? t("admin.batches.cancel") : t("admin.batches.new")}
                </button>
            </div>

            {showForm && (
                <CreateBatchForm
                    campaignId={campaignId}
                    onCreated={async () => {
                        setShowForm(false);
                        await fetchBatches();
                    }}
                    onCancel={() => setShowForm(false)}
                    t={t}
                />
            )}

            {error && <p className="text-red-400 text-xs">{error}</p>}

            {loading ? (
                <Loader size={14} className="animate-spin text-gray-500" />
            ) : batches.length === 0 ? (
                <p className="text-gray-600 text-xs">No batches yet.</p>
            ) : (
                <div className="space-y-2">
                    {batches.map((batch) => (
                        <div
                            key={batch.id}
                            className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2"
                        >
                            <div className="flex items-center gap-3">
                                <Package size={14} className="text-gray-500" />
                                <div>
                                    <p className="text-white text-sm">{batch.brand}</p>
                                    <p className="text-gray-500 text-xs">
                                        {batch.materialType} · {batch.unitWeightKg} kg · {batch.unitCount} units
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    const uuids = await adminService.getBatchUuids(batch.id);
                                    const blob = new Blob([uuids.join("\n")], { type: "text/plain" });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = `batch-${batch.id}-uuids.txt`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                                className="text-xs text-green-400 hover:text-green-300 transition-colors"
                            >
                                {t("admin.batches.viewUuids")}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// Forms - campagin creation

const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-600";
const labelClass = "block text-gray-400 text-xs mb-1";

const CreateCampaignForm = ({ onCreated, onCancel, t }) => {
    const [form, setForm] = useState({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        prizePoolEth: "",
        multiplierPlastic: 1.2,
        multiplierMetal: 1.5,
        multiplierGlass: 0.8,
        multiplierPaper: 0.6,
        multiplierOrganic: 0.5,
        milestoneEventsTier1: 5,
        milestoneEventsTier2: 12,
        milestoneEventsTier3: 25,
        milestoneEventsTier4: 50,
        milestoneEventsBonusTier1: 1.1,
        milestoneEventsBonusTier2: 1.2,
        milestoneEventsBonusTier3: 1.35,
        milestoneEventsBonusTier4: 1.5,
        milestoneWeightTier1: 5.0,
        milestoneWeightTier2: 15.0,
        milestoneWeightTier3: 35.0,
        milestoneWeightTier4: 75.0,
        milestoneWeightBonusTier1: 1.05,
        milestoneWeightBonusTier2: 1.1,
        milestoneWeightBonusTier3: 1.15,
        milestoneWeightBonusTier4: 1.25,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState(null);

    const handleChange = (e) => {
        const value = e.target.type === "number"
            ? parseFloat(e.target.value)
            : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setError(null);
            await adminService.createCampaign({
                ...form,
                prizePoolEth: form.prizePoolEth ? parseFloat(form.prizePoolEth) : null,
            });
            onCreated();
        } catch {
            setError(t("admin.campaigns.errorCreate"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="sm:col-span-2">
                    <label className={labelClass}>{t("admin.campaigns.name")}</label>
                    <input name="name" value={form.name} onChange={handleChange} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                    <label className={labelClass}>{t("admin.campaigns.description")}</label>
                    <input name="description" value={form.description} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>{t("admin.campaigns.startDate")}</label>
                    <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>{t("admin.campaigns.endDate")}</label>
                    <input name="endDate" type="date" value={form.endDate} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>{t("admin.campaigns.prizePool")}</label>
                    <input name="prizePoolEth" type="number" step="0.01" value={form.prizePoolEth} onChange={handleChange} className={inputClass} />
                </div>
            </div>

            {/* Material multipliers */}
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                {t("admin.campaigns.multipliers")}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                {["plastic", "metal", "glass", "paper", "organic"].map((mat) => {
                    const key = `multiplier${mat.charAt(0).toUpperCase() + mat.slice(1)}`;
                    return (
                        <div key={mat}>
                            <label className={labelClass}>{mat}</label>
                            <input
                                name={key}
                                type="number"
                                step="0.1"
                                value={form[key]}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>
                    );
                })}
            </div>

            {error && <div className="text-red-400 text-sm mb-3">{error}</div>}

            <div className="flex gap-3">
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    {submitting && <Loader size={14} className="animate-spin" />}
                    {t("admin.campaigns.save")}
                </button>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    {t("admin.campaigns.cancel")}
                </button>
            </div>
        </div>
    );
};

const CreateBatchForm = ({ campaignId, onCreated, onCancel, t }) => {
    const [form, setForm] = useState({
        brand: "",
        materialType: "plastic",
        unitWeightKg: "",
        unitCount: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setError(null);
            await adminService.createBatch({
                brand: form.brand,
                materialType: form.materialType,
                unitWeightKg: parseFloat(form.unitWeightKg),
                unitCount: parseInt(form.unitCount, 10),
                campaignId,
            });
            onCreated();
        } catch {
            setError(t("admin.batches.errorCreate"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-3">
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label className={labelClass}>{t("admin.batches.brand")}</label>
                    <input name="brand" value={form.brand} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>{t("admin.batches.material")}</label>
                    <select name="materialType" value={form.materialType} onChange={handleChange} className={inputClass}>
                        {["plastic", "metal", "glass", "paper", "organic"].map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>{t("admin.batches.weight")}</label>
                    <input name="unitWeightKg" type="number" step="0.01" value={form.unitWeightKg} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>{t("admin.batches.units")}</label>
                    <input name="unitCount" type="number" min="1" value={form.unitCount} onChange={handleChange} className={inputClass} />
                </div>
            </div>

            {error && <p className="text-red-400 text-xs mb-2">{error}</p>}

            <div className="flex gap-2">
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                >
                    {submitting && <Loader size={12} className="animate-spin" />}
                    {t("admin.batches.create")}
                </button>
                <button
                    onClick={onCancel}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded-lg transition-colors"
                >
                    {t("admin.batches.cancel")}
                </button>
            </div>
        </div>
    );
};


//  sub-components (stations )

const GlobalStatsGrid = ({ stats, t }) => {
    const cards = [
        { label: t("admin.stats.totalEvents"), value: stats.totalEvents, icon: <Recycle size={20} />, color: "text-green-400", bg: "bg-green-900/20 border-green-900" },
        { label: t("admin.stats.totalWeightKg"), value: `${Number(stats.totalWeightKg).toFixed(2)} kg`, icon: <Weight size={20} />, color: "text-yellow-400", bg: "bg-yellow-900/20 border-yellow-900" },
        { label: t("admin.stats.totalTokens"), value: `${Number(stats.totalTokens).toFixed(2)} RCYC`, icon: <Coins size={20} />, color: "text-purple-400", bg: "bg-purple-900/20 border-purple-900" },
        { label: t("admin.stats.activeUsers"), value: stats.activeUsers, icon: <Users size={20} />, color: "text-blue-400", bg: "bg-blue-900/20 border-blue-900" },
        { label: t("admin.stats.activeStations"), value: `${stats.activeStations} / ${stats.totalStations}`, icon: <MapPin size={20} />, color: "text-orange-400", bg: "bg-orange-900/20 border-orange-900" },
    ];
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map((card) => (
                <div key={card.label} className={`border rounded-xl p-4 ${card.bg}`}>
                    <div className={`mb-2 ${card.color}`}>{card.icon}</div>
                    <p className="text-gray-400 text-xs mb-1">{card.label}</p>
                    <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                </div>
            ))}
        </div>
    );
};

const CreateStationForm = ({ onCreated, onCancel, t }) => {
    const [form, setForm] = useState({ name: "", address: "", latitude: "", longitude: "", walletAddress: "" });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setError(null);
            await adminService.createStation({
                name: form.name, address: form.address,
                latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude),
                walletAddress: form.walletAddress || null,
            });
            onCreated();
        } catch {
            setError(t("admin.stations.errorCreate"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div><label className={labelClass}>{t("admin.stations.name")}</label><input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="Punto Limpio Oviedo" /></div>
                <div><label className={labelClass}>{t("admin.stations.address")}</label><input name="address" value={form.address} onChange={handleChange} className={inputClass} placeholder="Calle Mayor, 1" /></div>
                <div><label className={labelClass}>{t("admin.stations.latitude")}</label><input name="latitude" value={form.latitude} onChange={handleChange} className={inputClass} placeholder="43.3614" type="number" step="any" /></div>
                <div><label className={labelClass}>{t("admin.stations.longitude")}</label><input name="longitude" value={form.longitude} onChange={handleChange} className={inputClass} placeholder="-5.8593" type="number" step="any" /></div>
                <div className="sm:col-span-2"><label className={labelClass}>{t("admin.stations.walletAddress")}</label><input name="walletAddress" value={form.walletAddress} onChange={handleChange} className={inputClass} placeholder="0x..." /></div>
            </div>
            {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
            <div className="flex gap-3">
                <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                    {submitting && <Loader size={14} className="animate-spin" />}
                    {t("admin.stations.create")}
                </button>
                <button onClick={onCancel} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors">{t("admin.stations.cancel")}</button>
            </div>
        </div>
    );
};

const StationsTable = ({ stations, onToggle, t }) => (
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
                    <StationRow key={station.id} station={station} onToggle={onToggle} t={t} />
                ))}
            </tbody>
        </table>
    </div>
);

const StationRow = ({ station, onToggle, t }) => {
    const [toggling, setToggling] = useState(false);
    const handleToggle = async () => {
        try { setToggling(true); await onToggle(station); } finally { setToggling(false); }
    };
    return (
        <tr className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
            <td className="py-3 pr-4 text-gray-500">{station.id}</td>
            <td className="py-3 pr-4 text-white font-medium">{station.name}</td>
            <td className="py-3 pr-4 text-gray-400">{station.address}</td>
            <td className="py-3 pr-4 text-gray-400 font-mono">{station.latitude}</td>
            <td className="py-3 pr-4 text-gray-400 font-mono">{station.longitude}</td>
            <td className="py-3 pr-4 text-gray-500 text-xs">{new Date(station.createdAt).toLocaleDateString()}</td>
            <td className="py-3">
                <button onClick={handleToggle} disabled={toggling} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${station.isActive ? "bg-red-900/40 hover:bg-red-900/70 text-red-400" : "bg-green-900/40 hover:bg-green-900/70 text-green-400"}`}>
                    {toggling ? <Loader size={12} className="animate-spin" /> : station.isActive ? <XCircle size={12} /> : <CheckCircle size={12} />}
                    {station.isActive ? t("admin.stations.deactivate") : t("admin.stations.activate")}
                </button>
            </td>
        </tr>
    );
};

export default AdminPage;