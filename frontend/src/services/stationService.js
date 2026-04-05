// src/services/stationService.js
//
// Handles all station-related API calls to the backend.

import apiClient from "./apiClient";

export const stationService = {

    // Get all active recycling stations
    getActiveStations: async () => {
        const response = await apiClient.get("/stations/active");
        return response.data;
    },

    // Get a single station by ID
    getStation: async (id) => {
        const response = await apiClient.get(`/stations/${id}`);
        return response.data;
    },
};