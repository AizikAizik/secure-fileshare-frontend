import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Backend URL
  withCredentials: true, // For cookies if needed
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("privateKey");
      // Dispatch custom event instead of window.location
      window.dispatchEvent(new CustomEvent("unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;
