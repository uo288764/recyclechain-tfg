// src/services/adminService.js
//
// Handles all admin-related API calls to the backend.
// All endpoints require ROLE_ADMIN — JWT is attached automatically by apiClient.

import apiClient from "./apiClient";

export const adminService = {

    // --- Stats ---

    getGlobalStats: async () => {
        const response = await apiClient.get("/admin/stats");
        return response.data;
    },

    // --- Stations ---

    getAllStations: async () => {
        const response = await apiClient.get("/admin/stations");
        return response.data;
    },

    createStation: async (stationData) => {
        const response = await apiClient.post("/admin/stations", stationData);
        return response.data;
    },

    activateStation: async (id) => {
        await apiClient.put(`/admin/stations/${id}/activate`);
    },

    deactivateStation: async (id) => {
        await apiClient.put(`/admin/stations/${id}/deactivate`);
    },

    // --- Campaigns ---

    getAllCampaigns: async () => {
        const response = await apiClient.get("/admin/campaigns");
        return response.data;
    },

    getCampaign: async (id) => {
        const response = await apiClient.get(`/admin/campaigns/${id}`);
        return response.data;
    },

    createCampaign: async (campaignData) => {
        const response = await apiClient.post("/admin/campaigns", campaignData);
        return response.data;
    },

    updateCampaign: async (id, campaignData) => {
        const response = await apiClient.put(`/admin/campaigns/${id}`, campaignData);
        return response.data;
    },

    activateCampaign: async (id) => {
        const response = await apiClient.put(`/admin/campaigns/${id}/activate`);
        return response.data;
    },

    closeCampaign: async (id) => {
        const response = await apiClient.put(`/admin/campaigns/${id}/close`);
        return response.data;
    },

    // --- Container batches ---

    getBatchesByCampaign: async (campaignId) => {
        const response = await apiClient.get(`/admin/campaigns/${campaignId}/batches`);
        return response.data;
    },

    createBatch: async (batchData) => {
        const response = await apiClient.post("/admin/batches", batchData);
        return response.data;
    },

    getBatchUuids: async (batchId) => {
        const response = await apiClient.get(`/admin/batches/${batchId}/uuids`);
        return response.data;
    },
};