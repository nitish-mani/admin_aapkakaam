import api from "./api";

export const authService = {
  /**
   * Admin Login
   * POST /api/admin/login
   * Body: { email, password }
   * Returns: { token, adminId, name, email, phoneNo, totalBookings, totalEmployee, totalUser, totalVendor }
   */
  login: async (credentials) => {
    const response = await api.post("/admin/login", credentials);
    return response.data;
  },

  /**
   * Admin Signup
   * POST /api/admin/signup
   * Body: { name, email, phoneNo, password }
   * Returns: { message, adminId }
   */
  signup: async (data) => {
    const response = await api.post("/admin/signup", data);
    return response.data;
  },

  /**
   * Get Current Admin from localStorage
   */
  getCurrentAdmin: () => {
    const adminData = localStorage.getItem("adminData");
    return adminData ? JSON.parse(adminData) : null;
  },

  /**
   * Logout - Clear localStorage
   */
  logout: () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
  },

  /**
   * Verify Email OTP
   * POST /api/admin/verify-email
   * Body: { email, otpId }
   */
  verifyEmail: async (data) => {
    const response = await api.post("/admin/verify-email", data);
    return response.data;
  },

  /**
   * Verify Phone OTP
   * POST /api/admin/verify-phone
   * Body: { phoneNo, otpId }
   */
  verifyPhone: async (data) => {
    const response = await api.post("/admin/verify-phone", data);
    return response.data;
  },

  /**
   * Verify OTP Code
   * POST /api/admin/verify-otp
   * Body: { otp, otpId }
   */
  verifyOTP: async (data) => {
    const response = await api.post("/admin/verify-otp", data);
    return response.data;
  },

  /**
   * Change Password
   * PATCH /api/admin/change-password
   * Body: { email, password, otpId }
   */
  changePassword: async (data) => {
    const response = await api.patch("/admin/change-password", data);
    return response.data;
  },
};
