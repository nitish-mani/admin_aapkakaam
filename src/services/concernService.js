// src/services/concernService.js
import { analyticsService } from "./analyticsService";

export const concernService = {
  // ============================================
  // ADMIN CONCERN MANAGEMENT
  // ============================================

  /**
   * GET /api/concerns/admin/all
   * Get all concerns with pagination and filters (Admin only)
   */
  getAllConcerns: async (params = {}) => {
    return analyticsService.getConcerns(params);
  },

  /**
   * GET /api/concerns/admin/:concernId
   * Get single concern by ID (Admin only)
   */
  getConcernById: async (concernId) => {
    return analyticsService.getConcernById(concernId);
  },

  /**
   * PUT /api/concerns/admin/:concernId/status
   * Update concern status (Admin only)
   */
  updateConcernStatus: async (concernId, data) => {
    return analyticsService.updateConcernStatus(concernId, data);
  },

  /**
   * DELETE /api/concerns/admin/:concernId
   * Delete concern (soft delete) (Admin only)
   */
  deleteConcern: async (concernId) => {
    return analyticsService.deleteConcern(concernId);
  },

  // ============================================
  // USER/VENDOR CONCERN MANAGEMENT
  // ============================================

  /**
   * POST /api/concerns
   * Create new concern (User/Vendor only)
   */
  createConcern: async (data) => {
    return analyticsService.createConcern(data);
  },

  /**
   * GET /api/concerns
   * Get logged-in user's concerns (User/Vendor only)
   */
  getMyConcerns: async (params = {}) => {
    return analyticsService.getMyConcerns(params);
  },

  /**
   * GET /api/concerns/:concernId
   * Get single concern (own concern) (User/Vendor only)
   */
  getMyConcernById: async (concernId) => {
    return analyticsService.getMyConcernById(concernId);
  },
};

export default concernService;
