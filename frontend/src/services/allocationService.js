import api from "../api/axios";

const allocationService = {
  getRuns: async () => {
    const response = await api.get("/allocation/runs/");
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
};

export default allocationService;