import api from "../api/axios";

const authService = {
  login: async (username, password) => {
    const response = await api.post("/accounts/login/", {
      username,
      password,
    });

    const { access, refresh } = response.data;

    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    return response.data;
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  getCurrentUser: async () => {
    const response = await api.get("/accounts/me/");
    return response.data;
  },

  isAuthenticated: () => {
    return Boolean(localStorage.getItem("access_token"));
  },

  getAccessToken: () => {
    return localStorage.getItem("access_token");
  },
};

export default authService;