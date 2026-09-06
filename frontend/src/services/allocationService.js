import api from "../api/axios";

const allocationService = {
  getRuns: async () => {
    const response = await api.get("/allocation/runs/");
    return response.data;
  },

  createRun: async (data) => {
    const response = await api.post(
      "/allocation/runs/",
      data
    );

    return response.data;
  },

  getRunAllocations: async (runId) => {
    const response = await api.get(
      `/allocation/runs/${runId}/allocations/`
    );

    return response.data;
  },

  getRunConflicts: async (runId) => {
    const response = await api.get(
      `/allocation/runs/${runId}/conflicts/`
    );

    return response.data;
  },

  executeRun: async (runId, preferenceCycle) => {
    const response = await api.post(
      `/allocation/runs/${runId}/execute/`,
      {
        preference_cycle: preferenceCycle,
      }
    );

    return response.data;
  },

  getWorkloadDashboard: async ({ preferenceCycle, allocationRun } = {}) => {
    const params = {};

    if (preferenceCycle) {
      params.preference_cycle = preferenceCycle;
    }

    if (allocationRun) {
      params.allocation_run = allocationRun;
    }

    const response = await api.get(
      "/allocation/workload-dashboard/",
      { params }
    );

    return response.data;
  },
};

export default allocationService;