// src/services/recyclingService.js
//
// Handles all recycling-related API calls to the backend.

import apiClient from "./apiClient";

export const recyclingService = {

    // Get recycling stats for the authenticated user
    getStats: async () => {
        const response = await apiClient.get("/recycling/stats");
        return response.data;
    },

    // Get recycling event history for the authenticated user
    getHistory: async () => {
        const response = await apiClient.get("/recycling/history");
        return response.data;
    },

    /**
     * Record a new recycling event.
     *
     * @param {Object} params
     * @param {number} params.stationId       - Station database ID (extracted from QR payload)
     * @param {number} params.weight          - Weight in kilograms
     * @param {string} params.materialType    - Material type (plastic, metal, glass, paper, organic)
     * @param {string} params.qrPayload       - Raw QR payload scanned at the station
     * @param {string} [params.transactionHash] - Optional on-chain transaction hash
     */
    recordEvent: async ({ stationId, weight, materialType, qrPayload, transactionHash }) => {
        const response = await apiClient.post("/recycling/record", {
            stationId,
            weight,
            materialType,
            qrPayload,
            transactionHash: transactionHash || null,
        });
        return response.data;
    },
};