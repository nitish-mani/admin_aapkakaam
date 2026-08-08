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
const VendorsPage = lazy(() => import("./pages/VendorsPage"));
const BookingsPage = lazy(() => import("./pages/BookingsPage"));
const RevenuePage = lazy(() => import("./pages/RevenuePage"));
const ReferralsPage = lazy(() => import("./pages/ReferralsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

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
              <Route path="vendors" element={<VendorsPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="revenue" element={<RevenuePage />} />
              <Route path="referrals" element={<ReferralsPage />} />
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
