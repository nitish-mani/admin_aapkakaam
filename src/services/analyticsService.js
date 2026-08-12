// src/services/analyticsService.js
import api from "./api";
import store from "../utils/store";
import { addDataAdmin, updateConcernStats } from "../utils/adminSlice";

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
    const response = await api.get("/admin/analytics/vendors", {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || "",
        status: params.status || "all",
        type: params.type || "all",
        sortBy: params.sortBy || "rating",
        period: params.period || "month",
        from: params.from || null,
        to: params.to || null,
      },
    });

    return response.data;
  },

  /**
   * GET /api/admin/analytics/vendors/:vendorId
   */
  getVendorDetailAnalytics: async (vendorId, params = {}) => {
    const response = await api.get(`/admin/analytics/vendors/${vendorId}`, {
      params: {
        from: params.from || null,
        to: params.to || null,
      },
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
  // CONCERN MANAGEMENT (Admin)
  // ============================================

  /**
   * GET /api/concerns/admin/all
   * Get all concerns with pagination and filters (Admin only)
   */
  getConcerns: async (params = {}) => {
    const response = await api.get("/concerns/admin/all", {
      params: {
        status: params.status || "",
        category: params.category || "",
        priority: params.priority || "",
        raisedBy: params.raisedBy || "",
        page: params.page || 1,
        limit: params.limit || 20,
      },
    });

    // Update concern stats in Redux store
    if (response.data?.concerns) {
      const concerns = response.data.concerns;
      const stats = {
        total: response.data.pagination?.totalCount || concerns.length,
        open: concerns.filter((c) => c.status === "Open").length,
        inProgress: concerns.filter((c) => c.status === "InProgress").length,
        resolved: concerns.filter((c) => c.status === "Resolved").length,
        rejected: concerns.filter((c) => c.status === "Rejected").length,
        closed: concerns.filter((c) => c.status === "Closed").length,
      };
      store.dispatch(updateConcernStats(stats));
    }

    return response.data;
  },

  /**
   * GET /api/concerns/admin/:concernId
   * Get single concern by ID (Admin only)
   */
  getConcernById: async (concernId) => {
    const response = await api.get(`/concerns/admin/${concernId}`);
    return response.data;
  },

  /**
   * PUT /api/concerns/admin/:concernId/status
   * Update concern status (Admin only)
   */
  updateConcernStatus: async (concernId, data) => {
    const response = await api.put(`/concerns/admin/${concernId}/status`, data);

    // Refresh concerns to update stats
    if (response.data?.success) {
      await analyticsService.getConcerns({ page: 1, limit: 20 });
    }

    return response.data;
  },

  /**
   * DELETE /api/concerns/admin/:concernId
   * Delete concern (soft delete) (Admin only)
   */
  deleteConcern: async (concernId) => {
    const response = await api.delete(`/concerns/admin/${concernId}`);

    // Refresh concerns to update stats
    if (response.data?.success) {
      await analyticsService.getConcerns({ page: 1, limit: 20 });
    }

    return response.data;
  },

  // ============================================
  // CONCERN MANAGEMENT (User/Vendor)
  // ============================================

  /**
   * POST /api/concerns
   * Create new concern (User/Vendor only)
   */
  createConcern: async (data) => {
    const response = await api.post("/concerns", data);
    return response.data;
  },

  /**
   * GET /api/concerns
   * Get logged-in user's concerns (User/Vendor only)
   */
  getMyConcerns: async (params = {}) => {
    const response = await api.get("/concerns", {
      params: {
        status: params.status || "",
        category: params.category || "",
        priority: params.priority || "",
        raisedBy: params.raisedBy || "",
        page: params.page || 1,
        limit: params.limit || 20,
      },
    });
    return response.data;
  },

  /**
   * GET /api/concerns/:concernId
   * Get single concern (own concern) (User/Vendor only)
   */
  getMyConcernById: async (concernId) => {
    const response = await api.get(`/concerns/${concernId}`);
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
   * Supports: users, vendors, bookings, revenue, referrals, concerns
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

export default analyticsService;
