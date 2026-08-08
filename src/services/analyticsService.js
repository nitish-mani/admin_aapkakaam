import api from "./api";

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
    return response.data;
  },

  refreshDashboard: async () => {
    const response = await api.post("/admin/dashboard/refresh");
    return response.data;
  },

  clearCache: async () => {
    const response = await api.delete("/admin/dashboard/cache");
    return response.data;
  },

  // ============================================
  // USER ANALYTICS
  // ============================================

  /**
   * GET /api/admin/analytics/users
   * Get user analytics
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
   * Get detailed analytics for a specific user
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
   * Get vendor analytics - list all vendors with analytics
   */
  getVendorAnalytics: async (params = {}) => {
    const response = await api.get("/admin/analytics/vendors", { params });
    return response.data;
  },

  /**
   * GET /api/admin/analytics/vendors/:vendorId
   * Get detailed analytics for a specific vendor
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
   * Get booking analytics with pagination and search
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
   * Get detailed analytics for a specific booking
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
   * Get revenue analytics with enhanced features
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
   * Get referral analytics with enhanced features
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
   * Get a summary of all analytics in one request
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
   * Export analytics data
   * Supports: users, vendors, bookings, revenue, referrals
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
   * Health check
   */
  healthCheck: async () => {
    const response = await api.get("/admin/analytics/health");
    return response.data;
  },
};
