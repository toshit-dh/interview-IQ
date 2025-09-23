import { axiosClient1 } from "./axios.js";

const UserApi = {
  register: (data) => axiosClient1.post("/users/register", data),
  login: (data) => axiosClient1.post("/users/login", data),
  verifyEmail: (token) => axiosClient1.get(`/users/verify-email/${token}`),
  getProfile: (id) => axiosClient1.get(`/users/${id}`),
  updateProfile: (data) =>
    axiosClient1.put("/users/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getFollowers: (id) => axiosClient1.get(`/users/${id}/followers`),
  getFollowing: (id) => axiosClient1.get(`/users/${id}/following`),
  follow: (id) => axiosClient1.post(`/users/${id}/follow`),
  unfollow: (id) => axiosClient1.post(`/users/${id}/unfollow`),
};

const StatsApi = {
  getUserStats: (userId) => axiosClient1.get(`/stats/${userId}`),
  updateUserStats: (userId, data) => axiosClient1.put(`/stats/${userId}`, data),
  getGlobalLeaderboard: () => axiosClient1.get(`/stats/leaderboard/global`),
  getPathLeaderboard: (pathId) =>
    axiosClient1.get(`/stats/leaderboard/path/${pathId}`),
};

const BadgeApi = {
  getAllBadges: () => axiosClient1.get(`/badges`),
  getBadgeById: (id) => axiosClient1.get(`/badges/${id}`),
  createBadge: (data) => axiosClient1.post(`/badges`, data),
  updateBadge: (id, data) => axiosClient1.put(`/badges/${id}`, data),
  deleteBadge: (id) => axiosClient1.delete(`/badges/${id}`),
};

export { UserApi, StatsApi, BadgeApi };