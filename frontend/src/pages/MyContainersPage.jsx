// src/pages/MyContainersPage.jsx
//
// Displays the authenticated user's containers in SCANNED state —
// containers that have been registered but not yet physically deposited.
// From here the user triggers Step 2 of the dual QR flow by scanning
// the station QR to confirm deposit and earn RCYC tokens.

import { useState, useEffect } from "react";
import { Loader, PackageCheck, QrCode } from "lucide-react";
import { containerService } from "../services/containerService";
import StationQRScanner from "../components/StationQRScanner";
import { useTranslation } from "react-i18next";

const MyContainersPage = () => {
    const { t } = useTranslation();

    const [containers, setContainers]         = useState([]);
    const [loading, setLoading]               = useState(true);
    const [error, setError]                   = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [depositingId, setDepositingId]     = useState(null);

    const fetchContainers = async () => {
        try {
            setLoading(true);
            const data = await containerService.getPendingContainers();
            setContainers(data);
        } catch (err) {
            setError(t("myContainers.errorLoad"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContainers();
    }, []);

    const handleDepositSuccess = (eventResponse) => {
        setDepositingId(null);
        setSuccessMessage(
            t("myContainers.depositSuccess", { tokens: eventResponse.tokensEarned })
        );
        fetchContainers();
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    const MATERIAL_ICONS = {
        plastic:  "🧴",
        metal:    "🥫",
        glass:    "🫙",
        paper:    "📄",
        organic:  "🌿",
    };

    return (
        <div className="max-w-3xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold text-green-400 mb-2">
                {t("myContainers.title")}
            </h1>

            {successMessage && (
                <div className="bg-green-900/30 border border-green-700 text-green-400 text-sm rounded-lg px-4 py-3 mb-6">
                    {successMessage}
                </div>
            )}

            {error && (
                <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            {loading ? (
                <div className="flex items-center gap-2 text-gray-400 py-12">
                    <Loader size={18} className="animate-spin" />
                </div>
            ) : containers.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-800 rounded-xl text-gray-600">
                    <PackageCheck size={40} className="mx-auto mb-3 opacity-30" />
                    <p>{t("myContainers.empty")}</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {containers.map((container) => (
                        <div
                            key={container.id}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-3xl">
                                    {MATERIAL_ICONS[container.materialType] ?? "♻️"}
                                </span>
                                <div>
                                    <p className="text-white font-semibold">{container.brand}</p>
                                    <p className="text-gray-400 text-sm capitalize">
                                        {container.materialType} · {container.unitWeightKg} kg
                                    </p>
                                    <p className="text-gray-600 text-xs mt-0.5">
                                        {t("myContainers.campaign")}: {container.campaignName}
                                    </p>
                                    <p className="text-gray-600 text-xs">
                                        {t("myContainers.scannedAt")}:{" "}
                                        {new Date(container.scannedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setDepositingId(container.id)}
                                className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                            >
                                <QrCode size={16} />
                                {t("myContainers.depositButton")}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {depositingId !== null && (
                <StationQRScanner
                    containerId={depositingId}
                    onSuccess={handleDepositSuccess}
                    onClose={() => setDepositingId(null)}
                />
            )}
        </div>
    );
};

export default MyContainersPage;