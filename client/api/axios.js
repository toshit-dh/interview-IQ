// src/api/axiosClient.js
import axios from "axios";

// Create instances
const axiosClient1 = axios.create({
  baseURL: process.env.REACT_APP_SERVER1_DOMAIN, // Note: must start with REACT_APP_
  timeout: 10000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const axiosClient2 = axios.create({
  baseURL: process.env.REACT_APP_SERVER2_DOMAIN,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Reusable interceptor setup
const setupInterceptors = (client) => {
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response) {
        if (error.response.status === 401) {
          console.log("Unauthorized! Redirecting to login...");
          // maybe redirect to login
        }
      }
      return Promise.reject(error);
    }
  );
};

// Apply interceptors to both
setupInterceptors(axiosClient1);
setupInterceptors(axiosClient2);

// Export both
export { axiosClient1, axiosClient2 };
