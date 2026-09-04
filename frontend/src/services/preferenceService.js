import api from "../api/axios";


const preferenceService = {

  getPreferenceCycles: async () => {
    const response = await api.get(
      "/preferences/preference-cycles/"
    );

    return response.data;
  },


  createPreferenceCycle: async (data) => {
    const response = await api.post(
      "/preferences/preference-cycles/",
      data
    );

    return response.data;
  },


  getFacultyPreferences: async () => {
    const response = await api.get(
      "/preferences/faculty-preferences/"
    );

    return response.data;
  },


  createFacultyPreference: async (data) => {
    const response = await api.post(
      "/preferences/faculty-preferences/",
      data
    );

    return response.data;
  },


  getPreferredSections: async () => {
    const response = await api.get(
      "/preferences/preferred-sections/"
    );

    return response.data;
  },


  createPreferredSection: async (data) => {
    const response = await api.post(
      "/preferences/preferred-sections/",
      data
    );

    return response.data;
  },


  getPreferredTimeSlots: async () => {
    const response = await api.get(
      "/preferences/preferred-time-slots/"
    );

    return response.data;
  },


  createPreferredTimeSlot: async (data) => {
    const response = await api.post(
      "/preferences/preferred-time-slots/",
      data
    );

    return response.data;
  },

getFacultyAvailability: async () => {
    const response = await api.get("/preferences/faculty-availability/");
    return response.data;
  },

  createFacultyAvailability: async (data) => {
    const response = await api.post("/preferences/faculty-availability/", data);
    return response.data;
  },

  getWorkloadPreferences: async () => {
    const response = await api.get("/preferences/workload-preferences/");
    return response.data;
  },

  createWorkloadPreference: async (data) => {
    const response = await api.post("/preferences/workload-preferences/", data);
    return response.data;
  },

};


export default preferenceService;