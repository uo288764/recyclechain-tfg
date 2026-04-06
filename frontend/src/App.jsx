// src/App.jsx
//
// Root component. Sets up routing, global providers and navigation.

import { BrowserRouter, Routes, Route, Navigate, NavLink } from "react-router-dom";
import { WalletProvider } from "./hooks/WalletContext";
import { AuthProvider, useAuthContext } from "./hooks/AuthContext";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StationsPage from "./pages/StationsPage";

// Redirects unauthenticated users to /login
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuthContext();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// Secondary nav shown only when authenticated
const SubNav = () => {
    const { isAuthenticated } = useAuthContext();
    if (!isAuthenticated) { return null; }

    const linkClass = ({ isActive }) =>
        `text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
            isActive
                ? "bg-green-900 text-green-400"
                : "text-gray-400 hover:text-white"
        }`;

    return (
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-2 flex gap-2">
            <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
            <NavLink to="/stations" className={linkClass}>Stations</NavLink>
        </div>
    );
};

const AppRoutes = () => {
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <SubNav />
            <main>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/stations"
                        element={
                            <ProtectedRoute>
                                <StationsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <WalletProvider>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </WalletProvider>
        </BrowserRouter>
    );
};

export default App;