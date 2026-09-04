import api from "../api/axios";

const facultyService = {

  getFaculties: async () => {
    const response = await api.get("/staff/faculties/");
    return response.data;
  },

  getFaculty: async (id) => {
    const response = await api.get(`/staff/faculties/${id}/`);
    return response.data;
  },

  createFaculty: async (data) => {
    const response = await api.post(
      "/staff/faculties/",
      data
    );

    return response.data;
  },

  updateFaculty: async (id, data) => {
    const response = await api.put(
      `/staff/faculties/${id}/`,
      data
    );

    return response.data;
  },

  deleteFaculty: async (id) => {
    const response = await api.delete(
      `/staff/faculties/${id}/`
    );

    return response.data;
  },

};

export default facultyService;