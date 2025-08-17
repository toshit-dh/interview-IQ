// src/api/adminApi.js
import { axiosClient1 } from "./axios.js";

const AdminApi = {
  // -------- Paths --------
  getAllPaths: () => axiosClient1.get(`/paths`),
  getPathById: (id) => axiosClient1.get(`/paths/${id}`),
  createPath: (data) => axiosClient1.post(`/paths`, data),
  updatePath: (id, data) => axiosClient1.put(`/paths/${id}`, data),
  deletePath: (id) => axiosClient1.delete(`/paths/${id}`),

  // -------- Premium Plans --------
  getAllPlans: () => axiosClient1.get(`/premium`),
  getPlanById: (id) => axiosClient1.get(`/premium/${id}`),
  createPlan: (data) => axiosClient1.post(`/premium`, data),
  updatePlan: (id, data) => axiosClient1.put(`/premium/${id}`, data),
  deletePlan: (id) => axiosClient1.delete(`/premium/${id}`),
};

export default AdminApi;
