// src/pages/CampaignPage.jsx
//
// Public page displaying the active campaign parameters.
// Accessible to all authenticated users.
// Allows users to verify the rules under which RCYC tokens are being issued,
// fulfilling the transparency principle of the hybrid dApp architecture.
// Sprint 8.5 will add the parameterHash and Polygonscan verification link
// once the contract is redeployed with on-chain parameter integrity.

import { useState, useEffect } from "react";
import { Loader, ExternalLink, Trophy, Scale, Coins } from "lucide-react";
import apiClient from "../services/apiClient";
import { useTranslation } from "react-i18next";

const DEFAULT_MULTIPLIERS = {
    plastic:  1.2,
    metal:    1.5,
    glass:    0.8,
    paper:    0.6,
    organic:  0.5,
};

const MATERIAL_ICONS = {
    plastic:  "🧴",
    metal:    "🥫",
    glass:    "🫙",
    paper:    "📄",
    organic:  "🌿",
};

const CampaignPage = () => {
    const { t } = useTranslation();

    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    useEffect(() => {
        const fetchActiveCampaign = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get("/campaigns/active");
                setCampaign(response.data);
            } catch (err) {
                if (err.response?.status === 404) {
                    setCampaign(null);
                } else {
                    setError("Error loading campaign");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchActiveCampaign();
    }, []);

    const daysRemaining = (endDate) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 gap-2 text-gray-400">
                <Loader size={20} className="animate-spin" />
            </div>
        );
    }

    if (error) {
        return <p className="text-red-400 text-center py-12">{error}</p>;
    }

    if (!campaign) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-16 text-center">
                <p className="text-gray-500 text-lg">{t("campaign.noCampaign")}</p>
            </div>
        );
    }

    const days = daysRemaining(campaign.endDate);

    const materials = ["plastic", "metal", "glass", "paper", "organic"];

    return (
        <div className="max-w-3xl mx-auto px-6 py-10">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-green-400 mb-1">
                    {campaign.name}
                </h1>
                {campaign.description && (
                    <p className="text-gray-400 mt-1">{campaign.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>
                        {t("campaign.ends")}: {new Date(campaign.endDate).toLocaleDateString()}
                    </span>
                    <span className="text-green-400 font-semibold">
                        {t("campaign.daysRemaining", { count: days })}
                    </span>
                </div>
            </div>

            {/* Prize pool */}
            {campaign.prizePoolEth && (
                <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-5 mb-6 flex items-center gap-4">
                    <Coins size={28} className="text-yellow-400 shrink-0" />
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">
                            {t("campaign.prizePool")}
                        </p>
                        <p className="text-2xl font-bold text-yellow-400">
                            {campaign.prizePoolEth} MATIC
                        </p>
                    </div>
                </div>
            )}

            {/* Material multipliers */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Scale size={18} className="text-green-400" />
                    {t("campaign.multipliers")}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {materials.map((mat) => {
                        const value = campaign[`multiplier${mat.charAt(0).toUpperCase() + mat.slice(1)}`];
                        const isSpecial = value !== DEFAULT_MULTIPLIERS[mat];
                        return (
                            <div
                                key={mat}
                                className={`rounded-xl p-3 text-center border ${
                                    isSpecial
                                        ? "border-yellow-600 bg-yellow-900/20"
                                        : "border-gray-700 bg-gray-800"
                                }`}
                            >
                                <div className="text-2xl mb-1">{MATERIAL_ICONS[mat]}</div>
                                <p className="text-xs text-gray-400 capitalize mb-1">
                                    {t(`campaign.material.${mat}`)}
                                </p>
                                <p className={`text-lg font-bold ${isSpecial ? "text-yellow-400" : "text-white"}`}>
                                    {value}×
                                </p>
                                {isSpecial && (
                                    <p className="text-yellow-500 text-xs mt-1">
                                        ⭐ {t("campaign.specialBadge")}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Milestone bonuses */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Trophy size={18} className="text-green-400" />
                    {t("campaign.milestones")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Event milestones */}
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                            {t("campaign.events")}
                        </p>
                        <div className="space-y-1">
                            {[1, 2, 3, 4].map((tier) => (
                                <div key={tier} className="flex justify-between text-sm">
                                    <span className="text-gray-400">
                                        ≥ {campaign[`milestoneEventsTier${tier}`]} events
                                    </span>
                                    <span className="text-green-400 font-semibold">
                                        {campaign[`milestoneEventsBonusTier${tier}`]}×
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Weight milestones */}
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                            {t("campaign.weight")}
                        </p>
                        <div className="space-y-1">
                            {[1, 2, 3, 4].map((tier) => (
                                <div key={tier} className="flex justify-between text-sm">
                                    <span className="text-gray-400">
                                        ≥ {campaign[`milestoneWeightTier${tier}`]} kg
                                    </span>
                                    <span className="text-green-400 font-semibold">
                                        {campaign[`milestoneWeightBonusTier${tier}`]}×
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* On-chain verification — Sprint 8.5 */}
            {campaign.parameterHash && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                        {t("campaign.parameterHash")}
                    </p>
                    <p className="font-mono text-xs text-gray-400 break-all mb-3">
                        {campaign.parameterHash}
                    </p>
                    <a>
                        href={`https://amoy.polygonscan.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-green-400 hover:text-green-300 text-sm"
                        <ExternalLink size={14} />
                        {t("campaign.verifyOnChain")}
                    </a>
                </div>
            )}
        </div>
    );
};

export default CampaignPage;