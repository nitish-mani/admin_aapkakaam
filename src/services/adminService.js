// src/services/adminService.js
import api from "./api";

export const adminService = {
  // ============================================
  // USER MANAGEMENT BY PHONE
  // ============================================

  /**
   * GET /api/admin/users/phone/:phoneNo
   * Get user by phone number
   */
  getUserByPhone: async (phoneNo) => {
    const response = await api.get(`/admin/users/phone/${phoneNo}`);
    return response.data;
  },

  /**
   * GET /api/admin/users/complete/:phoneNo
   * Get complete user details with all related data
   */
  getUserComplete: async (phoneNo, params = {}) => {
    const response = await api.get(`/admin/users/complete/${phoneNo}`, {
      params: {
        limit: params.limit || 20,
        page: params.page || 1,
      },
    });
    console.log(response);
    return response.data;
  },

  /**
   * PUT /api/admin/users/phone/:phoneNo
   * Update user by phone number
   */
  updateUserByPhone: async (phoneNo, data) => {
    const response = await api.put(`/admin/users/phone/${phoneNo}`, data);
    return response.data;
  },

  /**
   * POST /api/admin/users/phone/:phoneNo/block
   * Block user by phone number
   */
  blockUserByPhone: async (phoneNo) => {
    const response = await api.post(`/admin/users/phone/${phoneNo}/block`);
    return response.data;
  },

  /**
   * POST /api/admin/users/phone/:phoneNo/unblock
   * Unblock user by phone number
   */
  unblockUserByPhone: async (phoneNo) => {
    const response = await api.post(`/admin/users/phone/${phoneNo}/unblock`);
    return response.data;
  },

  /**
   * GET /api/admin/search/users
   * Search users by phone number (partial match)
   */
  searchUsersByPhone: async (phoneNo) => {
    const response = await api.get("/admin/search/users", {
      params: { phoneNo },
    });
    return response.data;
  },

  // ============================================
  // VENDOR MANAGEMENT BY PHONE
  // ============================================

  /**
   * GET /api/admin/vendors/phone/:phoneNo
   * Get vendor by phone number
   */
  getVendorByPhone: async (phoneNo) => {
    const response = await api.get(`/admin/vendors/phone/${phoneNo}`);
    return response.data;
  },

  /**
   * GET /api/admin/vendors/complete/:phoneNo
   * Get complete vendor details with all related data
   */
  getVendorComplete: async (phoneNo, params = {}) => {
    const response = await api.get(`/admin/vendors/complete/${phoneNo}`, {
      params: {
        limit: params.limit || 20,
        page: params.page || 1,
      },
    });
    return response.data;
  },

  /**
   * PUT /api/admin/vendors/phone/:phoneNo
   * Update vendor by phone number
   */
  updateVendorByPhone: async (phoneNo, data) => {
    const response = await api.put(`/admin/vendors/phone/${phoneNo}`, data);
    return response.data;
  },

  /**
   * POST /api/admin/vendors/phone/:phoneNo/block
   * Block vendor by phone number
   */
  blockVendorByPhone: async (phoneNo) => {
    const response = await api.post(`/admin/vendors/phone/${phoneNo}/block`);
    return response.data;
  },

  /**
   * POST /api/admin/vendors/phone/:phoneNo/unblock
   * Unblock vendor by phone number
   */
  unblockVendorByPhone: async (phoneNo) => {
    const response = await api.post(`/admin/vendors/phone/${phoneNo}/unblock`);
    return response.data;
  },

  /**
   * GET /api/admin/search/vendors
   * Search vendors by phone number (partial match)
   */
  searchVendorsByPhone: async (phoneNo) => {
    const response = await api.get("/admin/search/vendors", {
      params: { phoneNo },
    });
    return response.data;
  },

  // ============================================
  // VENDOR LEAVE MANAGEMENT
  // ============================================

  /**
   * GET /api/admin/vendors/:phoneNo/leaves
   * Get vendor leaves by phone number
   */
  getVendorLeaves: async (phoneNo, params = {}) => {
    const response = await api.get(`/admin/vendors/${phoneNo}/leaves`, {
      params: {
        status: params.status || "",
        from: params.from || null,
        to: params.to || null,
        limit: params.limit || 20,
        page: params.page || 1,
      },
    });
    return response.data;
  },

  /**
   * POST /api/admin/vendors/:phoneNo/leaves
   * Create vendor leave by phone number
   */
  createVendorLeave: async (phoneNo, data) => {
    const response = await api.post(`/admin/vendors/${phoneNo}/leaves`, data);
    return response.data;
  },

  /**
   * PUT /api/admin/vendors/leaves/:leaveId
   * Update vendor leave status
   */
  updateVendorLeave: async (leaveId, data) => {
    const response = await api.put(`/admin/vendors/leaves/${leaveId}`, data);
    return response.data;
  },

  /**
   * DELETE /api/admin/vendors/leaves/:leaveId
   * Delete vendor leave
   */
  deleteVendorLeave: async (leaveId) => {
    const response = await api.delete(`/admin/vendors/leaves/${leaveId}`);
    return response.data;
  },
};

export default adminService;
