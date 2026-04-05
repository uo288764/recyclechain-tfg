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

    // Record a new recycling event
    recordEvent: async (stationId, weight, materialType, transactionHash) => {
        const response = await apiClient.post("/recycling/record", {
            stationId,
            weight,
            materialType,
            transactionHash: transactionHash || null,
        });
        return response.data;
    },
};