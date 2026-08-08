import React, { createContext, useState, useContext, useEffect } from "react";
import { authService } from "../services/authService";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("adminToken"));

  useEffect(() => {
    const initAuth = () => {
      const adminData = authService.getCurrentAdmin();
      if (adminData && token) {
        setAdmin(adminData);
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);

      // Login response from backend:
      // { token, adminId, name, email, phoneNo, verifyEmail, verifyPhoneNo,
      //   gender, totalBookings, totalEmployee, totalUser, totalVendor, message }

      const {
        token: authToken,
        adminId,
        name,
        email,
        phoneNo,
        verifyEmail,
        verifyPhoneNo,
        gender,
        totalBookings,
        totalEmployee,
        totalUser,
        totalVendor,
      } = response;

      localStorage.setItem("adminToken", authToken);

      const adminData = {
        adminId,
        name,
        email,
        phoneNo,
        verifyEmail,
        verifyPhoneNo,
        gender,
        totalBookings,
        totalEmployee,
        totalUser,
        totalVendor,
      };

      localStorage.setItem("adminData", JSON.stringify(adminData));
      setToken(authToken);
      setAdmin(adminData);

      toast.success(response.message || "Login successful!");
      return { success: true, data: response };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const signup = async (data) => {
    try {
      const response = await authService.signup(data);
      toast.success(response.message || "Signup successful! Please login.");
      return { success: true, data: response };
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setAdmin(null);
    toast.info("Logged out successfully");
  };

  const value = {
    admin,
    loading,
    isAuthenticated: !!token && !!admin,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
