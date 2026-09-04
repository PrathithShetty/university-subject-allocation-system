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

  getSubjects: async () => {
    const response = await api.get("/subjects/");
    return response.data;
  },

  getSubjectOfferings: async () => {
    const response = await api.get("/subject-offerings/");
    return response.data;
  },
};

export default academicService;