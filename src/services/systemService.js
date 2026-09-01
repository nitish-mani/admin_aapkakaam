// ============================================================
// src/services/systemService.js
// ============================================================

import api from "./api";

const systemService = {
  // ----------------------------------------------------------
  // GET SYSTEM STATUS
  // ----------------------------------------------------------

  getSystemStatus: async () => {
    const response = await api.get("/admin/system/status");
    console.log("System status response:", response.data);
    return response.data;
  },

  // ----------------------------------------------------------
  // RESTART PROCESS GROUP
  // ----------------------------------------------------------

  restartProcess: async (processName) => {
    const response = await api.post(
      `/admin/system/restart/${encodeURIComponent(processName)}`,
    );

    return response.data;
  },

  // ----------------------------------------------------------
  // RESTART INDIVIDUAL PM2 INSTANCE
  // ----------------------------------------------------------

  restartInstance: async (processId) => {
    const response = await api.post(
      `/admin/system/restart-instance/${processId}`,
    );

    return response.data;
  },

  // ----------------------------------------------------------
  // RESTART PM2 PROCESS BY NAME (ALIAS)
  // ----------------------------------------------------------

  restartPm2Process: async (processName) => {
    const response = await api.post(
      `/admin/system/restart/${encodeURIComponent(processName)}`,
    );

    return response.data;
  },

  // ----------------------------------------------------------
  // RESTART PM2 INSTANCE BY ID (ALIAS)
  // ----------------------------------------------------------

  restartPm2Instance: async (processId) => {
    const response = await api.post(
      `/admin/system/restart-instance/${processId}`,
    );

    return response.data;
  },
};

export default systemService;
