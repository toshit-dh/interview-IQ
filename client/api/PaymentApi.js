// src/api/paymentApi.js
import { axiosClient1 } from "./axios.js";

const PaymentApi = {
  createTransaction: (data) => axiosClient1.post(`/payment`, data),
  getUserTransactions: (userId) => axiosClient1.get(`/payment/user/${userId}`),
  getTransactionById: (id) => axiosClient1.get(`/payment/${id}`),
  upgradePremiumPlan: (data) => axiosClient1.post(`/payment/upgrade`, data),
};

export default PaymentApi;
