// src/api/interviewApi.js
import { axiosClient1 } from "./axios.js";

const InterviewApi = {
  // Interviews
  createInterview: (data) => axiosClient1.post(`/interviews`, data),
  getInterviewById: (id) => axiosClient1.get(`/interviews/${id}`),
  getUserInterviews: (userId) => axiosClient1.get(`/interviews/user/${userId}`),

  // Feedback
  createFeedback: (data) => axiosClient1.post(`/interviews/feedback`, data),
  getFeedbackByInterview: (interviewId) =>
    axiosClient1.get(`/interviews/feedback/${interviewId}`),


  //paths
  getPaths: () => axiosClient1.get('path'),
  getModuleOfPath: (id) => axiosClient1.get(`/module/${id}`)
};

export default InterviewApi;
