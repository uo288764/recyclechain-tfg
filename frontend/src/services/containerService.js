// src/services/containerService.js
//
// Handles all container-related API calls.
// Covers the dual QR flow: scan container UUID at home, deposit at station.

import apiClient from "./apiClient";

export const containerService = {

    // Step 1 — scan container QR at home
    // Registers the container UUID to the user's account (UNSCANNED → SCANNED)
    scanContainer: async (uuid) => {
        const response = await apiClient.post("/containers/scan", { uuid });
        return response.data;
    },

    // Returns all containers in SCANNED state for the authenticated user
    getPendingContainers: async () => {
        const response = await apiClient.get("/containers/pending");
        return response.data;
    },
};