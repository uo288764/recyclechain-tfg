// src/pages/LoginPage.jsx
//
// Login page. Supports two flows:
// - Email + password (traditional)
// - MetaMask wallet (auto-login if wallet is connected and registered)

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../hooks/AuthContext";
import { useWalletContext } from "../hooks/WalletContext";
import { Wallet, LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";

const LoginPage = () => {
    const { login, walletLogin, loading, error } = useAuthContext();
    const { account, connect } = useWalletContext();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [formError, setFormError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setFormError(null);
        try {
            await login(email, password);
            navigate("/");
        } catch {
            setFormError(t("login.errorInvalidCredentials"));
        }
    };

    const handleWalletLogin = async () => {
        setFormError(null);
        try {
            if (!account) {
                await connect();
            }
            await walletLogin(account);
            navigate("/");
        } catch {
            setFormError(t("login.errorWalletNotRegistered"));
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <div className="w-full max-w-md bg-gray-900 border border-green-900 rounded-2xl p-8">

                <div className="text-center mb-8">
                    <span className="text-5xl">♻</span>
                    <h1 className="text-2xl font-bold text-green-400 mt-2">
                        {t("login.title")}
                    </h1>
                </div>

                <button
                    onClick={handleWalletLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors mb-6"
                >
                    <Wallet size={18} />
                    {account ? t("login.loginWithWallet") : t("login.connectWalletLogin")}
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-gray-700" />
                    <span className="text-gray-500 text-sm">or</span>
                    <div className="flex-1 h-px bg-gray-700" />
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">{t("login.email")}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-600"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">{t("login.password")}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-600"
                            placeholder="••••••••"
                        />
                    </div>

                    {(formError || error) && (
                        <p className="text-red-400 text-sm">{formError || error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                        <LogIn size={18} />
                        {loading ? t("login.signingIn") : t("login.signIn")}
                    </button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    {t("login.noAccount")}{" "}
                    <Link to="/register" className="text-green-400 hover:underline">
                        {t("login.registerHere")}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;