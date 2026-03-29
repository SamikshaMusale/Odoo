import api from './api';

export const userService = {
  createEmployeeOrManager: async (userData) => {
    // userData: { name, email, password, role, companyId, managerId }
    const response = await api.post('/users', userData);
    return response.data;
  },

  getAllCompanyUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  assignManager: async (userId, managerId) => {
    const response = await api.patch(`/users/${userId}/assign-manager`, { managerId });
    return response.data;
  }
};
