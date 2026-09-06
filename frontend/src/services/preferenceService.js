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


  updatePreferenceCycle: async (id, data) => {
    const response = await api.put(
      `/preferences/preference-cycles/${id}/`,
      data
    );

    return response.data;
  },


  deletePreferenceCycle: async (id) => {
    await api.delete(`/preferences/preference-cycles/${id}/`);
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


  updateFacultyPreference: async (id, data) => {
    const response = await api.put(
      `/preferences/faculty-preferences/${id}/`,
      data
    );

    return response.data;
  },


  deleteFacultyPreference: async (id) => {
    await api.delete(`/preferences/faculty-preferences/${id}/`);
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


  updatePreferredSection: async (id, data) => {
    const response = await api.put(
      `/preferences/preferred-sections/${id}/`,
      data
    );

    return response.data;
  },


  deletePreferredSection: async (id) => {
    await api.delete(`/preferences/preferred-sections/${id}/`);
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


  updatePreferredTimeSlot: async (id, data) => {
    const response = await api.put(
      `/preferences/preferred-time-slots/${id}/`,
      data
    );

    return response.data;
  },


  deletePreferredTimeSlot: async (id) => {
    await api.delete(`/preferences/preferred-time-slots/${id}/`);
  },


  getFacultyAvailability: async () => {
    const response = await api.get("/preferences/faculty-availability/");
    return response.data;
  },

  createFacultyAvailability: async (data) => {
    const response = await api.post("/preferences/faculty-availability/", data);
    return response.data;
  },

  updateFacultyAvailability: async (id, data) => {
    const response = await api.put(
      `/preferences/faculty-availability/${id}/`,
      data
    );

    return response.data;
  },

  deleteFacultyAvailability: async (id) => {
    await api.delete(`/preferences/faculty-availability/${id}/`);
  },

  getWorkloadPreferences: async () => {
    const response = await api.get("/preferences/workload-preferences/");
    return response.data;
  },

  createWorkloadPreference: async (data) => {
    const response = await api.post("/preferences/workload-preferences/", data);
    return response.data;
  },

  updateWorkloadPreference: async (id, data) => {
    const response = await api.put(
      `/preferences/workload-preferences/${id}/`,
      data
    );

    return response.data;
  },

  deleteWorkloadPreference: async (id) => {
    await api.delete(`/preferences/workload-preferences/${id}/`);
  },

};


export default preferenceService;
