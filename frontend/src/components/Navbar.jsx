// src/components/Navbar.jsx
//
// Top navigation bar. Shows wallet connection status and
// authenticated user info. Logout clears the JWT session.

import { Recycle, LogOut, TriangleAlert, Wifi, Wallet, User } from "lucide-react";
import { useWalletContext } from "../hooks/WalletContext";
import { useAuthContext } from "../hooks/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const shortenAddress = (address) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

const Navbar = () => {
    const {
        account,
        connect,
        disconnect: disconnectWallet,
        loading,
        error,
        isCorrectNetwork,
        switchToAmoy,
    } = useWalletContext();

    const { user, isAuthenticated, logout } = useAuthContext();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        disconnectWallet();
        navigate("/login");
    };

    return (
        <nav className="bg-gray-900 border-b border-green-800 px-6 py-4 flex items-center justify-between">

            {/* App title */}
            <div className="flex items-center gap-2">
                <span className="text-2xl">♻</span>
                <span className="text-green-400 font-bold text-xl tracking-tight">
                    RecycleChain
                </span>
            </div>

            <div className="flex items-center gap-3">

                {error && (
                    <span className="text-red-400 text-sm">{error}</span>
                )}

                {/* Wallet controls — only shown when authenticated */}
                {isAuthenticated && account && (
                    <>
                        {!isCorrectNetwork && (
                            <button
                                onClick={switchToAmoy}
                                className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-semibold px-3 py-1.5 rounded-lg"
                            >
                                <TriangleAlert size={16} /> Switch to Amoy
                            </button>
                        )}

                        {isCorrectNetwork && (
                            <span className="flex items-center gap-1 bg-green-900 text-green-400 text-xs font-mono px-2 py-1 rounded">
                                <Wifi size={12} /> Polygon Amoy
                            </span>
                        )}

                        <span className="text-gray-300 text-sm font-mono bg-gray-800 px-3 py-1.5 rounded-lg">
                            {shortenAddress(account)}
                        </span>
                    </>
                )}

                {/* Connect wallet button — shown when authenticated but no wallet */}
                {isAuthenticated && !account && (
                    <button
                        onClick={connect}
                        disabled={loading}
                        className="flex items-center gap-2 border border-green-700 hover:border-green-500 text-green-400 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <Wallet size={16} />
                        {loading ? "Connecting..." : "Connect Wallet"}
                    </button>
                )}

                {/* Authenticated user info + logout */}
                {isAuthenticated && (
                    <div className="flex items-center gap-3 border-l border-gray-700 pl-3">
                        <span className="flex items-center gap-1 text-gray-300 text-sm">
                            <User size={14} />
                            {user?.name}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1 text-gray-400 hover:text-red-400 text-sm transition-colors"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                )}

                {/* Not authenticated — show Sign In or Register depending on current page */}
                {!isAuthenticated && (
                    <>
                        {location.pathname === "/login" ? (
                            <button
                                onClick={() => navigate("/register")}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                            >
                                Register
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate("/login")}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                            >
                                Sign In
                            </button>
                        )}
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;