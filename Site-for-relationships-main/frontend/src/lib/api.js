import axios from "axios";

const BACKEND_URL = "http://localhost:8000"; 
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      if (localStorage.getItem("tc_token")) {
        localStorage.removeItem("tc_token");
        if (window.location.pathname.startsWith("/app")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(err);
  }
);
