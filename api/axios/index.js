import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:2300/",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Attach token automatically for authenticated requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // get JWT from localStorage
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`; // attach token
    }
    return config;
  },
  (error) => {
    console.log("Request error: ", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
