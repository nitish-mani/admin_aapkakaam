// src/utils/adminSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  adminData: {
    users: 0,
    vendors: 0,
    bookings: 0,
    activeBookings: 0,
    totalBookings: 0,
  },
  concernStats: {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    closed: 0,
  },
  concernCategories: [
    "booking_issue",
    "payment_issue",
    "refund_issue",
    "vendor_issue",
    "user_issue",
    "technical_issue",
    "account_issue",
    "dispute",
    "cancellation",
    "other",
  ],
  concernPriorities: ["Low", "Medium", "High", "Urgent"],
  concernStatuses: ["Open", "InProgress", "Resolved", "Rejected", "Closed"],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    addDataAdmin: (state, action) => {
      state.adminData = {
        ...state.adminData,
        ...action.payload,
      };
    },
    updateConcernStats: (state, action) => {
      state.concernStats = {
        ...state.concernStats,
        ...action.payload,
      };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetAdminState: (state) => {
      return initialState;
    },
  },
});

export const {
  addDataAdmin,
  updateConcernStats,
  setLoading,
  setError,
  resetAdminState,
} = adminSlice.actions;

export default adminSlice.reducer;
