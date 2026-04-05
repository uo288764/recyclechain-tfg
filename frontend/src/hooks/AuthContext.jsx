// src/hooks/AuthContext.jsx
//
// React Context that exposes authentication state globally.
// Mirrors the pattern used in WalletContext for consistency.

import { createContext, useContext, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(authService.getStoredUser());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isAuthenticated = !!user;

    const register = async (email, password, name, walletAddress) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authService.register(email, password, name, walletAddress);
            setUser(data);
            return data;
        } catch (err) {
            setError(err.response?.data || "Registration failed");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authService.login(email, password);
            setUser(data);
            return data;
        } catch (err) {
            setError(err.response?.data || "Login failed");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const walletLogin = async (walletAddress) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authService.walletLogin(walletAddress);
            setUser(data);
            return data;
        } catch (err) {
            setError(err.response?.data || "Wallet login failed");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            loading,
            error,
            register,
            login,
            walletLogin,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used inside AuthProvider");
    }
    return context;
};