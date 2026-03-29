import api from './api';

export const approvalService = {
  getPendingApprovals: async () => {
    const response = await api.get('/approvals/pending');
    return response.data;
  },

  approveStep: async (id, comment) => {
    const response = await api.post(`/approvals/${id}/approve`, { comment });
    return response.data;
  },

  rejectStep: async (id, comment) => {
    const response = await api.post(`/approvals/${id}/reject`, { comment });
    return response.data;
  }
};
