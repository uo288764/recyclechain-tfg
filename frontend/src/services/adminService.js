// src/services/adminService.js
//
// Handles all admin-related API calls to the backend.
// All endpoints require ROLE_ADMIN — JWT is attached automatically by apiClient.

import apiClient from "./apiClient";

export const adminService = {

    // Get global recycling statistics
    getGlobalStats: async () => {
        const response = await apiClient.get("/admin/stats");
        return response.data;
    },

    // Get all stations (active and inactive)
    getAllStations: async () => {
        const response = await apiClient.get("/admin/stations");
        return response.data;
    },

    // Create a new recycling station
    createStation: async (stationData) => {
        const response = await apiClient.post("/admin/stations", stationData);
        return response.data;
    },

    // Activate a station by ID
    activateStation: async (id) => {
        await apiClient.put(`/admin/stations/${id}/activate`);
    },

    // Deactivate a station by ID
    deactivateStation: async (id) => {
        await apiClient.put(`/admin/stations/${id}/deactivate`);
    },
};