// src/api/communityApi.js
import { axiosClient1 } from "./axios.js";

const CommunityApi = {
  // Friend Requests
  sendFriendRequest: (data) =>
    axiosClient1.post(`/community/friend-request`, data),
  getFriendRequests: (userId) =>
    axiosClient1.get(`/community/friend-request/${userId}`),
  acceptFriendRequest: (id) =>
    axiosClient1.post(`/community/friend-request/${id}/accept`),
  rejectFriendRequest: (id) =>
    axiosClient1.post(`/community/friend-request/${id}/reject`),

  // Activity
  getUserActivity: (userId) =>
    axiosClient1.get(`/community/activity/${userId}`),
};

export default CommunityApi;
