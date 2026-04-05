// src/services/authService.js
//
// Handles all authentication-related API calls.
// Stores and removes the JWT token and user data from localStorage.

import apiClient from "./apiClient";

const TOKEN_KEY = "token";
const USER_KEY = "user";

// Persist session data to localStorage
const saveSession = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        walletAddress: data.walletAddress,
    }));
};

export const authService = {

    // Register a new user with email + password
    register: async (email, password, name, walletAddress) => {
    const response = await apiClient.post("/auth/register", {
        email,
        password,
        passwordConfirm: password, // Backend requires this field
        name,
        walletAddress: walletAddress || null,
    });
    saveSession(response.data);
    return response.data;
},

    // Login with email + password
    login: async (email, password) => {
        const response = await apiClient.post("/auth/login", { email, password });
        saveSession(response.data);
        return response.data;
    },

    // Signs a message with MetaMask and authenticates with the backend.
    // Uses EIP-191 personal_sign standard.
    walletLogin: async (walletAddress) => {
        // Message includes the wallet address and a timestamp to prevent replay attacks
        const message = `Sign in to RecycleChain\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`;

        // Request MetaMask to sign the message
        const signature = await window.ethereum.request({
            method: "personal_sign",
            params: [message, walletAddress],
        });

        const response = await apiClient.post("/auth/wallet-login", {
            walletAddress,
            message,
            signature,
        });

        saveSession(response.data);
        return response.data;
    },

    // Clear session from localStorage
    logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    // Returns the stored user object or null
    getStoredUser: () => {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    // Returns true if a token exists in localStorage
    isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),
};