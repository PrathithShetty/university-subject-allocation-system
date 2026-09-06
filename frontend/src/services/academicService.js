import api from "../api/axios";

const academicService = {
  getAcademicYears: async () => {
    const response = await api.get("/academic-years/");
    return response.data;
  },

  getDepartments: async () => {
    const response = await api.get("/departments/");
    return response.data;
  },

  getPrograms: async () => {
    const response = await api.get("/programs/");
    return response.data;
  },

  getSemesters: async () => {
    const response = await api.get("/semesters/");
    return response.data;
  },

  getSections: async () => {
    const response = await api.get("/sections/");
    return response.data;
  },

  createSection: async (data) => {
    const response = await api.post("/sections/", data);
    return response.data;
  },

  updateSection: async (id, data) => {
    const response = await api.put(`/sections/${id}/`, data);
    return response.data;
  },

  deleteSection: async (id) => {
    await api.delete(`/sections/${id}/`);
  },

  getSubjects: async () => {
    const response = await api.get("/subjects/");
    return response.data;
  },

  createSubject: async (data) => {
    const response = await api.post("/subjects/", data);
    return response.data;
  },

  updateSubject: async (id, data) => {
    const response = await api.put(`/subjects/${id}/`, data);
    return response.data;
  },

  deleteSubject: async (id) => {
    await api.delete(`/subjects/${id}/`);
  },

  getSubjectOfferings: async () => {
    const response = await api.get("/subject-offerings/");
    return response.data;
  },

  createSubjectOffering: async (data) => {
    const response = await api.post("/subject-offerings/", data);
    return response.data;
  },

  updateSubjectOffering: async (id, data) => {
    const response = await api.put(`/subject-offerings/${id}/`, data);
    return response.data;
  },

  deleteSubjectOffering: async (id) => {
    await api.delete(`/subject-offerings/${id}/`);
  },
};

export default academicService;
