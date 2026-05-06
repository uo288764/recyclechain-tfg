// src/services/apiClient.js
//
// Axios instance pre-configured for the RecycleChain backend.
// Automatically attaches the JWT token and Accept-Language header
// to every request via interceptors.

import axios from "axios";
import i18n from "../i18n/index.js";

const apiClient = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor — injects JWT token and current language
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers["Accept-Language"] = i18n.language || "en";
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;