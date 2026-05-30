// src/components/QRScanner.jsx
//
// QR code scanner component using react-qr-reader.
// Reads the dynamic station QR code and submits a recycling event
// to the backend for HMAC-SHA256 validation (FR-05, FR-06, FR-21, FR-22).

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { recyclingService } from "../services/recyclingService";
import { useTranslation } from "react-i18next";

/**
 * QRScanner
 *
 * Renders a camera-based QR code reader. On a successful scan it submits
 * the recycling event to POST /api/recycling/record with the raw QR payload.
 * The backend validates the HMAC-SHA256 signature, the time window, and
 * single-use status before issuing RCYC tokens.
 *
 * Props:
 *   onSuccess — callback invoked with the RecyclingEventResponse on success
 *   onClose   — callback invoked when the user dismisses the scanner
 */
const QRScanner = ({ onSuccess, onClose }) => {
    const { t } = useTranslation();

    const [weight, setWeight]           = useState("");
    const [materialType, setMaterialType] = useState("plastic");
    const [scannedPayload, setScannedPayload] = useState(null);
    const [submitting, setSubmitting]   = useState(false);
    const [error, setError]             = useState(null);

    const MATERIAL_TYPES = ["plastic", "metal", "glass", "paper", "organic"];

    /**
     * Called by the scanner when a QR code is decoded.
     * Stores the raw payload — the user still needs to enter weight
     * and material type before submitting.
     */
    const handleScan = (results) => {
        if (results && results.length > 0 && !scannedPayload) {
            const raw = results[0].rawValue;
            setScannedPayload(raw);
            setError(null);
        }
    };

    const handleError = (err) => {
        console.error("QR scanner error:", err);
        setError(t("qrScanner.cameraError"));
    };

    /**
     * Submits the recycling event to the backend.
     * The qrPayload is sent as-is; validation happens entirely server-side.
     */
    const handleSubmit = async () => {
        if (!scannedPayload) {
            setError(t("qrScanner.noQrDetected"));
            return;
        }

        if (!weight || parseFloat(weight) <= 0) {
            setError(t("qrScanner.invalidWeight"));
            return;
        }

        // Extract stationId from payload format: {stationId}:{window}:{hmac}
        const parts = scannedPayload.split(":");
        if (parts.length !== 3) {
            setError(t("qrScanner.invalidPayload"));
            return;
        }

        const stationId = parseInt(parts[0], 10);
        if (isNaN(stationId)) {
            setError(t("qrScanner.invalidPayload"));
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const response = await recyclingService.recordEvent({
                stationId,
                weight: parseFloat(weight),
                materialType,
                qrPayload: scannedPayload,
            });

            onSuccess(response);
        } catch (err) {
            const message = err.response?.data?.error ?? t("qrScanner.submissionError");
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRescan = () => {
        setScannedPayload(null);
        setError(null);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md p-6">

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-green-400">
                        {t("qrScanner.title")}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-300 text-xl font-bold"
                    >
                        ✕
                    </button>
                </div>

                {/* Camera scanner — shown until a payload is captured */}
                {!scannedPayload && (
                    <div className="rounded-xl overflow-hidden mb-4">
                        <Scanner
                            onScan={handleScan}
                            onError={handleError}
                            constraints={{ facingMode: "environment" }}
                            styles={{ container: { width: "100%" } }}
                        />
                    </div>
                )}

                {/* Confirmation panel — shown after successful scan */}
                {scannedPayload && (
                    <div className="mb-4">
                        <div className="flex items-center gap-2 text-green-400 text-sm mb-4">
                            <span>✓</span>
                            <span>{t("qrScanner.qrDetected")}</span>
                        </div>

                        {/* Weight input */}
                        <div className="mb-3">
                            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">
                                {t("qrScanner.weightLabel")}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="0.50"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                            />
                        </div>

                        {/* Material type selector */}
                        <div className="mb-4">
                            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">
                                {t("qrScanner.materialLabel")}
                            </label>
                            <select
                                value={materialType}
                                onChange={(e) => setMaterialType(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                            >
                                {MATERIAL_TYPES.map((m) => (
                                    <option key={m} value={m}>
                                        {t(`qrScanner.material.${m}`)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleRescan}
                                className="flex-1 border border-gray-700 text-gray-400 hover:text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                            >
                                {t("qrScanner.rescan")}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                            >
                                {submitting ? t("qrScanner.submitting") : t("qrScanner.submit")}
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <p className="text-red-400 text-sm mt-3">{error}</p>
                )}

                {!scannedPayload && (
                    <p className="text-gray-600 text-xs text-center mt-3">
                        {t("qrScanner.instructions")}
                    </p>
                )}
            </div>
        </div>
    );
};

export default QRScanner;