// src/App.jsx
//
// Root component. Sets up routing, global providers and navigation.
//
// Sprint 8: added /my-containers (MyContainersPage) and /campaigns (CampaignPage).
// SubNav updated with links to new pages for ROLE_USER.

import { BrowserRouter, Routes, Route, Navigate, NavLink } from "react-router-dom";
import { WalletProvider } from "./hooks/WalletContext";
import { AuthProvider, useAuthContext } from "./hooks/AuthContext";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StationsPage from "./pages/StationsPage";
import AdminPage from "./pages/AdminPage";
import MyContainersPage from "./pages/MyContainersPage";
import CampaignPage from "./pages/CampaignPage";
import { useTranslation } from "react-i18next";

/**
 * Redirects unauthenticated users to /login.
 * Accessible by any authenticated user regardless of role.
 * Used for shared routes like /stations and /campaigns.
 */
const AuthRoute = ({ children }) => {
    const { isAuthenticated } = useAuthContext();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

/**
 * Redirects unauthenticated users to /login.
 * Redirects ROLE_ADMIN users away from / to /admin —
 * admin users have no access to the user dashboard.
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuthContext();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role === "ROLE_ADMIN") {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

/**
 * Redirects unauthenticated users to /login.
 * Redirects ROLE_USER away from /admin to / —
 * regular users have no access to the admin panel.
 */
const AdminRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuthContext();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== "ROLE_ADMIN") {
        return <Navigate to="/" replace />;
    }

    return children;
};

// Secondary nav shown only when authenticated
const SubNav = () => {
    const { isAuthenticated, user } = useAuthContext();
    const { t } = useTranslation();

    if (!isAuthenticated) { return null; }

    const linkClass = ({ isActive }) =>
        `text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
            isActive
                ? "bg-green-900 text-green-400"
                : "text-gray-400 hover:text-white"
        }`;

    return (
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-2 flex gap-2">
            {user?.role === "ROLE_ADMIN" ? (
                <>
                    <NavLink to="/stations" className={linkClass}>
                        {t("navbar.stations")}
                    </NavLink>
                    <NavLink to="/admin" className={linkClass}>
                        {t("navbar.admin")}
                    </NavLink>
                </>
            ) : (
                <>
                    <NavLink to="/stations" className={linkClass}>
                        {t("navbar.stations")}
                    </NavLink>
                    <NavLink to="/" end className={linkClass}>
                        {t("navbar.dashboard")}
                    </NavLink>
                    <NavLink to="/my-containers" className={linkClass}>
                        {t("dashboard.myContainers")}
                    </NavLink>
                    <NavLink to="/campaigns" className={linkClass}>
                        {t("dashboard.activeCampaign")}
                    </NavLink>
                </>
            )}
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

                    {/* User dashboard — ROLE_ADMIN is redirected to /admin */}
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
                            <AuthRoute>
                                <StationsPage />
                            </AuthRoute>
                        }
                    />

                    {/* My containers — Step 2 of dual QR flow, ROLE_USER only */}
                    <Route
                        path="/my-containers"
                        element={
                            <ProtectedRoute>
                                <MyContainersPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Active campaign public page — any authenticated user */}
                    <Route
                        path="/campaigns"
                        element={
                            <AuthRoute>
                                <CampaignPage />
                            </AuthRoute>
                        }
                    />

                    {/* Admin panel — ROLE_USER is redirected to / */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminPage />
                            </AdminRoute>
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