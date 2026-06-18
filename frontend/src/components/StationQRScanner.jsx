// src/components/StationQRScanner.jsx
//
// Step 2 of the dual QR flow: scans the station HMAC QR to confirm
// physical deposit of a previously scanned container.
// Calls POST /api/recycling/record with containerId and qrPayload.

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { recyclingService } from "../services/recyclingService";
import { useTranslation } from "react-i18next";

/**
 * StationQRScanner
 *
 * Props:
 *   containerId — ID of the container being deposited (from MyContainersPage)
 *   onSuccess   — callback invoked with the RecyclingEventResponse on success
 *   onClose     — callback invoked when the user dismisses the scanner
 */
const StationQRScanner = ({ containerId, onSuccess, onClose }) => {
    const { t } = useTranslation();

    const [scanning, setScanning]     = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState(null);

    /**
     * Called by the scanner when a QR code is decoded.
     * Extracts stationId from the HMAC payload and submits the deposit.
     * Format: {stationId}:{timestampWindow}:{hmac}
     */
    const handleScan = async (results) => {
        if (!results || results.length === 0 || !scanning) { return; }

        const qrPayload = results[0].rawValue;
        const parts = qrPayload.split(":");

        if (parts.length !== 3) {
            setError(t("stationScanner.invalidPayload"));
            return;
        }

        const stationId = parseInt(parts[0], 10);
        if (isNaN(stationId)) {
            setError(t("stationScanner.invalidPayload"));
            return;
        }

        setScanning(false);
        setSubmitting(true);
        setError(null);

        try {
            const response = await recyclingService.recordEvent({
                stationId,
                containerId,
                qrPayload,
            });
            onSuccess(response);
        } catch (err) {
            const status = err.response?.status;
            if (status === 409) {
                setError(t("stationScanner.noCampaign"));
            } else if (status === 422) {
                setError(t("stationScanner.invalidQR"));
            } else {
                setError(t("stationScanner.error"));
            }
            setScanning(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleError = (err) => {
        console.error("QR scanner error:", err);
        setError(t("stationScanner.cameraError"));
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md p-6">

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-green-400">
                        {t("stationScanner.title")}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-300 text-xl font-bold"
                    >
                        ✕
                    </button>
                </div>

                <p className="text-gray-400 text-sm mb-4">
                    {t("stationScanner.instructions")}
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
                        {t("stationScanner.submitting")}
                    </div>
                )}

                {error && (
                    <div className="text-red-400 text-sm mt-3">{error}</div>
                )}
            </div>
        </div>
    );
};

export default StationQRScanner;