// src/pages/RegisterPage.jsx
//
// Registration page. Collects name, email, password and
// optionally links a MetaMask wallet address on sign-up.

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../hooks/AuthContext";
import { useWalletContext } from "../hooks/WalletContext";
import { Wallet, UserPlus } from "lucide-react";

const RegisterPage = () => {
    const { register, loading, error } = useAuthContext();
    const { account, connect } = useWalletContext();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [formError, setFormError] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleConnectWallet = async () => {
        await connect();
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setFormError(null);

        if (form.password !== form.confirmPassword) {
            setFormError("Passwords do not match");
            return;
        }

        try {
            await register(form.email, form.password, form.name, account || null);
            navigate("/");
        } catch (err) {
            // Extract the first defaultMessage from Spring's BindingResult error array
            const backendErrors = err.response?.data;
            if (Array.isArray(backendErrors) && backendErrors.length > 0 && backendErrors[0].defaultMessage) {
                setFormError(backendErrors[0].defaultMessage);
            } else {
                setFormError("Registration failed. Please try again.");
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4 py-10">
            <div className="w-full max-w-md bg-gray-900 border border-green-900 rounded-2xl p-8">

                <div className="text-center mb-8">
                    <span className="text-5xl">♻</span>
                    <h1 className="text-2xl font-bold text-green-400 mt-2">
                        Create your account
                    </h1>
                </div>

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-600"
                            placeholder="Your name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-600"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-600"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-600"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Optional wallet linking */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Wallet Address <span className="text-gray-600">(optional)</span>
                        </label>
                        {account ? (
                            <div className="w-full bg-gray-800 border border-green-700 rounded-lg px-4 py-2.5 text-green-400 text-sm font-mono">
                                {account}
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleConnectWallet}
                                className="w-full flex items-center justify-center gap-2 border border-gray-700 hover:border-green-700 text-gray-400 hover:text-green-400 text-sm py-2.5 rounded-lg transition-colors"
                            >
                                <Wallet size={16} />
                                Connect MetaMask
                            </button>
                        )}
                    </div>

                    {(formError || error) && (
                        <p className="text-red-400 text-sm">{formError || error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
                    >
                        <UserPlus size={18} />
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-green-400 hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;