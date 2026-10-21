import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/common/PrivateRoute";
import Layout from "./components/common/Layout";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Lazy load pages
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const UserManagementPage = lazy(() => import("./pages/UserManagementPage"));
const UserDetailPage = lazy(() => import("./pages/UserDetailPage"));
const VendorsPage = lazy(() => import("./pages/VendorsPage"));
const VendorManagementPage = lazy(() => import("./pages/VendorManagementPage"));
const VendorDetailPage = lazy(() => import("./pages/VendorDetailPage"));
const BookingsPage = lazy(() => import("./pages/BookingsPage"));
const RevenuePage = lazy(() => import("./pages/RevenuePage"));
const ReferralsPage = lazy(() => import("./pages/ReferralsPage"));
const ConcernsPage = lazy(() => import("./pages/ConcernsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const AppVersionManagement = lazy(() => import("./pages/AppVersionManagement"));
const SystemStatus = lazy(() => import("./pages/SystemStatus"));
const HomeBannerManagement = lazy(() => import("./pages/HomeBanner"));
const SignupFeeManagement = lazy(() => import("./pages/SignupFeeManagement"));
const AdminNotificationManagement = lazy(
  () => import("./pages/AdminNotificationManagement"),
);
const VendorSearchAnalytics = lazy(
  () => import("./pages/VendorSearchAnalytics"),
);
const helmetContext = {};

function App() {
  return (
    <HelmetProvider context={helmetContext}>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="user-management" element={<UserManagementPage />} />
              <Route
                path="user-management/:phoneNo"
                element={<UserDetailPage />}
              />
              <Route path="vendors" element={<VendorsPage />} />
              <Route
                path="vendor-management"
                element={<VendorManagementPage />}
              />
              <Route
                path="vendor-management/:phoneNo"
                element={<VendorDetailPage />}
              />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="revenue" element={<RevenuePage />} />
              <Route path="referrals" element={<ReferralsPage />} />
              <Route path="concerns" element={<ConcernsPage />} />
              <Route path="app-version" element={<AppVersionManagement />} />
              <Route path="system-status" element={<SystemStatus />} />
              <Route path="home-banner" element={<HomeBannerManagement />} />
              <Route path="/signup-fees" element={<SignupFeeManagement />} />
              <Route
                path="/notifications"
                element={<AdminNotificationManagement />}
              />

              <Route
                path="vendor-search-analytics"
                element={<VendorSearchAnalytics />}
              />

              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
