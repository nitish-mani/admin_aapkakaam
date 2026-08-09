import api from "./api";
import store from "../utils/store";
import { addDataAdmin } from "../utils/adminSlice";

export const analyticsService = {
  // ============================================
  // DASHBOARD
  // ============================================

  /**
   * GET /api/admin/dashboard
   * Get main dashboard data with vendor stats
   */
  getDashboard: async (refresh = false) => {
    const response = await api.get("/admin/dashboard", {
      params: { refresh },
    });

    const totals = response.data?.data?.totals ?? response.data?.totals ?? {};

    localStorage.setItem("dashboardData", JSON.stringify(totals));

    store.dispatch(addDataAdmin(totals));

    return response.data;
  },

  refreshDashboard: async () => {
    const response = await api.post("/admin/dashboard/refresh");

    const totals = response.data?.data?.totals ?? response.data?.totals ?? {};

    localStorage.setItem("dashboardData", JSON.stringify(totals));

    store.dispatch(addDataAdmin(totals));

    return response.data;
  },

  clearCache: async () => {
    const response = await api.delete("/admin/dashboard/cache");

    const totals = response.data?.data?.totals ?? response.data?.totals ?? {};

    localStorage.setItem("dashboardData", JSON.stringify(totals));

    store.dispatch(addDataAdmin(totals));

    return response.data;
  },

  // ============================================
  // USER ANALYTICS
  // ============================================

  /**
   * GET /api/admin/analytics/users
   */
  getUserAnalytics: async (params = {}) => {
    const response = await api.get("/admin/analytics/users", {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || "",
        status: params.status || "all",
        period: params.period || "month",
        from: params.from || null,
        to: params.to || null,
      },
    });

    return response.data;
  },

  /**
   * GET /api/admin/analytics/users/:userId
   */
  getUserDetailAnalytics: async (userId, params = {}) => {
    const response = await api.get(`/admin/analytics/users/${userId}`, {
      params: {
        from: params.from || null,
        to: params.to || null,
      },
    });

    return response.data;
  },

  // ============================================
  // VENDOR ANALYTICS
  // ============================================

  /**
   * GET /api/admin/analytics/vendors
   */
  getVendorAnalytics: async (params = {}) => {
    const response = await api.get("/admin/analytics/vendors", { params });

    return response.data;
  },

  /**
   * GET /api/admin/analytics/vendors/:vendorId
   */
  getVendorDetailAnalytics: async (vendorId, params = {}) => {
    const response = await api.get(`/admin/analytics/vendors/${vendorId}`, {
      params,
    });

    return response.data;
  },

  // ============================================
  // BOOKING ANALYTICS
  // ============================================

  /**
   * GET /api/admin/analytics/bookings
   */
  getBookingAnalytics: async (params = {}) => {
    const response = await api.get("/admin/analytics/bookings", {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || "",
        status: params.status || "all",
        groupBy: params.groupBy || "day",
        from: params.from || null,
        to: params.to || null,
        vendorId: params.vendorId || null,
        userId: params.userId || null,
      },
    });

    return response.data;
  },

  /**
   * GET /api/admin/analytics/bookings/:bookingId
   */
  getBookingDetailAnalytics: async (bookingId) => {
    const response = await api.get(`/admin/analytics/bookings/${bookingId}`);

    return response.data;
  },

  // ============================================
  // REVENUE ANALYTICS
  // ============================================

  /**
   * GET /api/admin/analytics/revenue
   */
  getRevenueAnalytics: async (params = {}) => {
    const response = await api.get("/admin/analytics/revenue", {
      params: {
        period: params.period || "month",
        from: params.from || null,
        to: params.to || null,
        gateway: params.gateway || "all",
        vendorId: params.vendorId || null,
        userId: params.userId || null,
        groupBy: params.groupBy || "day",
      },
    });

    return response.data;
  },

  // ============================================
  // REFERRAL ANALYTICS
  // ============================================

  /**
   * GET /api/admin/analytics/referrals
   */
  getReferralAnalytics: async (params = {}) => {
    const response = await api.get("/admin/analytics/referrals", {
      params: {
        period: params.period || "month",
        from: params.from || null,
        to: params.to || null,
        status: params.status || "all",
        type: params.type || "all",
        userId: params.userId || null,
        vendorId: params.vendorId || null,
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || "",
      },
    });

    return response.data;
  },

  // ============================================
  // SUMMARY ANALYTICS
  // ============================================

  /**
   * GET /api/admin/analytics/summary
   */
  getAnalyticsSummary: async (params = {}) => {
    const response = await api.get("/admin/analytics/summary", { params });

    return response.data;
  },

  // ============================================
  // EXPORT
  // ============================================

  /**
   * GET /api/admin/analytics/export
   */
  exportAnalytics: async (params = {}) => {
    const response = await api.get("/admin/analytics/export", {
      params,
      responseType: params.format === "csv" ? "blob" : "json",
    });

    return response.data;
  },

  // ============================================
  // HEALTH CHECK
  // ============================================

  /**
   * GET /api/admin/analytics/health
   */
  healthCheck: async () => {
    const response = await api.get("/admin/analytics/health");

    return response.data;
  },
};
