// src/services/apiClient.js
//
// Axios instance pre-configured for the RecycleChain backend.
// Automatically attaches the JWT token to every request via an interceptor.

import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor — injects the JWT token if present in localStorage
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;