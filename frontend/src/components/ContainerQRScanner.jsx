// src/components/ContainerQRScanner.jsx
//
// Step 1 of the dual QR flow: scans the UUID printed on a physical container.
// Calls POST /api/containers/scan to register the container to the user account.
// Once registered, the container appears in MyContainersPage as pending deposit.

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { containerService } from "../services/containerService";
import { useTranslation } from "react-i18next";

/**
 * ContainerQRScanner
 *
 * Props:
 *   onSuccess — callback invoked with the ContainerResponse on successful scan
 *   onClose   — callback invoked when the user dismisses the scanner
 */
const ContainerQRScanner = ({ onSuccess, onClose }) => {
    const { t } = useTranslation();

    const [scanning, setScanning]     = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState(null);

    /**
     * Called by the scanner when a QR code is decoded.
     * The UUID is sent directly to the backend — no user input required.
     * Weight and material are resolved server-side from the ContainerBatch.
     */
    const handleScan = async (results) => {
        if (!results || results.length === 0 || !scanning) { return; }

        const uuid = results[0].rawValue;
        setScanning(false);
        setSubmitting(true);
        setError(null);

        try {
            const container = await containerService.scanContainer(uuid);
            onSuccess(container);
        } catch (err) {
            const status = err.response?.status;
            if (status === 404) {
                setError(t("containerScanner.notFound"));
            } else if (status === 409) {
                setError(t("containerScanner.alreadyScanned"));
            } else {
                setError(t("containerScanner.error"));
            }
            setScanning(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleError = (err) => {
        console.error("QR scanner error:", err);
        setError(t("containerScanner.cameraError"));
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md p-6">

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-green-400">
                        {t("containerScanner.title")}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-300 text-xl font-bold"
                    >
                        ✕
                    </button>
                </div>

                <p className="text-gray-400 text-sm mb-4">
                    {t("containerScanner.instructions")}
                </p>

                {scanning && (
                    <div className="rounded-xl overflow-hidden mb-4">
                        <Scanner
                            onScan={handleScan}
                            onError={handleError}
                            constraints={{ facingMode: "environment" }}
                            styles={{ container: { width: "100%" } }}
                        />
                    </div>
                )}

                {submitting && (
                    <div className="text-center text-gray-400 text-sm py-4">
                        {t("containerScanner.registering")}
                    </div>
                )}

                {error && (
                    <div className="text-red-400 text-sm mt-3">{error}</div>
                )}
            </div>
        </div>
    );
};

export default ContainerQRScanner;